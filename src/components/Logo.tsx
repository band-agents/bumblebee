import { memo, useId } from "react";

type LogoVariant = "mark" | "wordmark" | "full";
type LogoTheme = "dark" | "light" | "gold";

interface LogoProps {
  variant?: LogoVariant;
  /** Omit to follow the app theme (graphite on light, warm-white on dark). */
  theme?: LogoTheme;
  size?: number;
  className?: string;
}

/**
 * Bumblebee mark — six shapes, no sharp corners, built to survive 16px.
 *
 * The three themes are duotones, not colourways:
 *   dark   graphite bee for light surfaces  (the default, in-app)
 *   light  warm-white bee for dark surfaces
 *   gold   single-brand stamp — signature body, deep-honey detail. Use where
 *          the mark appears without the interface around it: app icon,
 *          invoices, favicon.
 *
 * Rule: on a light surface the mark and the wordmark never both carry yellow.
 * The bee holds the colour; the wordmark stays graphite.
 */
const colors: Record<LogoTheme, { ink: string; accent: string; wing: number; text: string }> = {
  dark:  { ink: "#2B2317", accent: "#F2C636", wing: 0.6,  text: "#2B2317" },
  light: { ink: "#F8F6F2", accent: "#F7D964", wing: 0.42, text: "#F8F6F2" },
  gold:  { ink: "#F5E484", accent: "#8A6A12", wing: 0.85, text: "#F5E484" },
};

function BeeMark({ size, theme }: { size: number; theme?: LogoTheme }) {
  // No theme prop -> follow the CSS vars, which flip under .dark
  const { ink, accent, wing } = theme
    ? colors[theme]
    : { ink: "var(--logo-ink)", accent: "var(--logo-accent)", wing: "var(--logo-wing)" as unknown as number };
  // Scoped so several marks can share a page without colliding clip ids.
  const clipId = `bb-abd-${useId().replace(/:/g, "")}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clipId}>
          <path d="M32 29.2C38.3 29.2 41.2 35.4 41.2 42C41.2 51.5 37.3 61.5 32 61.5C26.7 61.5 22.8 51.5 22.8 42C22.8 35.4 25.7 29.2 32 29.2Z" />
        </clipPath>
      </defs>

      {/* wings — swept, translucent, behind everything */}
      <g fill={accent} opacity={wing}>
        <path d="M35.4 27.2C38.4 21.6 45.6 13.8 52.8 10.2C57.4 7.9 61.6 8.4 62 12.4C62.4 16.8 57.6 24.4 51 28.4C46.2 31.3 40.6 32.3 37.4 31.4C34.7 30.6 34.2 29.4 35.4 27.2Z" />
        <path d="M28.6 27.2C25.6 21.6 18.4 13.8 11.2 10.2C6.6 7.9 2.4 8.4 2 12.4C1.6 16.8 6.4 24.4 13 28.4C17.8 31.3 23.4 32.3 26.6 31.4C29.3 30.6 29.8 29.4 28.6 27.2Z" />
      </g>

      {/* antennae */}
      <g stroke={ink} strokeWidth="2.2" strokeLinecap="round" fill="none">
        <path d="M28.4 12.4C26.2 8.8 24.4 6.2 22.6 4.2" />
        <path d="M35.6 12.4C37.8 8.8 39.6 6.2 41.4 4.2" />
      </g>
      <g fill={ink}>
        <circle cx="22" cy="3.7" r="1.6" />
        <circle cx="42" cy="3.7" r="1.6" />
      </g>

      {/* abdomen + stripes */}
      <path
        d="M32 29.2C38.3 29.2 41.2 35.4 41.2 42C41.2 51.5 37.3 61.5 32 61.5C26.7 61.5 22.8 51.5 22.8 42C22.8 35.4 25.7 29.2 32 29.2Z"
        fill={ink}
      />
      <g clipPath={`url(#${clipId})`} stroke={accent} fill="none" strokeLinecap="butt">
        <path d="M19 36.4Q32 40.4 45 36.4" strokeWidth="6.2" />
        <path d="M21 48.6Q32 52.2 43 48.6" strokeWidth="4.8" />
      </g>

      {/* thorax + head */}
      <ellipse cx="32" cy="27.6" rx="8.6" ry="7" fill={accent} />
      <circle cx="32" cy="18" r="8.1" fill={ink} />

      {/* eyes, then the brows that make it mean business */}
      <g fill={accent}>
        <ellipse cx="27.9" cy="19" rx="2.6" ry="3.5" transform="rotate(-16 27.9 19)" />
        <ellipse cx="36.1" cy="19" rx="2.6" ry="3.5" transform="rotate(16 36.1 19)" />
      </g>
      <g stroke={ink} strokeWidth="2.6" strokeLinecap="round">
        <path d="M23.9 14.4L29.8 17.4" />
        <path d="M40.1 14.4L34.2 17.4" />
      </g>
    </svg>
  );
}

function Wordmark({ size, theme, className = "" }: { size: number; theme?: LogoTheme; className?: string }) {
  return (
    <span
      className={`leading-none ${className}`}
      style={{
        fontFamily: "'Fredoka', var(--app-font-serif)",
        fontWeight: 600,
        fontSize: size,
        letterSpacing: "0.045em",
        color: theme ? colors[theme].text : "var(--logo-ink)",
      }}
    >
      Bumblebee
    </span>
  );
}

function _Logo({ variant = "mark", theme, size = 20, className = "" }: LogoProps) {
  if (variant === "mark") {
    return <BeeMark size={size} theme={theme} />;
  }

  if (variant === "wordmark") {
    return <Wordmark size={size} theme={theme} className={className} />;
  }

  // variant === "full" — gap is 0.28 x the mark
  return (
    <div className={`flex items-center ${className}`} style={{ gap: Math.round(size * 0.28) }}>
      <BeeMark size={size} theme={theme} />
      <Wordmark size={Math.round(size * 0.82)} theme={theme} />
    </div>
  );
}

export const Logo = memo(_Logo);
