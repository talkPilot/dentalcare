import { newRequestId } from "../requestId";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Download,
  ImagePlus,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { treatments } from "../content";
import { apiUrl } from "../api";
export type Config = {
  smileReady: boolean;
  contactReady: boolean;
  phone: string;
  whatsapp: string;
  address: string;
  turnstileSiteKey: string;
  offerApproved: boolean;
  secondaryPhone?: string;
  email?: string;
  branches?: { city: string; address: string; mapQuery: string }[];
};
declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      remove: (id: string) => void;
      reset: (id: string) => void;
    };
  }
}
export function Challenge({
  siteKey,
  onToken,
  resetKey = 0,
}: {
  siteKey: string;
  onToken: (v: string) => void;
  resetKey?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const callback = useRef(onToken);
  callback.current = onToken;
  useEffect(() => {
    if (!siteKey) return;
    let widget: string | undefined;
    let cancelled = false;
    const render = () => {
      if (!cancelled && ref.current && window.turnstile && widget === undefined)
        widget = window.turnstile.render(ref.current, {
          sitekey: siteKey,
          callback: (t: string) => callback.current(t),
          "expired-callback": () => callback.current(""),
          "error-callback": () => callback.current(""),
          language: "he",
        });
    };
    let script = document.querySelector<HTMLScriptElement>("#turnstile-script");
    if (!script) {
      script = document.createElement("script");
      script.id = "turnstile-script";
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      document.head.append(script);
    }
    script.addEventListener("load", render);
    render();
    return () => {
      cancelled = true;
      script?.removeEventListener("load", render);
      if (widget && window.turnstile) window.turnstile.remove(widget);
    };
  }, [siteKey, resetKey]);
  return <div ref={ref} className="challenge" />;
}
export function Compare({ before, after }: { before: string; after: string }) {
  const [position, setPosition] = useState(50);
  return (
    <div className="compare">
      <img src={before} alt="התמונה המקורית שלך" />
      <img
        className="compare-after"
        src={after}
        alt="הדמיית חיוך שנוצרה בבינה מלאכותית"
        style={{ clipPath: `inset(0 0 0 ${position}%)` }}
      />
      <span className="compare-label before-label">התמונה שלך</span>
      <span className="compare-label after-label">הדמיית AI</span>
      <div className="compare-line" style={{ left: `${position}%` }}>
        <span>↔</span>
      </div>
      <input
        aria-label="השוואת תמונה מקורית להדמיה"
        type="range"
        min="0"
        max="100"
        value={position}
        onChange={(e) => setPosition(+e.target.value)}
      />
    </div>
  );
}
export default function SmileLab({ config }: { config: Config | null }) {
  const [step, setStep] = useState(1),
    [name, setName] = useState(""),
    [phone, setPhone] = useState(""),
    [treatment, setTreatment] = useState("veneers"),
    [region, setRegion] = useState(""),
    [files, setFiles] = useState<File[]>([]),
    [previews, setPreviews] = useState<string[]>([]),
    [consent, setConsent] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [results, setResults] = useState<{ index: number; image: string }[]>([]),
    [activeResult, setActiveResult] = useState(0),
    [notice, setNotice] = useState(""),
    [token, setToken] = useState(""),
    [resetKey, setResetKey] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const previousStep = useRef(step);
  const requestId = useRef(newRequestId());
  useEffect(() => {
    if (previousStep.current === step) return;
    previousStep.current = step;
    panel.current?.focus({ preventScroll: true });
    panel.current?.scrollIntoView({
      block: "start",
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }, [step]);
  useEffect(() => {
    requestId.current = newRequestId();
  }, [name, phone, treatment, region]);
  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [files]);
  function addFiles(list: FileList | null) {
    if (!list) return;
    const incoming = Array.from(list);
    if (
      incoming.some(
        (f) =>
          !["image/jpeg", "image/png", "image/webp"].includes(f.type) ||
          f.size > 10 * 1024 * 1024,
      )
    ) {
      setError("בחרו תמונות JPG, PNG או WebP בלבד, עד 10MB לתמונה.");
      return;
    }
    if (files.length + incoming.length > 3) {
      setError("אפשר להעלות עד 3 תמונות. הסירו תמונה כדי להחליף אותה.");
      return;
    }
    setFiles([...files, ...incoming]);
    setError("");
    requestId.current = newRequestId();
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!files.length) {
      setError("יש להעלות לפחות תמונה אחת.");
      return;
    }
    if (!consent) {
      setError("נדרשת הסכמה לעיבוד התמונות ושליחת הפנייה.");
      return;
    }
    if (!config?.smileReady) {
      setError(
        "הדמיה אישית תהיה זמינה לאחר חיבור השירות. לא נשלחו תמונות או פרטים.",
      );
      return;
    }
    setBusy(true);
    setError("");
    const data = new FormData();
    Object.entries({
      name,
      phone,
      treatment,
      region,
      consent: "true",
      token,
      requestId: requestId.current,
    }).forEach(([k, v]) => data.append(k, v));
    files.forEach((f) => data.append("photos", f));
    try {
      const res = await fetch(apiUrl("/api/smile"), {
        method: "POST",
        body: data,
        signal: AbortSignal.timeout(240000),
      });
      const body = await res.json();
      if (!res.ok)
        throw new Error(
          body.error || "לא הצלחנו להשלים את ההדמיה. נסו שוב מאוחר יותר.",
        );
      setResults(body.results);
      setActiveResult(0);
      setNotice(body.warning || "הפרטים וההדמיה נשלחו לצוות המרפאה.");
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "אירעה תקלה. נסו שוב.");
    } finally {
      setBusy(false);
      setToken("");
      setResetKey((k) => k + 1);
    }
  }
  return (
    <section className="lab section" id="smile-lab">
      <div className="lab-heading">
        <span className="eyebrow light">
          <span className="live-dot" /> THE SMILE LAB
        </span>
        <h2>
          אפשר כבר
          <br />
          לדמיין <em>את זה.</em>
        </h2>
        <p>
          לפעמים כל מה שצריך כדי להתחיל,
          <br />
          זה לראות אפשרות חדשה.
        </p>
        <div className="lab-perks">
          <span>
            <Check size={17} /> החיוך שלך, בכיוון חדש
          </span>
          <span>
            <Check size={17} /> תמונה אחת עד שלוש תמונות
          </span>
          <span>
            <Check size={17} /> השוואה אישית לפני ואחרי
          </span>
        </div>
        <div className="lab-portrait">
          <img
            src="/images/smile-hero.webp"
            loading="lazy"
            alt="צילום קונספט של חיוך טבעי"
          />
          <div className="face-reticle">
            <i />
            <i />
            <i />
            <i />
          </div>
          <span className="portrait-caption">
            A LITTLE PREVIEW. A NEW POSSIBILITY.
          </span>
          <span className="concept-label">צילום קונספט • לא תוצאת טיפול</span>
        </div>
      </div>
      <div
        className="lab-panel"
        ref={panel}
        tabIndex={-1}
        aria-label="סטודיו הדמיית חיוך"
      >
        <div className="lab-panel-top">
          <span className="mini-logo">
            <Sparkles size={18} /> Smile Studio
          </span>
          <span className="pill">הדמיה אישית</span>
        </div>
        <div className="steps" aria-label={`שלב ${step} מתוך 3`}>
          {["קצת עליך", "החיוך שלך", "רגע של גילוי"].map((label, i) => (
            <div key={label} className={step >= i + 1 ? "active" : ""}>
              <span>
                {step > i + 1 ? (
                  <Check size={13} />
                ) : (
                  String(i + 1).padStart(2, "0")
                )}
              </span>
              {label}
            </div>
          ))}
        </div>
        {busy ? (
          <div className="generating" role="status" aria-live="polite">
            <div className="orb">
              <Sparkles size={40} />
            </div>
            <h3>מפנים מקום לחיוך חדש.</h3>
            <p>
              ההדמיה שלך נוצרת עכשיו.
              <br />
              זה עשוי לקחת כמה דקות — אפשר להישאר כאן.
            </p>
            <div className="indeterminate" />
            <span>מעבדים את התמונה תוך התמקדות בחיוך</span>
          </div>
        ) : step === 1 ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (
                !/^(?:0[2-9]\d{7,8}|\+972[2-9]\d{7,8})$/.test(
                  phone.replace(/[\s-]/g, ""),
                )
              ) {
                setError("יש להזין מספר טלפון ישראלי תקין.");
                return;
              }
              setError("");
              setStep(2);
            }}
          >
            <h3>נעים להכיר את החיוך שלך.</h3>
            <p className="muted">כמה פרטים קטנים, ומתחילים.</p>
            <label>
              שם מלא
              <input
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                maxLength={80}
                placeholder="איך קוראים לך?"
              />
            </label>
            <label>
              מספר טלפון
              <input
                type="tel"
                dir="ltr"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                maxLength={20}
                placeholder="050-000-0000"
              />
            </label>
            <label>
              אזור מגורים <span className="optional">(לא חובה)</span>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                <option value="">בחירת אזור</option>
                {[
                  "תל אביב והמרכז",
                  "ירושלים",
                  "חיפה והצפון",
                  "השרון",
                  "באר שבע והדרום",
                  "אחר",
                ].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            <fieldset>
              <legend>מה היית רוצה לשנות?</legend>
              <div className="treatment-options">
                {treatments.map((t) => (
                  <button
                    type="button"
                    key={t.slug}
                    className={treatment === t.slug ? "selected" : ""}
                    aria-pressed={treatment === t.slug}
                    onClick={() => setTreatment(t.slug)}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </fieldset>
            <button className="button primary full" type="submit">
              ממשיכים לתמונה שלך <ArrowLeft size={18} />
            </button>
          </form>
        ) : step === 2 ? (
          <form onSubmit={submit}>
            <button
              type="button"
              className="back-link"
              onClick={() => {
                setStep(1);
                setError("");
              }}
            >
              <ArrowRight size={16} /> חזרה לפרטים
            </button>
            <h3>חיוך קטן למצלמה.</h3>
            <p className="muted">
              תאורה טובה, בלי פילטר, ושיניים גלויות בחיוך.
            </p>
            <div
              className="upload-zone"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                addFiles(e.dataTransfer.files);
              }}
            >
              <ImagePlus size={30} />
              <strong>התמונה הראשונה היא נקודת ההתחלה</strong>
              <span>גררו לכאן 1–3 תמונות או בחרו מהמכשיר</span>
              <button
                type="button"
                className="button outlined small"
                onClick={() => input.current?.click()}
              >
                בחירת תמונות
              </button>
              <small>JPG, PNG, WebP · עד 10MB לתמונה</small>
              <input
                ref={input}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                hidden
                onChange={(e) => {
                  addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>
            {previews.length > 0 && (
              <div className="upload-previews">
                {previews.map((src, i) => (
                  <div key={src}>
                    <img src={src} alt={`תמונה ${i + 1} שנבחרה`} />
                    <button
                      type="button"
                      aria-label={`הסרת תמונה ${i + 1}`}
                      onClick={() => {
                        setFiles(files.filter((_, j) => i !== j));
                        requestId.current = newRequestId();
                      }}
                    >
                      <X size={14} />
                    </button>
                    <span>{i === 0 ? "תמונה ראשית" : `זווית ${i + 1}`}</span>
                  </div>
                ))}
              </div>
            )}
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                required
              />
              <span>
                אני מעל גיל 18 ומעלה תמונות שלי. אני מסכים/ה לעיבודן באמצעות
                OpenAI, ולשליחת הפרטים, התמונות וההדמיה למרפאה באמצעות שירות
                המייל Resend לצורך חזרה אליי. קראתי את{" "}
                <a href="/privacy" target="_blank" rel="noreferrer">
                  מדיניות הפרטיות
                </a>
                .
              </span>
            </label>
            <Challenge
              siteKey={config?.turnstileSiteKey || ""}
              onToken={setToken}
              resetKey={resetKey}
            />
            {config && !config.smileReady && (
              <div className="service-note">
                ההדמיה האישית תיפתח בקרוב. בינתיים נשמח לעזור לכם בשיחת ייעוץ.
              </div>
            )}
            <button
              className="button primary full"
              type="submit"
              disabled={
                !files.length ||
                !consent ||
                !config?.smileReady ||
                (!!config.turnstileSiteKey && !token)
              }
            >
              <Sparkles size={18} /> יצירת ההדמיה שלי <ArrowLeft size={18} />
            </button>
          </form>
        ) : (
          <div className="result">
            <div className="success-heading">
              <CheckCircle2 size={23} />
              <h3>נעים להכיר, אפשרות חדשה.</h3>
            </div>
            {results.length > 1 && (
              <div className="result-tabs">
                {results.map((r, i) => (
                  <button
                    key={r.index}
                    type="button"
                    className={activeResult === i ? "selected" : ""}
                    onClick={() => setActiveResult(i)}
                  >
                    זווית {r.index + 1}
                  </button>
                ))}
              </div>
            )}
            <Compare
              before={previews[results[activeResult]?.index]}
              after={results[activeResult]?.image}
            />
            <p className="muted">גררו את המחוון כדי להשוות בין התמונות.</p>
            <p className="result-notice">{notice}</p>
            <a
              className="button primary full"
              href={results[activeResult]?.image}
              download={`my-smile-preview-${activeResult + 1}.png`}
            >
              <Download size={17} /> שמירת ההדמיה
            </a>
            <a className="button outlined full" href="#contact">
              נדבר על החיוך שלך? <ArrowLeft size={17} />
            </a>
            <button
              className="back-link"
              onClick={() => {
                setStep(1);
                setFiles([]);
                setResults([]);
                setConsent(false);
                requestId.current = newRequestId();
              }}
            >
              התחלה מחדש
            </button>
          </div>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <p className="lab-disclaimer">
          <ShieldCheck size={16} /> המחשה אסתטית בלבד. התאמה ותוצאות טיפול
          נקבעות בייעוץ רפואי.
        </p>
      </div>
    </section>
  );
}
