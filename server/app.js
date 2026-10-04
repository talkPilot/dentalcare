import express from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import multer from "multer";
import sharp from "sharp";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { clinic } from "./clinic.js";
import { parseLead, PublicError } from "./validation.js";
import { makeProviders } from "./providers.js";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export function createApp({
  env = process.env,
  providers,
  skipRateLimit = false,
} = {}) {
  const settings = { ...env, LEAD_EMAIL: env.LEAD_EMAIL || clinic.email };
  const integration = providers || makeProviders(settings);
  const app = express();
  app.disable("x-powered-by");
  if (env.TRUST_PROXY_HOPS)
    app.set("trust proxy", Number(env.TRUST_PROXY_HOPS));
  app.use(
    helmet({
      contentSecurityPolicy:
        env.NODE_ENV === "production"
          ? {
              directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "https://challenges.cloudflare.com"],
                frameSrc: ["https://challenges.cloudflare.com"],
                imgSrc: ["'self'", "data:", "blob:"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                connectSrc: ["'self'", "https://challenges.cloudflare.com"],
                fontSrc: ["'self'"],
                upgradeInsecureRequests: [],
              },
            }
          : false,
    }),
  );
  app.use("/api", (_req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });
  const allowedOrigins = new Set(
    (env.ALLOWED_ORIGINS || env.PUBLIC_ORIGIN || "http://127.0.0.1:5173")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  );
  app.use("/api", (req, res, next) => {
    const origin = req.get("origin");
    if (origin && allowedOrigins.has(origin)) {
      res.set("Access-Control-Allow-Origin", origin);
      res.vary("Origin");
      res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.set("Access-Control-Allow-Headers", "Content-Type");
    }
    if (req.method === "OPTIONS") {
      return res.status(origin && allowedOrigins.has(origin) ? 204 : 403).end();
    }
    next();
  });
  app.use(express.json({ limit: "12kb" }));
  const productionReady =
    env.NODE_ENV !== "production" ||
    Boolean(
      env.TURNSTILE_SECRET_KEY &&
      env.TURNSTILE_SITE_KEY &&
      env.PUBLIC_ORIGIN &&
      env.PRIVACY_REVIEWED === "true",
    );
  const contactReady = Boolean(
    settings.RESEND_API_KEY &&
    settings.MAIL_FROM &&
    settings.LEAD_EMAIL &&
    productionReady,
  );
  const smileReady = Boolean(contactReady && settings.OPENAI_API_KEY);
  app.get("/api/config", (_req, res) =>
    res.json({
      smileReady,
      contactReady,
      phone: clinic.phone,
      secondaryPhone: clinic.secondaryPhone,
      whatsapp: clinic.whatsapp,
      address: clinic.branches
        .map((b) => `${b.address}, ${b.city}`)
        .join(" | "),
      branches: clinic.branches,
      email: clinic.email,
      turnstileSiteKey: env.TURNSTILE_SITE_KEY || "",
      offerApproved: env.OFFER_APPROVED === "true",
    }),
  );
  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.use("/api", (req, res, next) => {
    if (req.method === "GET") return next();
    const origin = req.get("origin");
    if (
      (env.NODE_ENV === "production" && !origin) ||
      (origin && !allowedOrigins.has(origin))
    )
      return res.status(403).json({ error: "הבקשה אינה מגיעה מהאתר המורשה." });
    next();
  });
  if (!skipRateLimit)
    app.use(
      "/api",
      rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 15,
        standardHeaders: "draft-8",
        legacyHeaders: false,
        skip: (req) => req.method === "GET",
        message: {
          error: "בוצעו פניות רבות בזמן קצר. אפשר לנסות שוב בעוד רבע שעה.",
        },
      }),
    );
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024,
      files: 3,
      fields: 12,
      fieldSize: 5000,
      parts: 16,
    },
    fileFilter: (_req, file, cb) => {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype))
        return cb(new PublicError("ניתן להעלות רק תמונות JPG, PNG או WebP."));
      cb(null, true);
    },
  });
  const jobs = new Map();
  let active = 0;
  let budgetDate = "";
  let generatedToday = 0;
  const ttl = 15 * 60 * 1000;
  const cleanJobs = () => {
    const now = Date.now();
    for (const [key, value] of jobs)
      if (!value.pending && now - value.createdAt > ttl) jobs.delete(key);
  };
  const cleanupTimer = setInterval(cleanJobs, 60_000);
  cleanupTimer.unref();
  const ready = (kind) => (_req, _res, next) =>
    next(
      (kind === "smile" ? smileReady : contactReady)
        ? undefined
        : new PublicError(
            "השירות עדיין אינו פעיל. לא נשלחו פרטים. ניתן לפנות למרפאה בטלפון.",
            503,
          ),
    );
  async function checkChallenge(req, lead) {
    if (!(await integration.verifyChallenge(lead.token, req.ip)))
      throw new PublicError("אימות האבטחה לא הושלם. נסו שוב.", 400);
  }
  async function idempotent(key, fingerprint, run) {
    cleanJobs();
    const existing = jobs.get(key);
    if (existing) {
      if (existing.fingerprint !== fingerprint)
        throw new PublicError("הפרטים השתנו. יש להתחיל פנייה חדשה.", 409);
      return existing.promise;
    }
    if (jobs.size >= 30)
      throw new PublicError(
        "השירות עמוס כרגע. אפשר לנסות שוב בעוד כמה דקות.",
        503,
      );
    const job = { fingerprint, createdAt: Date.now(), pending: true };
    job.promise = Promise.resolve()
      .then(run)
      .then((value) => ({ status: 200, body: value }))
      .catch((error) => ({
        status: error.status || 502,
        body: {
          error:
            error instanceof PublicError
              ? error.message
              : "אירעה תקלה זמנית. אפשר לפנות למרפאה בטלפון.",
        },
      }))
      .finally(() => {
        job.pending = false;
        job.createdAt = Date.now();
      });
    jobs.set(key, job);
    return job.promise;
  }
  function fingerprint(lead, buffers = []) {
    const hash = createHash("sha256").update(
      JSON.stringify({
        name: lead.name,
        phone: lead.phone,
        treatment: lead.treatment,
        region: lead.region,
        message: lead.message,
      }),
    );
    buffers.forEach((b) => hash.update(b));
    return hash.digest("hex");
  }
  app.post("/api/contact", ready("contact"), async (req, res, next) => {
    try {
      const lead = parseLead(req.body);
      await checkChallenge(req, lead);
      const result = await idempotent(
        `contact:${lead.requestId}`,
        fingerprint(lead),
        async () => {
          await integration.sendMail({ lead, phase: "contact" });
          return { ok: true };
        },
      );
      res.status(result.status).json(result.body);
    } catch (error) {
      next(error);
    }
  });
  app.post(
    "/api/smile",
    ready("smile"),
    (req, res, next) => {
      if (active >= Number(env.MAX_ACTIVE_SMILE_JOBS || 2))
        return next(
          new PublicError(
            "הסטודיו מטפל כרגע בחיוכים נוספים. נסו שוב בעוד כמה דקות.",
            503,
          ),
        );
      active++;
      let released = false;
      const release = () => {
        if (!released) {
          active--;
          released = true;
        }
      };
      res.locals.releaseSmileSlot = release;
      res.once("finish", release);
      res.once("close", () => {
        // Keep the slot while paid work continues after a browser disconnects.
        if (!res.locals.smileWorkStarted) release();
      });
      next();
    },
    upload.array("photos", 3),
    async (req, res, next) => {
      res.locals.smileWorkStarted = true;
      try {
        const lead = parseLead(req.body);
        if (lead.treatment === "consultation")
          throw new PublicError("יש לבחור טיפול להדמיה.");
        if (!req.files?.length) throw new PublicError("נדרשת לפחות תמונה אחת.");
        await checkChallenge(req, lead);
        const photos = [];
        for (const file of req.files) {
          try {
            const image = sharp(file.buffer, {
              limitInputPixels: 25_000_000,
              failOn: "warning",
            });
            const metadata = await image.metadata();
            if (
              !["jpeg", "png", "webp"].includes(metadata.format) ||
              metadata.pages > 1 ||
              metadata.width < 200 ||
              metadata.height < 200
            )
              throw new Error("invalid");
            photos.push(
              await image
                .rotate()
                .resize({
                  width: 1600,
                  height: 1600,
                  fit: "inside",
                  withoutEnlargement: true,
                })
                .jpeg({ quality: 90 })
                .toBuffer(),
            );
          } catch {
            throw new PublicError(
              "אחת התמונות אינה תקינה. בחרו תמונה בגודל 200×200 לפחות ועד 25 מיליון פיקסלים.",
            );
          }
        }
        const result = await idempotent(
          `smile:${lead.requestId}`,
          fingerprint(lead, photos),
          async () => {
            const today = new Date().toISOString().slice(0, 10);
            if (budgetDate !== today) {
              budgetDate = today;
              generatedToday = 0;
            }
            if (
              generatedToday + photos.length >
              Number(env.MAX_DAILY_IMAGES || 30)
            )
              throw new PublicError(
                "מכסת ההדמיות להיום הושלמה. אפשר להשאיר פנייה רגילה ונחזור אליך.",
                429,
              );
            generatedToday += photos.length;
            await integration.sendMail({ lead, photos, phase: "smile" });
            const generated = await Promise.allSettled(
              photos.map((_, targetIndex) =>
                integration.generate({
                  photos,
                  treatment: lead.treatment,
                  targetIndex,
                }),
              ),
            );
            const results = [];
            for (let i = 0; i < generated.length; i++) {
              const value = generated[i];
              if (value.status === "fulfilled") {
                try {
                  const buffer = await sharp(value.value, {
                    limitInputPixels: 16_000_000,
                  })
                    .resize({
                      width: 1200,
                      height: 1200,
                      fit: "inside",
                      withoutEnlargement: true,
                    })
                    .png()
                    .toBuffer();
                  results.push({ index: i, buffer });
                } catch {
                  /* Reject malformed provider output without leaking upstream data. */
                }
              }
            }
            if (!results.length)
              throw new PublicError(
                "הפרטים והתמונות נשלחו למרפאה, אך ההדמיה לא הושלמה. הצוות יוכל לעזור לך בהמשך.",
                502,
              );
            let warning =
              results.length < photos.length
                ? "חלק מההדמיות לא הושלמו. הפרטים והתוצאות הזמינות נשלחו למרפאה."
                : "";
            try {
              await integration.sendMail({
                lead,
                results: results.map((r) => r.buffer),
                phase: "result",
              });
            } catch {
              warning =
                "הפרטים והתמונות המקוריות נשלחו למרפאה, אך שליחת ההדמיה במייל לא הצליחה. אפשר לשמור אותה מהמכשיר.";
            }
            return {
              results: results.map((r) => ({
                index: r.index,
                image: `data:image/png;base64,${r.buffer.toString("base64")}`,
              })),
              warning,
            };
          },
        );
        if (!res.destroyed) res.status(result.status).json(result.body);
      } catch (error) {
        next(error);
      } finally {
        res.locals.releaseSmileSlot();
      }
    },
  );
  app.use("/api", (_req, res) =>
    res.status(404).json({ error: "הכתובת אינה קיימת." }),
  );
  if (env.NODE_ENV === "production") {
    app.use(express.static(path.join(root, "dist"), { maxAge: "1h" }));
    app.get("/{*splat}", (_req, res) =>
      res.sendFile(path.join(root, "dist", "index.html")),
    );
  }
  app.use((err, _req, res, _next) => {
    if (err instanceof multer.MulterError)
      return res
        .status(400)
        .json({ error: "ניתן להעלות 1–3 תמונות, עד 10MB לכל תמונה." });
    if (err instanceof PublicError)
      return res.status(err.status).json({ error: err.message });
    if (err.type === "entity.too.large")
      return res.status(413).json({ error: "הבקשה גדולה מדי." });
    if (err instanceof SyntaxError)
      return res.status(400).json({ error: "הבקשה אינה תקינה." });
    res.status(500).json({ error: "אירעה תקלה זמנית. נסו שוב מאוחר יותר." });
  });
  return app;
}
