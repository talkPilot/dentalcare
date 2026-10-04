import { newRequestId } from "./requestId";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUpLeft,
  CheckCircle2,
  ChevronDown,
  Heart,
  Menu,
  MessageCircle,
  MoveUpRight,
  Phone,
  Plus,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import SmileLab, { Challenge, type Config } from "./components/SmileLab";
import Tooth from "./components/Tooth";
import SmileParticles from "./components/SmileParticles";
import { faqs, treatments } from "./content";
import clinic from "../shared/clinic.json";
import { apiUrl, apiAvailable } from "./api";
const fallbackConfig: Config = {
  ...clinic,
  smileReady: false,
  contactReady: false,
  address: "",
  turnstileSiteKey: "",
  offerApproved: false,
};
function Logo() {
  return (
    <a className="logo" href="/" aria-label="דנטל קר 24 — עמוד הבית">
      <span className="brand-icon">
        <img src="/images/clinic-logo.jpeg" alt="" />
      </span>
      <span>
        <b dir="ltr">
          dental care<span className="logo-24">24</span>
        </b>
        <small>רפואת שיניים לכל המשפחה</small>
      </span>
    </a>
  );
}
function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
function Header() {
  const [open, setOpen] = useState(false);
  const links = [
    ["הגישה שלנו", "about"],
    ["הטיפולים שלנו", "treatments"],
    ["הדמיית חיוך", "smile-lab"],
    ["שאלות ותשובות", "faq"],
  ];
  return (
    <>
      <a className="skip-link" href="#main">
        דילוג לתוכן
      </a>
      <header>
        <Logo />
        <nav className={open ? "nav open" : "nav"} aria-label="ניווט ראשי">
          {links.map(([label, id]) => (
            <a key={id} href={`/#${id}`} onClick={() => setOpen(false)}>
              {label}
              {id === "smile-lab" && <Sparkles size={13} />}
            </a>
          ))}
        </nav>
        <a className="header-contact" href="/#contact">
          בואו נדבר <ArrowUpLeft size={16} />
        </a>
        <button
          className="mobile-menu"
          onClick={() => setOpen(!open)}
          aria-label={open ? "סגירת תפריט" : "פתיחת תפריט"}
          aria-expanded={open}
        >
          {open ? <X /> : <Menu />}
        </button>
      </header>
    </>
  );
}
function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 95]);
  const reduced = useReducedMotion();
  return (
    <section ref={ref} className="hero">
      <div className="hero-copy">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="eyebrow">
            <span className="live-dot" /> רפואת שיניים. עם מקום בשבילך.
          </span>
        </motion.div>
        <h1>
          {["לא רק חיוך.", "הדרך שלך"].map((line, i) => (
            <motion.span
              key={line}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 + i * 0.12 }}
            >
              {line}
              <br />
            </motion.span>
          ))}
          <motion.span
            className="hero-last"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
          >
            להרגיש <em>את עצמך.</em>
            <svg viewBox="0 0 260 25" aria-hidden="true">
              <path d="M4 13Q117-8 251 12M34 21Q145 5 236 20" />
            </svg>
          </motion.span>
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.8 }}
        >
          יש חיוך שהוא רק שלך.
          <br />
          אנחנו כאן כדי לתת לו את המקום שמגיע לו —<br />
          עם הקשבה, דיוק ורפואת שיניים שרואה אותך.
        </motion.p>
        <div className="hero-actions">
          <a className="button primary" href="#smile-lab">
            <Sparkles size={18} /> לגלות את החיוך שלי <ArrowLeft size={20} />
          </a>
          <a className="text-link" href="#treatments">
            להכיר את הטיפולים <ArrowDown size={17} />
          </a>
        </div>
        <div className="hero-bottom">
          <span>
            <ShieldCheck size={17} /> תכנון אישי, בקצב שלך
          </span>
          <span className="small-divider" />
          <span>טכנולוגיה מתקדמת. גישה אנושית.</span>
        </div>
      </div>
      <div className="hero-visual">
        <motion.img
          style={reduced ? undefined : { y }}
          src="/images/smile-hero.webp"
          className="hero-photo"
          alt="אישה מחייכת בצילום קונספט של דנטל קר 24"
          fetchPriority="high"
        />
        <div className="photo-grain" />
        <div className="photo-topline">
          <span>YOUR SMILE. YOUR SIGNATURE.</span>
          <Plus size={19} />
        </div>
        <div className="hero-seal">
          <Sparkles size={24} />
          <span>חיוך שמרגיש</span>
          <strong>בדיוק את.</strong>
        </div>
        <div className="smile-corner c1" />
        <div className="smile-corner c2" />
        <div className="smile-corner c3" />
        <div className="smile-corner c4" />
        <div className="photo-bottom">
          <span>
            EVERY SMILE
            <br />
            TELLS A STORY.
          </span>
          <span>
            01 —<br />
            DENTAL CARE 24
          </span>
        </div>
        <span className="hero-concept">צילום קונספט</span>
        <a className="floating-note" href="#smile-lab">
          <span className="note-icon">
            <Sparkles size={22} />
          </span>
          <span>
            <strong>החיוך הבא שלך, כבר כאן.</strong>
            <small>לגלות אפשרות חדשה עם הדמיית AI</small>
          </span>
          <ArrowUpLeft size={21} />
        </a>
      </div>
    </section>
  );
}
function Marquee() {
  return (
    <div className="marquee" aria-hidden="true">
      <div>
        {Array.from({ length: 4 }, (_, i) => (
          <span key={i}>
            A LITTLE CARE. A BIG SMILE. <span className="marquee-star">✳</span>{" "}
            חיוך טוב מתחיל בהרגשה טובה <span className="marquee-star">✳</span>
          </span>
        ))}
      </div>
    </div>
  );
}
function Services() {
  return (
    <section id="treatments" className="section treatments">
      <Reveal className="section-heading">
        <div>
          <span className="eyebrow">01 / הטיפולים שלנו</span>
          <h2>
            לכל חיוך,
            <br />
            <em>הדרך שלו.</em>
          </h2>
        </div>
        <div>
          <p>
            מאסתטיקה ועד שיקום — מתחילים בהיכרות איתך.
            <br />
            מגלים את האפשרויות ובונים תוכנית שמתאימה לך.
          </p>
          <a className="text-link" href="#contact">
            נמצא יחד את הטיפול שלך <ArrowUpLeft size={18} />
          </a>
        </div>
      </Reveal>
      <div className="treatment-grid">
        {treatments.slice(0, 3).map((t) => (
          <Reveal key={t.slug}>
            <a
              className={`treatment-card ${t.type}`}
              href={`/treatments/${t.slug}`}
            >
              <div className="card-top">
                <span>{t.number} /</span>
                <ArrowUpLeft size={22} />
              </div>
              <div className="tooth-scene">
                <div className="tooth-orbit" />
                <Tooth variant={t.type} />
                <span className="tooth-caption">DESIGNED AROUND YOU</span>
              </div>
              <div className="card-copy">
                <small>{t.en}</small>
                <h3>{t.name}</h3>
                <p>{t.short}</p>
                <div className="card-footer">
                  <span>{t.tags.join(" · ")}</span>
                  <span>
                    לגלות עוד <ArrowLeft size={16} />
                  </span>
                </div>
              </div>
            </a>
          </Reveal>
        ))}
      </div>
      <div className="other-treatments">
        {treatments.slice(3).map((t) => (
          <a key={t.slug} href={`/treatments/${t.slug}`}>
            <span className="line-icon">
              {t.slug === "whitening" ? <Sparkles /> : <MoveUpRight />}
            </span>
            <span>
              <strong>{t.name}</strong>
              <small>{t.short}</small>
            </span>
            <ArrowUpLeft />
          </a>
        ))}
      </div>
    </section>
  );
}
function About() {
  return (
    <section id="about" className="about section">
      <Reveal className="about-art">
        <div className="orbit o1" />
        <div className="orbit o2" />
        <div className="orbit o3" />
        <span className="orbit-dot" />
        <SmileParticles />
        <span className="art-top">PRECISION MEETS EMPATHY</span>
        <span className="art-number">
          24<span>care, at heart.</span>
        </span>
        <span className="art-bottom">
          מחשבה על כל פרט.
          <br />
          מקום לכל אדם.
        </span>
      </Reveal>
      <Reveal className="about-copy">
        <span className="eyebrow">02 / הגישה שלנו</span>
        <h2>
          לפני השיניים,
          <br />
          <em>רואים אנשים.</em>
        </h2>
        <p className="large-copy">
          את התחושה הזו, שאפשר פשוט לחייך בלי לחשוב על זה? בשביל זה אנחנו כאן.
        </p>
        <p>
          בדנטל קר 24 אנחנו מאמינים שחוויית טיפול טובה מתחילה בהקשבה. במה שחשוב
          לכם, במה שמטריד אתכם ובדרך שבה הייתם רוצים להרגיש.
        </p>
        <div className="values">
          <div>
            <Heart size={20} />
            <span>
              <strong>הקשבה לפני הכול</strong>
              <small>זמן לשאול, להבין ולהרגיש בנוח.</small>
            </span>
          </div>
          <div>
            <Sparkles size={20} />
            <span>
              <strong>טכנולוגיה עם מגע אישי</strong>
              <small>כלים חדשים, עם מחשבה על החיוך הייחודי שלך.</small>
            </span>
          </div>
          <div>
            <ShieldCheck size={20} />
            <span>
              <strong>שקיפות לאורך הדרך</strong>
              <small>אפשרויות, ציפיות ותוכנית ברורה לפני שמתחילים.</small>
            </span>
          </div>
        </div>
        <a className="text-link" href="#contact">
          נעים להכיר <ArrowLeft size={18} />
        </a>
      </Reveal>
    </section>
  );
}
function Process() {
  return (
    <section className="section process">
      <Reveal className="section-heading">
        <div>
          <span className="eyebrow">04 / הדרך לחיוך שלך</span>
          <h2>
            צעד קטן.
            <br />
            <em>התחלה של שינוי.</em>
          </h2>
        </div>
        <p>
          לא צריך לדעת מראש מה נכון לך.
          <br />
          אנחנו כאן כדי לגלות את זה יחד.
        </p>
      </Reveal>
      <div className="process-grid">
        {[
          [
            "נפגשים עם האפשרויות",
            "משאירים פרטים או מתנסים בהדמיה ומתחילים לראות כיוון חדש.",
          ],
          [
            "מדברים, באמת",
            "פגישת היכרות ובדיקה כדי להבין את הרצונות, הצרכים והאפשרויות שלך.",
          ],
          [
            "מתכננים יחד",
            "בונים תוכנית טיפול אישית, עם הסבר ברור על השלבים והעלויות.",
          ],
          [
            "מחייכים לאורך הדרך",
            "ממשיכים בטיפול ובמעקב, עם הנחיות לשמירה על בריאות החיוך.",
          ],
        ].map(([title, text], i) => (
          <Reveal key={title} className="process-item">
            <div className="process-number">
              0{i + 1}
              <span>
                <ArrowLeft size={19} />
              </span>
            </div>
            <h3>{title}</h3>
            <p>{text}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
function FAQ() {
  return (
    <section className="section faq" id="faq">
      <Reveal>
        <span className="eyebrow">05 / טוב ששאלת</span>
        <h2>
          קצת יותר ברור.
          <br />
          <em>קצת יותר רגוע.</em>
        </h2>
        <p>
          יש עוד משהו שמעסיק אותך?
          <br />
          אנחנו כאן לשיחה.
        </p>
        <a className="text-link" href="#contact">
          לשאול אותנו <ArrowLeft size={18} />
        </a>
      </Reveal>
      <div className="faq-list">
        {faqs.map(([q, a], i) => (
          <details key={q}>
            <summary>
              <span className="faq-number">0{i + 1}</span>
              <span>{q}</span>
              <Plus size={21} />
            </summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
function Contact({ config }: { config: Config | null }) {
  const [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false),
    [done, setDone] = useState(false),
    [token, setToken] = useState(""),
    [resetKey, setResetKey] = useState(0);
  const requestId = useRef(newRequestId());
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!config?.contactReady) {
      setStatus(
        "קבלת פניות תופעל לאחר חיבור שירות המייל. הפרטים שלך לא נשלחו.",
      );
      return;
    }
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    setStatus("");
    try {
      const response = await fetch(apiUrl("/api/contact"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, token, requestId: requestId.current }),
        signal: AbortSignal.timeout(30000),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      setDone(true);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "אירעה תקלה בשליחה.");
    } finally {
      setBusy(false);
      setToken("");
      setResetKey((k) => k + 1);
    }
  }
  return (
    <section className="contact section" id="contact">
      <div className="contact-copy">
        <span className="eyebrow">06 / זה מתחיל בשיחה</span>
        <h2>
          החיוך הבא שלך
          <br />
          מתחיל ב<em>שלום.</em>
        </h2>
        <p>
          השאירו פרטים, נכיר קצת ונחשוב יחד
          <br />
          על הצעד הבא. בקצב שלכם.
        </p>
        {config?.phone && (
          <a className="contact-phone" href={`tel:${config.phone}`}>
            <Phone size={23} />
            <span dir="ltr">{config.phone}</span>
          </a>
        )}
        {config?.whatsapp && (
          <a
            className="text-link"
            href={`https://wa.me/${config.whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={19} /> אפשר גם בוואטסאפ{" "}
            <ArrowUpLeft size={17} />
          </a>
        )}
        {config?.secondaryPhone && (
          <a className="secondary-phone" href={`tel:${config.secondaryPhone}`}>
            <Phone size={17} />
            <span dir="ltr">{config.secondaryPhone}</span>
          </a>
        )}
        {config?.email && (
          <a className="contact-email" href={`mailto:${config.email}`}>
            {config.email}
          </a>
        )}
        <div className="branch-list">
          {config?.branches?.map((b) => (
            <a
              key={b.city}
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.mapQuery)}`}
              target="_blank"
              rel="noreferrer"
            >
              <span>
                <strong>{b.city}</strong>
                <small>{b.address}</small>
              </span>
              <ArrowUpLeft size={21} />
            </a>
          ))}
        </div>
      </div>
      <div className="contact-form-wrap">
        {done ? (
          <div role="status" className="contact-success">
            <CheckCircle2 size={48} />
            <h3>איזה כיף שעשית את הצעד.</h3>
            <p>הפנייה נשלחה לצוות המרפאה. נחזור אליך בהקדם.</p>
          </div>
        ) : (
          <form
            onSubmit={submit}
            onChange={() => {
              requestId.current = newRequestId();
            }}
          >
            <h3>נעים להכיר.</h3>
            <div className="form-pair">
              <label>
                שם מלא
                <input
                  name="name"
                  required
                  minLength={2}
                  maxLength={80}
                  autoComplete="name"
                  placeholder="השם שלך"
                />
              </label>
              <label>
                טלפון
                <input
                  name="phone"
                  type="tel"
                  required
                  maxLength={20}
                  autoComplete="tel"
                  dir="ltr"
                  placeholder="050-000-0000"
                />
              </label>
            </div>
            <label>
              על מה נדבר?
              <select name="treatment" defaultValue="consultation">
                <option value="consultation">אשמח לייעוץ והכוונה</option>
                {treatments.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              משהו שחשוב לך שנדע? <span className="optional">(לא חובה)</span>
              <textarea
                name="message"
                maxLength={1000}
                rows={3}
                placeholder="אפשר לספר לנו בכמה מילים. אין צורך לפרט מידע רפואי."
              />
            </label>
            <input
              name="website"
              className="honeypot"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
            <label className="checkbox-label">
              <input type="checkbox" name="consent" value="true" required />
              <span>
                אני מסכים/ה להעברת הפרטים למרפאה לצורך חזרה אליי, בהתאם ל
                <a href="/privacy">מדיניות הפרטיות</a>.
              </span>
            </label>
            <Challenge
              siteKey={config?.turnstileSiteKey || ""}
              onToken={setToken}
              resetKey={resetKey}
            />
            <button
              className="button primary full"
              disabled={
                busy ||
                !config?.contactReady ||
                (!!config?.turnstileSiteKey && !token)
              }
            >
              {busy ? "שולחים את הפנייה..." : "בואו נדבר על החיוך שלי"}
              <ArrowLeft size={18} />
            </button>
            {config && !config.contactReady && (
              <small className="contact-preview">
                הטופס ייפתח בקרוב. בינתיים אפשר לפנות בטלפון, במייל או בוואטסאפ.
              </small>
            )}
            {status && (
              <p className="form-error" role="alert">
                {status}
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
function Footer() {
  return (
    <footer>
      <div className="footer-top">
        <Logo />
        <p>
          רפואת שיניים עם מחשבה
          <br />
          על האדם שמאחורי החיוך.
        </p>
        <a href="/#smile-lab">
          לגלות את החיוך שלך <ArrowUpLeft size={19} />
        </a>
      </div>
      <div className="footer-wordmark" dir="ltr">
        a reason to smile<span>✳</span>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} דנטל קר 24</span>
        <div>
          <a href="/privacy">פרטיות ותנאי שימוש</a>
          <a href="/accessibility">נגישות</a>
        </div>
        <span dir="ltr">MADE WITH CARE.</span>
      </div>
    </footer>
  );
}
function TreatmentPage({ slug }: { slug: string }) {
  const t = treatments.find((t) => t.slug === slug);
  if (!t)
    return (
      <div className="legal-page">
        <h1>העמוד לא נמצא</h1>
        <a href="/">חזרה לעמוד הבית</a>
      </div>
    );
  return (
    <>
      <section className="treatment-hero section">
        <div>
          <a className="back-link" href="/#treatments">
            ← לכל הטיפולים
          </a>
          <span className="eyebrow">{t.en}</span>
          <h1>{t.name}</h1>
          <h2>{t.short}</h2>
          <p>{t.description}</p>
          <a className="button primary" href="/#contact">
            נקבע שיחת היכרות <ArrowLeft size={18} />
          </a>
        </div>
        <div className="treatment-page-art">
          <Tooth variant={t.type} />
        </div>
      </section>
      <section className="section treatment-detail">
        <span className="eyebrow">להכיר את האפשרויות</span>
        <h2>מה חשוב לדעת?</h2>
        <p>{t.detail}</p>
        <div className="detail-steps">
          {t.steps.map((s, i) => (
            <div key={s}>
              <span>0{i + 1}</span>
              <h3>{s}</h3>
            </div>
          ))}
        </div>
        <div className="info-note">
          <ShieldCheck />
          <p>{t.note} המידע כללי ואינו מחליף ייעוץ ובדיקה אצל רופא שיניים.</p>
        </div>
        <a className="text-link" href="/#smile-lab">
          לנסות הדמיה אסתטית אישית <ArrowLeft size={18} />
        </a>
      </section>
    </>
  );
}
function Legal({ accessibility = false }: { accessibility?: boolean }) {
  return (
    <article className="legal-page">
      <a className="back-link" href="/">
        ← חזרה לעמוד הבית
      </a>
      <span className="eyebrow">DENTAL CARE 24</span>
      <h1>{accessibility ? "נגישות באתר" : "פרטיות ותנאי שימוש"}</h1>
      {accessibility ? (
        <>
          <p>
            האתר נבנה מתוך מטרה לאפשר שימוש נוח לכמה שיותר אנשים. אין במסמך זה
            אישור לעמידה בתקן או תחליף לבדיקת נגישות מקצועית.
          </p>
          <h2>התאמות שבוצעו</h2>
          <ul>
            <li>ניווט באמצעות מקלדת ומיקוד נראה לעין.</li>
            <li>כותרות מובנות, תוויות לטפסים וטקסטים חלופיים לתמונות.</li>
            <li>תמיכה בהגדלת טקסט ובהעדפת מערכת להפחתת תנועה.</li>
            <li>התאמה למסכי טלפון, טאבלט ומחשב.</li>
          </ul>
          <h2>מצאתם קושי?</h2>
          <p>
            אפשר לפנות באמצעות <a href="/#contact">טופס יצירת הקשר</a> ולתאר
            באיזה עמוד ובאיזה מכשיר נתקלתם בקושי. ניתן לפנות גם במייל
            yosef2112@gmail.com או בטלפון 052-5212118 ולציין שמדובר בבקשת
            נגישות.
          </p>
        </>
      ) : (
        <>
          <p>
            האתר מציג מידע על טיפולי שיניים ומאפשר פנייה למרפאה והדמיה אסתטית.
            בתצוגה המקדימה, שירותים שאינם מחוברים אינם שולחים מידע.
          </p>
          <h2>איזה מידע נמסר?</h2>
          <p>
            בטופס יצירת קשר: שם, טלפון, תחום עניין והודעה שתבחרו לצרף. בהדמיה:
            גם אזור מגורים אם נמסר, ותמונה אחת עד שלוש תמונות שלכם. ההדמיה
            מיועדת לבני 18 ומעלה. אין להעלות תמונות של אחרים.
          </p>
          <h2>מה עושים במידע?</h2>
          <p>
            משתמשים בפרטים כדי לחזור אליכם לגבי הפנייה. תמונות בהדמיה מועברות
            ל־OpenAI ליצירת תמונה, והפרטים והתמונות נשלחים למרפאה באמצעות
            Resend. לא מצרפים אתכם לרשימת דיוור שיווקית באמצעות הסכמה זו.
          </p>
          <h2>שמירה וספקים</h2>
          <p>
            השרת מעבד תמונות בזיכרון ואינו שומר אותן במאגר קבוע. עותקים שנשלחו
            במייל נשארים בתיבת המרפאה לפי נהלי השמירה שלה. תוצאות עשויות להישמר
            זמנית בזיכרון השרת עד 15 דקות למניעת חיוב כפול בעת ניסיון חוזר.
            לספקי השירות עשויה להיות שמירה לפי תנאיהם, וייתכן עיבוד מחוץ לישראל.
            בעל האתר: דנטל קר 24, הברזל 11 תל אביב ומשה לוי 16 רמלה. יש להשלים
            עם המרפאה את זהותה המשפטית ותקופת השמירה במייל לפני פתיחה לציבור.
          </p>
          <h2>אבטחה וקבצים</h2>
          <p>
            האתר מגביל סוגי קבצים וגודל, מסיר נתוני צילום נלווים ומגביל מספר
            פניות. בשירות פעיל עשוי להיעשה שימוש ב־Cloudflare Turnstile למניעת
            שימוש אוטומטי. אין באתר כלי פרסום או מעקב שיווקי.
          </p>
          <h2>ההדמיה אינה המלצה רפואית</h2>
          <p>
            הדמיה מבוססת AI עשויה לשנות פרטים ואינה מבטיחה דמיון מוחלט או תוצאה
            קלינית. היא אינה בודקת את מצב השיניים, העצם או החניכיים. אין לקבל
            החלטה רפואית על סמך ההדמיה בלבד. התמונות העיצוביות באתר הן צילומי
            קונספט שנוצרו ב־AI, ואינן מטופלים או עדויות לתוצאות.
          </p>
          <h2>בקשות בנוגע למידע</h2>
          <p>
            ניתן לפנות למרפאה בבקשה לעיון, תיקון או מחיקה באמצעות{" "}
            <a href="/#contact">יצירת קשר</a>. לפניות: yosef2112@gmail.com,
            טלפון 052-5212118. ניתן לפנות גם בטלפון 053-4004600.
          </p>
        </>
      )}
    </article>
  );
}
export default function App() {
  const [config, setConfig] = useState<Config | null>(fallbackConfig);
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  useEffect(() => {
    if (!apiAvailable) return;
    fetch(apiUrl("/api/config"))
      .then((r) => r.json())
      .then(setConfig)
      .catch(() => setConfig(fallbackConfig));
  }, []);
  useEffect(() => {
    const t = treatments.find((t) => path === `/treatments/${t.slug}`);
    document.title = t
      ? `${t.name} | דנטל קר 24`
      : path === "/privacy"
        ? "פרטיות | דנטל קר 24"
        : path === "/accessibility"
          ? "נגישות | דנטל קר 24"
          : "דנטל קר 24 — מקום לחיוך שלך";
  }, [path]);
  return (
    <>
      <Header />
      <main id="main">
        {path === "/privacy" ? (
          <Legal />
        ) : path === "/accessibility" ? (
          <Legal accessibility />
        ) : path.startsWith("/treatments/") ? (
          <TreatmentPage slug={path.split("/")[2]} />
        ) : path !== "/" ? (
          <div className="legal-page">
            <h1>העמוד לא נמצא</h1>
            <a href="/">חזרה לעמוד הבית</a>
          </div>
        ) : (
          <>
            <Hero />
            <Marquee />
            <Services />
            <About />
            <SmileLab config={config} />
            <Process />
            {config?.offerApproved && (
              <section className="offer">
                <span>חיוך חדש. בדרך שנוחה לך.</span>
                <strong>עד 24 תשלומים</strong>
                <p>לפי תנאי המרפאה והזכאות. בקשו את פרטי ההצעה בשיחת הייעוץ.</p>
                <a href="#contact" className="text-link">
                  לפרטי ההצעה <ArrowLeft size={17} />
                </a>
              </section>
            )}
            <FAQ />
            <Contact config={config} />
          </>
        )}
      </main>
      <Footer />
      <a className="mobile-cta" href="/#smile-lab">
        <Sparkles size={17} /> הדמיית החיוך שלי <ArrowLeft size={17} />
      </a>
    </>
  );
}
