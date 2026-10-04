import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { createApp } from "../server/app.js";
import { makeProviders } from "../server/providers.js";
const photo = await sharp({
  create: { width: 300, height: 300, channels: 3, background: "#abc" },
})
  .jpeg()
  .toBuffer();
const lead = (extra = {}) => ({
  name: "בדיקת מערכת",
  phone: "0501234567",
  treatment: "veneers",
  consent: "true",
  requestId: randomUUID(),
  ...extra,
});
const env = {
  RESEND_API_KEY: "test-not-real",
  MAIL_FROM: "test@example.com",
  OPENAI_API_KEY: "test-not-real",
};
function setup(overrides = {}, settings = env) {
  const calls = { mail: [], generated: 0 };
  const providers = {
    verifyChallenge: async () => true,
    sendMail: async (params) => {
      calls.mail.push(params);
      return "test-mail-id";
    },
    generate: async () => {
      calls.generated++;
      return photo;
    },
    ...overrides,
  };
  return {
    app: createApp({ env: settings, providers, skipRateLimit: true }),
    calls,
  };
}
function upload(app, data, count = 1, buffer = photo) {
  let req = request(app).post("/api/smile");
  for (const [key, value] of Object.entries(data)) req = req.field(key, value);
  for (let i = 0; i < count; i++)
    req = req.attach("photos", buffer, `test-${i}.jpg`);
  return req;
}
test("missing secrets keep forms inactive and expose no keys", async () => {
  const { app } = setup({}, {});
  const config = await request(app).get("/api/config");
  assert.equal(config.body.smileReady, false);
  assert.equal(config.body.contactReady, false);
  assert.equal(config.body.phone, "052-5212118");
  assert.equal(config.body.branches.length, 2);
  assert(!JSON.stringify(config.body).includes("API_KEY"));
  assert.equal(
    (await request(app).post("/api/contact").send(lead())).status,
    503,
  );
});
test("production remains closed until origin, anti-bot and privacy configuration are set", async () => {
  const { app } = setup({}, { ...env, NODE_ENV: "production" });
  assert.equal((await request(app).get("/api/config")).body.smileReady, false);
});
test("production can explicitly run without Turnstile but partial configuration remains closed", async () => {
  const configured = {
    ...env, NODE_ENV: "production", PUBLIC_ORIGIN: "https://dental-care24.com",
    PRIVACY_REVIEWED: "true", ALLOW_WITHOUT_TURNSTILE: "true",
  };
  const { app } = setup({}, configured);
  assert.equal((await request(app).get("/api/config")).body.smileReady, true);
  assert.equal(await makeProviders(configured).verifyChallenge("", "127.0.0.1"), true);
  const partial = {...configured, TURNSTILE_SITE_KEY: "site-only"};
  assert.equal((await request(setup({}, partial).app).get("/api/config")).body.smileReady, false);
  assert.equal(await makeProviders(partial).verifyChallenge("", "127.0.0.1"), false);
  assert.equal(await makeProviders({...configured, ALLOW_WITHOUT_TURNSTILE: "false"}).verifyChallenge("", "127.0.0.1"), false);
  assert.equal((await request(app).post("/api/contact").set("Origin", "https://evil.example").send(lead())).status, 403);
});
test("invalid phone and missing consent are rejected", async () => {
  const { app, calls } = setup();
  for (const extra of [{ phone: "abc" }, { consent: "false" }, { name: "a" }])
    assert.equal(
      (await request(app).post("/api/contact").send(lead(extra))).status,
      400,
    );
  assert.equal(calls.mail.length, 0);
});
test("contact form validates, sends once and safely replays duplicate requests", async () => {
  const { app, calls } = setup();
  const data = lead();
  const [a, b] = await Promise.all([
    request(app).post("/api/contact").send(data),
    request(app).post("/api/contact").send(data),
  ]);
  assert.equal(a.status, 200);
  assert.equal(b.status, 200);
  assert.equal(calls.mail.length, 1);
  assert.equal(
    (
      await request(app)
        .post("/api/contact")
        .send({ ...data, name: "שם שונה" })
    ).status,
    409,
  );
});
test("foreign origins, honeypot and failed anti-bot are rejected", async () => {
  const { app } = setup();
  assert.equal(
    (
      await request(app)
        .post("/api/contact")
        .set("Origin", "https://foreign.example")
        .send(lead())
    ).status,
    403,
  );
  assert.equal(
    (
      await request(app)
        .post("/api/contact")
        .send(lead({ website: "spam" }))
    ).status,
    400,
  );
  const blocked = setup({ verifyChallenge: async () => false }).app;
  assert.equal(
    (await request(blocked).post("/api/contact").send(lead())).status,
    400,
  );
});
test("three photos produce three results and send originals and results to the clinic", async () => {
  const { app, calls } = setup();
  const data = lead();
  const response = await upload(app, data, 3);
  assert.equal(response.status, 200);
  assert.equal(response.body.results.length, 3);
  assert.deepEqual(
    response.body.results.map((x) => x.index),
    [0, 1, 2],
  );
  assert.equal(calls.generated, 3);
  assert.equal(calls.mail.length, 2);
  assert.equal(calls.mail[0].photos.length, 3);
  assert.equal(calls.mail[1].results.length, 3);
  const repeated = await upload(app, data, 3);
  assert.equal(repeated.status, 200);
  assert.equal(calls.generated, 3);
  assert.equal(calls.mail.length, 2);
});
test("one image works; empty, malformed and fourth image fail before provider calls", async () => {
  const { app, calls } = setup();
  assert.equal((await upload(app, lead(), 0)).status, 400);
  assert.equal((await upload(app, lead(), 4)).status, 400);
  assert.equal(
    (await upload(app, lead(), 1, Buffer.from("not an image"))).status,
    400,
  );
  assert.equal(calls.generated, 0);
  assert.equal((await upload(app, lead(), 1)).status, 200);
});
test("mail failure never triggers billed generation", async () => {
  const { app, calls } = setup({
    sendMail: async () => {
      throw new Error("provider failure");
    },
  });
  assert.equal((await upload(app, lead())).status, 502);
  assert.equal(calls.generated, 0);
});
test("generation failure reports that lead was sent without inventing a result", async () => {
  const { app, calls } = setup({
    generate: async () => {
      throw new Error("upstream unavailable");
    },
  });
  const response = await upload(app, lead());
  assert.equal(response.status, 502);
  assert.match(response.body.error, /נשלחו/);
  assert.equal(response.body.results, undefined);
  assert.equal(calls.mail.length, 1);
});
test("partial generation returns only completed angles", async () => {
  const { app } = setup({
    generate: async ({ targetIndex }) => {
      if (targetIndex === 1) throw new Error("failed");
      return photo;
    },
  });
  const response = await upload(app, lead(), 3);
  assert.equal(response.status, 200);
  assert.deepEqual(
    response.body.results.map((x) => x.index),
    [0, 2],
  );
  assert.match(response.body.warning, /חלק/);
});
test("result mail failure preserves downloadable result and is disclosed", async () => {
  const { app } = setup({
    sendMail: async ({ phase }) => {
      if (phase === "result") throw new Error("mail");
      return "test";
    },
  });
  const response = await upload(app, lead());
  assert.equal(response.status, 200);
  assert.equal(response.body.results.length, 1);
  assert.match(response.body.warning, /לא הצליחה/);
});
test("daily quota blocks extra image costs", async () => {
  const { app, calls } = setup({}, { ...env, MAX_DAILY_IMAGES: "1" });
  assert.equal((await upload(app, lead())).status, 200);
  assert.equal((await upload(app, lead())).status, 429);
  assert.equal(calls.generated, 1);
});
test("provider request uses real image edits contract and keeps credentials on server", async () => {
  let requestBody;
  const provider = makeProviders(env, async (url, options) => {
    assert.equal(url, "https://api.openai.com/v1/images/edits");
    requestBody = options.body;
    return {
      ok: true,
      json: async () => ({ data: [{ b64_json: photo.toString("base64") }] }),
    };
  });
  const output = await provider.generate({
    photos: [photo, photo],
    treatment: "veneers",
    targetIndex: 1,
  });
  assert.equal(requestBody.getAll("image[]").length, 2);
  assert.equal(requestBody.get("model"), "gpt-image-2.5-sunburst");
  assert.match(requestBody.get("prompt"), /Change ONLY/);
  assert(Buffer.isBuffer(output));
});

test("separate frontend origins get scoped CORS preflight without wildcard access", async () => {
  const { app } = setup(
    {},
    {
      ...env,
      ALLOWED_ORIGINS:
        "https://dental-care24.com,https://www.dental-care24.com",
    },
  );
  const allowed = await request(app)
    .options("/api/contact")
    .set("Origin", "https://dental-care24.com")
    .set("Access-Control-Request-Method", "POST");
  assert.equal(allowed.status, 204);
  assert.equal(
    allowed.headers["access-control-allow-origin"],
    "https://dental-care24.com",
  );
  const rejected = await request(app)
    .options("/api/contact")
    .set("Origin", "https://foreign.example");
  assert.equal(rejected.status, 403);
  assert.equal(rejected.headers["access-control-allow-origin"], undefined);
});
