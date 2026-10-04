import { PublicError, treatmentLabels } from "./validation.js";
export function makeProviders(env, fetcher = fetch) {
  async function sendMail({ lead, photos = [], results = [], phase }) {
    const subject =
      phase === "result"
        ? "הדמיית חיוך מוכנה — דנטל קר 24"
        : phase === "smile"
          ? "פנייה חדשה להדמיית חיוך — דנטל קר 24"
          : "פנייה חדשה מהאתר — דנטל קר 24";
    const text = [
      subject,
      `שם: ${lead.name}`,
      `טלפון: ${lead.phone}`,
      `טיפול: ${treatmentLabels[lead.treatment]}`,
      lead.region && `אזור: ${lead.region}`,
      lead.message && `הודעה: ${lead.message}`,
      `מספר פנייה: ${lead.requestId}`,
      `זמן: ${new Date().toISOString()}`,
      "נמסרה הסכמה להעברת הפרטים למרפאה.",
      phase === "smile" ? "התמונות מצורפות; יצירת ההדמיה מתחילה כעת." : "",
      phase === "result"
        ? "התמונות הן הדמיות AI אסתטיות בלבד, ואינן תוכנית טיפול או הבטחה לתוצאה."
        : "",
    ]
      .filter(Boolean)
      .join("\n");
    const attachments = [
      ...photos.map((p, i) => ({
        filename: `smile-original-${i + 1}.jpg`,
        content: p.toString("base64"),
      })),
      ...results.map((p, i) => ({
        filename: `smile-ai-preview-${i + 1}.png`,
        content: p.toString("base64"),
      })),
    ];
    const response = await fetcher("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `dental-${lead.requestId}-${phase}`,
      },
      body: JSON.stringify({
        from: env.MAIL_FROM,
        to: [env.LEAD_EMAIL],
        subject,
        text,
        ...(attachments.length ? { attachments } : {}),
      }),
      signal: AbortSignal.timeout(25000),
    });
    if (!response.ok)
      throw new PublicError(
        "לא הצלחנו לשלוח את הפנייה למרפאה. אפשר לפנות אלינו בטלפון או לנסות שוב מאוחר יותר.",
        502,
      );
    const payload = await response.json();
    if (!payload.id)
      throw new PublicError(
        "לא התקבל אישור לשליחת הפנייה. אפשר לפנות למרפאה בטלפון.",
        502,
      );
    return payload.id;
  }
  async function generate({ photos, treatment, targetIndex = 0 }) {
    const form = new FormData();
    form.append("model", env.OPENAI_IMAGE_MODEL || "gpt-image-2.5-sunburst");
    form.append("size", "1024x1024");
    form.append("quality", "high");
    form.append("output_format", "png");
    form.append(
      "prompt",
      `Create a conservative photorealistic cosmetic dental smile visualization of the adult person in the FIRST image. The other images, if present, are reference angles of the SAME person. Return exactly one image matching the first input's camera angle, framing, pose, lighting and expression. Preserve identity, face geometry, eyes, eyebrows, skin texture, age, nose, hair, lips, gums, clothes and background. Change ONLY the visible teeth inside the existing smile. Interest: ${treatmentLabels[treatment]}. Show subtly more harmonious tooth proportions and natural ivory enamel, with realistic translucency, highlights and individual character. Do not whiten skin, enlarge the smile, beautify the face or make cartoon-perfect teeth. No collage, comparison panels, added objects or text. This is an illustrative cosmetic preview, never a clinical treatment prediction.`,
    );
    const ordered = [
      photos[targetIndex],
      ...photos.filter((_, i) => i !== targetIndex),
    ];
    ordered.forEach((buffer, i) =>
      form.append(
        "image[]",
        new Blob([buffer], { type: "image/jpeg" }),
        `reference-${i + 1}.jpg`,
      ),
    );
    const response = await fetcher("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}` },
      body: form,
      signal: AbortSignal.timeout(180000),
    });
    if (!response.ok)
      throw new PublicError(
        "הפנייה והתמונות נשלחו למרפאה, אך יצירת ההדמיה לא הושלמה. הצוות יוכל לעזור לך בהמשך.",
        502,
      );
    const payload = await response.json();
    const base64 = payload.data?.[0]?.b64_json;
    if (typeof base64 !== "string" || base64.length > 20_000_000)
      throw new PublicError(
        "הפנייה נשלחה, אך לא התקבלה הדמיה תקינה. ניתן להמשיך בשיחה עם המרפאה.",
        502,
      );
    return Buffer.from(base64, "base64");
  }
  async function verifyChallenge(token, ip) {
    if (!env.TURNSTILE_SECRET_KEY) return env.NODE_ENV !== "production";
    const response = await fetcher(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: env.TURNSTILE_SECRET_KEY,
          response: token,
          remoteip: ip,
        }),
        signal: AbortSignal.timeout(10000),
      },
    );
    const payload = await response.json();
    return (
      payload.success === true &&
      (!env.PUBLIC_ORIGIN ||
        payload.hostname === new URL(env.PUBLIC_ORIGIN).hostname)
    );
  }
  return { sendMail, generate, verifyChallenge };
}
