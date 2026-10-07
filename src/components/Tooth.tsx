import { useId } from "react";
export default function Tooth({
  variant = "veneer",
  className = "",
}: {
  variant?: string;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      className={className}
      viewBox="0 0 240 240"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={id}
          x1="65"
          y1="35"
          x2="182"
          y2="208"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fff0bd" />
          <stop offset=".45" stopColor="#d9b973" />
          <stop offset=".7" stopColor="#876329" />
          <stop offset="1" stopColor="#ebce8c" />
        </linearGradient>
        <filter id={`${id}s`}>
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>
      <ellipse
        cx="124"
        cy="207"
        rx="52"
        ry="10"
        fill="#18392c"
        opacity=".12"
        filter={`url(#${id}s)`}
      />
      {variant === "implant" ? (
        <>
          <path
            d="m96 115 8 72q16 27 32 0l8-72"
            fill={`url(#${id})`}
            stroke="#a9874c"
          />
          {[130, 144, 158, 172, 186].map((y) => (
            <path
              key={y}
              d={`m100 ${y} 40-5`}
              stroke="#604721"
              strokeWidth="5"
              strokeLinecap="round"
            />
          ))}
          <path
            d="M72 68C70 34 104 34 120 43c17-9 48-8 48 23v45q-48 17-96 0Z"
            fill={`url(#${id})`}
          />
        </>
      ) : (
        <path
          d="M64 77c-8-39 24-52 55-36 34-17 66-4 60 35-4 29-13 45-19 70-6 25-13 48-24 48-12 0-6-52-17-52-12 0-6 52-19 52-10 0-16-22-23-48-6-23-10-43-13-69Z"
          fill={`url(#${id})`}
          stroke="#d9ba79"
          strokeWidth=".65"
        />
      )}
      <path
        d="M79 67q5-23 30-15"
        stroke="white"
        strokeWidth="7"
        strokeLinecap="round"
        opacity=".65"
      />
      {variant === "crown" && (
        <path d="m72 98 95 0" stroke="#b69c59" strokeWidth="3" />
      )}
      {variant === "alignment" && (
        <>
          <path d="M64 97q54 22 116 0" stroke="#84988c" strokeWidth="3" />
          {[85, 113, 143, 166].map((x) => (
            <rect
              key={x}
              x={x - 5}
              y="94"
              width="12"
              height="14"
              rx="3"
              fill="#eee"
              stroke="#869b8f"
            />
          ))}
        </>
      )}
      {variant === "whitening" && (
        <g stroke="#71965b" strokeWidth="2">
          <path d="M184 30v26m-13-13h26M56 123v18m-9-9h18" />
        </g>
      )}
    </svg>
  );
}
