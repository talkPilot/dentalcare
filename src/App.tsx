import { fetchWithTimeout } from "./fetchWithTimeout";
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
  Menu,
  MessageCircle,
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
  const { scrollYProgress } = useScroll();
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
        <motion.div
          className="reading-progress"
          style={{ scaleX: scrollYProgress }}
          aria-hidden="true"
        />
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
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const reduced = useReducedMotion();
  return (
    <section ref={ref} className="hero">
      <div className="hero-visual">
        <motion.img
          style={reduced ? undefined : { y, scale }}
          src="/images/smile-hero.webp"
          className="hero-photo"
          alt="צילום קונספט של אישה מחייכת"
          fetchPriority="high"
        />
        <div className="hero-shade" />
        <div className="gold-arc" aria-hidden="true" />
        <span className="hero-concept">צילום קונספט</span>
        <span className="portrait-index" dir="ltr">
          THE ART OF A NATURAL SMILE / 01
        </span>
      </div>
      <div className="hero-copy">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <span className="eyebrow">
            <span className="live-dot" /> DENTAL CARE 24 · תל אביב / רמלה
          </span>
          <h1>
            החיוך שלך.
            <br />
            <em>יצירה אישית.</em>
          </h1>
          <p>
            דיוק של רפואה. מחשבה של עיצוב.
            <br />
            רפואת שיניים שמתחילה בך, וממשיכה בכל פרט.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#smile-lab">
              לגלות את החיוך שלי <ArrowUpLeft size={21} />
            </a>
            <a className="text-link" href="#treatments">
              להכיר את הטיפולים <ArrowDown size={16} />
            </a>
          </div>
        </motion.div>
      </div>
      <div className="hero-foot">
        <span dir="ltr">INDIVIDUAL BY DESIGN.</span>
        <a href="#about">
          לגלול. להכיר. לחייך. <ArrowDown size={17} />
        </a>
        <span>אסתטיקה · שיקום · רפואת שיניים</span>
      </div>
      <span className="hero-watermark" aria-hidden="true">
        SMILE.
      </span>
    </section>
  );
}
function Marquee() {
  return (
    <div className="editorial-band">
      <span dir="ltr">DENTAL CARE / 24</span>
      <span>מקום לחיוך שהוא רק שלך.</span>
      <span dir="ltr">ESTHETICS. PRECISION. CARE.</span>
    </div>
  );
}
function Services() {
  const [active, setActive] = useState(0);
  return (
    <section id="treatments" className="section treatments">
      <Reveal className="section-heading">
        <div>
          <span className="eyebrow">02 / קולקציית הטיפולים</span>
          <h2>
            הפרטים הקטנים.
            <br />
            <em>התמונה השלמה.</em>
          </h2>
        </div>
        <p>
          אסתטיקה, בריאות ותפקוד.
          <br />
          לכל חיוך אנחנו מתכננים דרך משלו.
        </p>
      </Reveal>
      <div className="treatment-gallery">
        <div className="treatment-sculpture" aria-hidden="true">
          <span className="sculpture-label" dir="ltr">
            THE ANATOMY OF A SMILE
          </span>
          <div className="sculpture-ring" />
          <div className="sculpture-ring second" />
          <motion.div
            className="sculpture-object"
            key={active}
            initial={{ opacity: 0, rotate: -8, y: 16 }}
            animate={{ opacity: 1, rotate: 0, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Tooth variant={treatments[active].type} />
          </motion.div>
          <span className="sculpture-number">{treatments[active].number}</span>
          <span className="sculpture-caption">{treatments[active].en}</span>
        </div>
        <div className="treatment-list">
          {treatments.map((t, i) => (
            <motion.a
              key={t.slug}
              className={`treatment-row ${active === i ? "selected" : ""}`}
              href={`/treatments/${t.slug}`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onViewportEnter={() => setActive(i)}
              viewport={{ margin: "-40% 0px -40% 0px" }}
            >
              <span className="treatment-index">{t.number}</span>
              <div>
                <small>{t.en}</small>
                <h3>{t.name}</h3>
                <p>{t.short}</p>
              </div>
              <span className="round-arrow">
                <ArrowUpLeft size={23} />
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
function About() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const x = useTransform(scrollYProgress, [0, 1], [65, -65]);
  const reduced = useReducedMotion();
  return (
    <section id="about" className="about section" ref={ref}>
      <div className="about-intro">
        <span className="eyebrow">01 / הפילוסופיה שלנו</span>
        <span dir="ltr">BEYOND THE SMILE.</span>
      </div>
      <Reveal className="manifesto">
        <h2>
          לא משנים את מי שאתם.
          <br />
          <em>נותנים לכם עוד סיבה</em>
          <br />
          להיות עצמכם.
        </h2>
      </Reveal>
      <div className="about-bottom">
        <motion.div
          className="signature-line"
          style={reduced ? undefined : { x }}
          aria-hidden="true"
        >
          Care, in every detail.
        </motion.div>
        <div>
          <p>
            חיוך יפה מתחיל בהקשבה. בדנטל קר 24 אנחנו מחברים בין תכנון מדויק לבין
            ההיכרות איתכם — הרצונות, החששות והפרטים שהופכים את החיוך לשלכם.
          </p>
          <a className="text-link" href="#contact">
            נעים להכיר <ArrowUpLeft size={18} />
          </a>
        </div>
      </div>
      <div className="values">
        <div>
          <span>01</span>
          <strong>קודם מקשיבים.</strong>
          <small>מקום לשאלות, לרצונות ולקצב שלכם.</small>
        </div>
        <div>
          <span>02</span>
          <strong>מדייקים יחד.</strong>
          <small>אפשרויות ברורות ותוכנית טיפול אישית.</small>
        </div>
        <div>
          <span>03</span>
          <strong>רואים את האדם.</strong>
          <small>מחשבה על ההרגשה, לצד המראה.</small>
        </div>
      </div>
    </section>
  );
}
function Process() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"],
  });
  const reduced = useReducedMotion();
  return (
    <section className="section process" ref={ref}>
      <div className="process-intro">
        <span className="eyebrow">04 / הדרך שלך</span>
        <h2>
          כל שינוי גדול
          <br />
          מתחיל ב<em>צעד.</em>
        </h2>
        <p>
          תהליך ברור. קשר אישי.
          <br />
          ומישהו שמלווה אותך בדרך.
        </p>
        <div className="journey-emblem" aria-hidden="true">
          <SmileParticles />
        </div>
      </div>
      <div className="journey">
        <div className="journey-track" aria-hidden="true">
          <motion.span
            style={reduced ? { scaleY: 1 } : { scaleY: scrollYProgress }}
          />
        </div>
        {[
          [
            "01",
            "להכיר.",
            "משאירים פרטים או מתנסים בהדמיה. מספרים לנו איך הייתם רוצים להרגיש עם החיוך שלכם.",
          ],
          [
            "02",
            "להבין.",
            "נפגשים לשיחה ובדיקה. מכירים את מצב השיניים ואת אפשרויות הטיפול המתאימות לכם.",
          ],
          [
            "03",
            "לתכנן.",
            "בונים תוכנית אישית. מדברים על השלבים, הציפיות והעלויות, לפני שמתחילים.",
          ],
          [
            "04",
            "לחייך.",
            "ממשיכים לטיפול ולמעקב, עם הנחיות לשמירה על בריאות החיוך לאורך הדרך.",
          ],
        ].map(([n, title, text]) => (
          <Reveal key={n} className="journey-step">
            <span>{n}</span>
            <div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
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
      const response = await fetchWithTimeout(
        apiUrl("/api/contact"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            token,
            requestId: requestId.current,
          }),
        },
        30000,
      );
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
        YOUR SMILE.
        <br />
        <span>OUR SIGNATURE.</span>
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
            מפעילת האתר: מרפאת דנטל קר 24, הברזל 11 תל אביב ומשה לוי 16 רמלה.
            לבירורים על המידע שנשמר במרפאה ותקופת שמירתו, ניתן לפנות לפרטי הקשר
            המופיעים בהמשך.
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
            <About />
            <Services />
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
