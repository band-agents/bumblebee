import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

/**
 * Buzz's launcher.
 *
 * The assistant is named after the mark, so it launches from the mark rather
 * than a generic sparkle. The wings are separate <g> elements so they can beat
 * independently of the body.
 *
 * Restraint matters here: this button sits on screen for eight hours. The idle
 * state is a slow breath and a barely-there drift — motion you notice only if
 * you look at it. The wing beat is reserved for hover, where it is a response
 * rather than a distraction. Everything stops for prefers-reduced-motion.
 */

const WING_L = "M28.6 27.2C25.6 21.6 18.4 13.8 11.2 10.2C6.6 7.9 2.4 8.4 2 12.4C1.6 16.8 6.4 24.4 13 28.4C17.8 31.3 23.4 32.3 26.6 31.4C29.3 30.6 29.8 29.4 28.6 27.2Z";
const WING_R = "M35.4 27.2C38.4 21.6 45.6 13.8 52.8 10.2C57.4 7.9 61.6 8.4 62 12.4C62.4 16.8 57.6 24.4 51 28.4C46.2 31.3 40.6 32.3 37.4 31.4C34.7 30.6 34.2 29.4 35.4 27.2Z";
const ABDOMEN = "M32 29.2C38.3 29.2 41.2 35.4 41.2 42C41.2 51.5 37.3 61.5 32 61.5C26.7 61.5 22.8 51.5 22.8 42C22.8 35.4 25.7 29.2 32 29.2Z";

export function BuzzLauncher({
  isOpen, onClick, ar,
}: { isOpen: boolean; onClick: () => void; ar?: boolean }) {
  return (
    <motion.button
      onClick={onClick}
      aria-label={ar ? (isOpen ? "إغلاق باز" : "افتح باز") : isOpen ? "Close Buzz" : "Ask Buzz"}
      title={ar ? "اسأل باز" : "Ask Buzz"}
      className="buzz-btn group fixed bottom-6 end-6 z-50 w-14 h-14 rounded-full flex items-center justify-center
                 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-ink"
      style={{
        background: "radial-gradient(120% 120% at 30% 20%, hsl(51 90% 80%), hsl(46 88% 58%) 62%, hsl(41 82% 48%))",
        boxShadow: "0 6px 20px -4px hsl(40 82% 32% / .40), 0 2px 6px -2px hsl(40 82% 32% / .30)",
      }}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.07, y: -3 }}
      whileTap={{ scale: 0.93 }}
      transition={{ type: "spring", stiffness: 420, damping: 26 }}
    >
      {/* Breathing halo — slow enough to read as alive, not as an alert. */}
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-full motion-reduce:hidden"
        style={{ boxShadow: "0 0 0 0 hsl(46 88% 58% / .55)" }}
        animate={{ boxShadow: [
          "0 0 0 0 hsl(46 88% 58% / .45)",
          "0 0 0 10px hsl(46 88% 58% / 0)",
        ] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeOut", repeatDelay: 1.1 }}
      />

      <AnimatePresence mode="wait" initial={false}>
        {isOpen ? (
          <motion.span
            key="close"
            className="text-[hsl(36_30%_13%)]"
            initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.16 }}
          >
            <X size={21} strokeWidth={2.4} />
          </motion.span>
        ) : (
          <motion.span
            key="bee"
            className="motion-reduce:animate-none"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1, y: [0, -1.4, 0] }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{
              opacity: { duration: 0.16 }, scale: { duration: 0.16 },
              y: { duration: 3.4, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <svg width="30" height="30" viewBox="0 0 64 64" fill="none" aria-hidden className="overflow-visible">
              {/* wings — behind the body, hinged at the wing root */}
              <g className="buzz-wing buzz-wing-l" fill="hsl(45 90% 96%)" opacity={0.72}>
                <path d={WING_L} />
              </g>
              <g className="buzz-wing buzz-wing-r" fill="hsl(45 90% 96%)" opacity={0.72}>
                <path d={WING_R} />
              </g>

              {/* antennae */}
              <g stroke="hsl(36 32% 14%)" strokeWidth="2.4" strokeLinecap="round" fill="none">
                <path d="M28.4 12.4C26.2 8.8 24.4 6.2 22.6 4.2" />
                <path d="M35.6 12.4C37.8 8.8 39.6 6.2 41.4 4.2" />
              </g>
              <g fill="hsl(36 32% 14%)">
                <circle cx="22" cy="3.7" r="1.9" /><circle cx="42" cy="3.7" r="1.9" />
              </g>

              {/* body */}
              <defs>
                <clipPath id="buzz-abd"><path d={ABDOMEN} /></clipPath>
              </defs>
              <path d={ABDOMEN} fill="hsl(36 32% 14%)" />
              <g clipPath="url(#buzz-abd)" stroke="hsl(48 92% 70%)" fill="none">
                <path d="M19 36.4Q32 40.4 45 36.4" strokeWidth="6.4" />
                <path d="M21 48.6Q32 52.2 43 48.6" strokeWidth="5" />
              </g>
              <ellipse cx="32" cy="27.6" rx="8.6" ry="7" fill="hsl(48 92% 70%)" />
              <circle cx="32" cy="18" r="8.1" fill="hsl(36 32% 14%)" />

              {/* eyes + the brows that keep it cheeky rather than cute */}
              <g fill="hsl(48 92% 70%)">
                <ellipse cx="27.9" cy="19" rx="2.6" ry="3.5" transform="rotate(-16 27.9 19)" />
                <ellipse cx="36.1" cy="19" rx="2.6" ry="3.5" transform="rotate(16 36.1 19)" />
              </g>
              <g stroke="hsl(36 32% 14%)" strokeWidth="2.7" strokeLinecap="round">
                <path d="M23.9 14.4L29.8 17.4" />
                <path d="M40.1 14.4L34.2 17.4" />
              </g>
            </svg>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
