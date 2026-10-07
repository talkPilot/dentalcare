import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { ArrowUpLeft } from "lucide-react";

/** A decorative drawing, never a clinical preview or a treatment result. */
export default function SmileSignature() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress: progress } = useScroll({
    target: ref,
    offset: ["start center", "end center"],
  });
  const draw = useTransform(progress, [0, 0.6], [0.08, 1]);
  const rotate = useTransform(progress, [0, 1], [-12, 12]);
  const shift = useTransform(progress, [0, 1], ["8%", "-8%"]);
  const first = useTransform(progress, [0, 0.25, 0.42], [1, 1, 0.7]);
  const second = useTransform(
    progress,
    [0.2, 0.43, 0.62, 0.8],
    [0.7, 1, 1, 0.7],
  );
  const third = useTransform(progress, [0.58, 0.82, 1], [0.7, 1, 1]);
  const teeth = [
    "M208 215 Q203 253 229 258 Q250 260 258 223",
    "M258 223 Q246 286 286 292 Q318 299 324 232",
    "M324 232 Q315 308 357 311 Q395 315 400 236",
    "M400 236 Q405 315 443 311 Q485 308 476 232",
    "M476 232 Q482 299 514 292 Q554 286 542 223",
    "M542 223 Q550 260 571 258 Q597 253 592 215",
  ];
  return (
    <section
      ref={ref}
      id="signature"
      className="signature-experience"
      aria-labelledby="signature-title"
    >
      <div className="signature-stage">
        <div className="signature-topline">
          <span dir="ltr">THE SIGNATURE / DENTAL CARE 24</span>
          <span>אמנות הפרטים הקטנים</span>
        </div>
        <motion.div
          className="signature-ghost"
          style={reduced ? undefined : { x: shift }}
          aria-hidden="true"
        >
          ONE OF A KIND.
        </motion.div>
        <div className="signature-layout">
          <div className="signature-intro">
            <span className="eyebrow">בדיוק במידה שלך</span>
            <h2 id="signature-title">
              אין עוד חיוך
              <br />
              <em>כמו שלך.</em>
            </h2>
            <p>
              הצורה. היחס. האופי.
              <br />
              היופי נמצא בחיבור ביניהם.
            </p>
            <a href="#smile-lab" className="text-link">
              לראות את האפשרות שלך <ArrowUpLeft size={18} />
            </a>
          </div>
          <div className="signature-drawing" aria-hidden="true">
            <motion.div
              className="signature-orbit"
              style={reduced ? undefined : { rotate }}
            >
              <i />
              <i />
            </motion.div>
            <svg viewBox="0 0 800 480" fill="none">
              <defs>
                <linearGradient
                  id="signature-gold"
                  x1="150"
                  y1="180"
                  x2="650"
                  y2="330"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#87622f" />
                  <stop offset=".45" stopColor="#fff0be" />
                  <stop offset="1" stopColor="#b88740" />
                </linearGradient>
              </defs>
              <g stroke="#d9b878" strokeOpacity=".17" strokeWidth="1">
                <path
                  d="M100 235H700M400 65V405M185 115V365M615 115V365"
                  strokeDasharray="4 7"
                />
                <ellipse cx="400" cy="240" rx="275" ry="162" />
                <path d="M178 104h14m-7-7v14M608 376h14m-7-7v14" />
              </g>
              <g
                stroke="url(#signature-gold)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {[
                  "M150 183 Q400 310 650 183 Q584 367 400 372 Q216 367 150 183",
                  "M150 183 Q400 414 650 183",
                  ...teeth,
                ].map((d, i) => (
                  <motion.path
                    key={d}
                    d={d}
                    style={reduced ? undefined : { pathLength: draw }}
                    initial={false}
                  />
                ))}
              </g>
              <g
                fill="#dfc38d"
                fontSize="11"
                fontFamily="DM Sans, sans-serif"
                letterSpacing="3"
              >
                <text x="102" y="90">
                  FORM / 01
                </text>
                <text x="554" y="420">
                  PERSONAL BY NATURE
                </text>
              </g>
            </svg>
            <span className="signature-drawing-note">
              איור קונספט · כל חיוך מתוכנן באופן אישי
            </span>
          </div>
        </div>
        <div className="signature-chapters">
          {[
            [first, "01", "דיוק", "מחשבה על כל קו."],
            [second, "02", "הרמוניה", "הפרטים עובדים יחד."],
            [third, "03", "האופי שלך", "כי החיוך הוא חלק ממך."],
          ].map(([opacity, n, title, copy]) => (
            <motion.div
              key={String(n)}
              style={reduced ? undefined : { opacity: opacity as typeof first }}
            >
              <span>{String(n)}</span>
              <strong>{String(title)}</strong>
              <small>{String(copy)}</small>
            </motion.div>
          ))}
        </div>
        <div className="signature-meter" aria-hidden="true">
          <motion.span style={{ scaleX: reduced ? 1 : progress }} />
        </div>
      </div>
    </section>
  );
}
