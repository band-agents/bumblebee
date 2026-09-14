import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link, useLocation } from "wouter";
import {
  ChevronLeft, ChevronRight, ChevronDown, Clock, Star, Check,
} from "lucide-react";
import { SECTIONS, ALL_ITEMS, activeItemPath, sectionForPath } from "./ShellNav";
import { useLanguage } from "../context/LanguageContext";
import { storageKey } from "../lib/brand";

/**
 * The header's navigation intelligence.
 *
 * Four things the old header could not do: go back, jump sideways to a sibling
 * page without touching the rail, return to somewhere you were recently, and
 * keep the handful of pages you actually live in one click away.
 *
 * Recents were tracked all along under bumblebee_recent_pages but the old
 * sidebar was the only thing surfacing them; the rail rewrite orphaned that.
 * This puts them back, in a place that suits them better.
 */

const RECENT_KEY = storageKey("recent_pages");
const PINS_KEY = storageKey("pinned_pages");
const MAX_RECENT = 12;

function readList(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    const v = raw ? JSON.parse(raw) : [];
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch { return []; }
}
function writeList(key: string, v: string[]) {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* storage blocked */ }
}

function labelFor(path: string, ar: boolean): string | null {
  const i = ALL_ITEMS.find((x) => x.path === path);
  return i ? (ar ? i.labelAr : i.label) : null;
}

/** Close on outside click or Escape. */
function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  return ref;
}

const MENU_CLS =
  "absolute top-full mt-1.5 start-0 min-w-[224px] max-h-[60vh] overflow-y-auto z-50 " +
  "rounded-xl border border-popover-border bg-popover shadow-lg p-1.5 flex flex-col gap-0.5";
const ROW_CLS =
  "flex items-center gap-2 h-8 px-2.5 rounded-lg text-body text-foreground/80 " +
  "hover:bg-accent hover:text-foreground transition-colors truncate";
const ICON_BTN =
  "w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground " +
  "hover:text-foreground hover:bg-accent transition-colors disabled:opacity-35 " +
  "disabled:hover:bg-transparent disabled:hover:text-muted-foreground disabled:cursor-default";

// ─── Back / forward ───────────────────────────────────────

export function HistoryNav({ ar }: { ar: boolean }) {
  const [location] = useLocation();
  // wouter has no history depth, so track our own: how many pushes deep are we.
  const depth = useRef(0);
  const [canBack, setCanBack] = useState(false);
  useEffect(() => { depth.current += 1; setCanBack(depth.current > 1); }, [location]);

  return (
    <div className="hidden lg:flex items-center gap-0.5 shrink-0">
      <button
        type="button" onClick={() => window.history.back()} disabled={!canBack}
        aria-label={ar ? "رجوع" : "Back"} title={ar ? "رجوع" : "Back"}
        className={ICON_BTN + " rtl:rotate-180"}
      >
        <ChevronLeft size={17} strokeWidth={1.9} />
      </button>
      <button
        type="button" onClick={() => window.history.forward()}
        aria-label={ar ? "تقدم" : "Forward"} title={ar ? "تقدم" : "Forward"}
        className={ICON_BTN + " rtl:rotate-180"}
      >
        <ChevronRight size={17} strokeWidth={1.9} />
      </button>
    </div>
  );
}

// ─── Breadcrumb with a sibling switcher ───────────────────

export function SmartBreadcrumb({ ar }: { ar: boolean }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useDismiss(open, close);

  const sectionId = useMemo(() => sectionForPath(location), [location]);
  const section = SECTIONS.find((s) => s.id === sectionId) ?? SECTIONS[0];
  const current = useMemo(() => activeItemPath(location), [location]);
  const currentLabel = (current && labelFor(current, ar)) ?? (ar ? section.labelAr : section.label);

  const siblings = (section.groups ?? []).flatMap((g) => g.items);

  useEffect(() => { setOpen(false); }, [location]);

  return (
    <div className="flex items-center gap-1.5 min-w-0" ref={ref}>
      <span className="bb-eyebrow hidden sm:inline select-none shrink-0">
        {ar ? section.labelAr : section.label}
      </span>
      <span className="text-border/80 text-caption hidden sm:inline select-none shrink-0">/</span>

      <div className="relative min-w-0">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          disabled={siblings.length < 2}
          className="flex items-center gap-1 max-w-full h-8 px-1.5 -ms-1.5 rounded-lg
                     hover:bg-accent transition-colors disabled:hover:bg-transparent group"
          aria-haspopup={siblings.length > 1} aria-expanded={open}
        >
          <h1 className="text-body font-semibold text-foreground truncate" style={{ letterSpacing: "-0.01em" }}>
            {currentLabel}
          </h1>
          {siblings.length > 1 && (
            <ChevronDown
              size={13} strokeWidth={2}
              className={`shrink-0 text-muted-foreground/70 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
            />
          )}
        </button>

        {open && siblings.length > 1 && (
          <div className={MENU_CLS}>
            {(section.groups ?? []).map((g) => (
              <div key={g.label} className="flex flex-col gap-0.5">
                {(section.groups ?? []).length > 1 && (
                  <div className="text-micro uppercase tracking-[0.09em] text-muted-foreground/70 px-2.5 pt-1.5 pb-1 font-semibold">
                    {ar ? g.labelAr : g.label}
                  </div>
                )}
                {g.items.map((i) => (
                  <Link key={i.id} href={i.path} className={ROW_CLS}>
                    <span className="flex-1 truncate">{ar ? i.labelAr : i.label}</span>
                    {i.path === current && <Check size={14} className="text-brand-ink shrink-0" />}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Recents ──────────────────────────────────────────────

export function RecentsMenu({ ar }: { ar: boolean }) {
  const [location] = useLocation();
  const [recent, setRecent] = useState<string[]>(() => readList(RECENT_KEY));
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useDismiss(open, close);

  // Record every visit that maps to a known page, newest first, no duplicates.
  useEffect(() => {
    const p = activeItemPath(location);
    if (!p) return;
    setRecent((prev) => {
      const next = [p, ...prev.filter((x) => x !== p)].slice(0, MAX_RECENT);
      writeList(RECENT_KEY, next);
      return next;
    });
  }, [location]);

  const items = recent.filter((p) => p !== activeItemPath(location)).slice(0, 8);

  return (
    <div className="relative hidden md:block" ref={ref}>
      <button
        type="button" onClick={() => setOpen((v) => !v)}
        aria-label={ar ? "المواضع الأخيرة" : "Recent pages"} title={ar ? "المواضع الأخيرة" : "Recent"}
        className={ICON_BTN} aria-expanded={open}
      >
        <Clock size={15} strokeWidth={1.85} />
      </button>
      {open && (
        <div className={MENU_CLS + " end-0 start-auto"}>
          <div className="text-micro uppercase tracking-[0.09em] text-muted-foreground/70 px-2.5 pt-1 pb-1.5 font-semibold">
            {ar ? "زرت مؤخرًا" : "Recently visited"}
          </div>
          {items.length === 0 ? (
            <div className="px-2.5 py-2 text-body text-muted-foreground">
              {ar ? "لا يوجد بعد" : "Nothing yet"}
            </div>
          ) : items.map((p) => (
            <Link key={p} href={p} className={ROW_CLS} onClick={close}>
              <Clock size={13} className="text-muted-foreground/60 shrink-0" />
              <span className="truncate">{labelFor(p, ar) ?? p}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Pinned pages ─────────────────────────────────────────

export function PinsMenu({ ar }: { ar: boolean }) {
  const [location] = useLocation();
  const [pins, setPins] = useState<string[]>(() => readList(PINS_KEY));
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useDismiss(open, close);

  const current = activeItemPath(location);
  const pinned = !!current && pins.includes(current);

  const toggle = () => {
    if (!current) return;
    setPins((prev) => {
      const next = prev.includes(current) ? prev.filter((p) => p !== current) : [...prev, current];
      writeList(PINS_KEY, next);
      return next;
    });
  };

  return (
    <div className="flex items-center gap-0.5 shrink-0" ref={ref}>
      <button
        type="button" onClick={toggle} disabled={!current}
        aria-label={pinned ? (ar ? "إزالة التثبيت" : "Unpin page") : (ar ? "تثبيت الصفحة" : "Pin page")}
        title={pinned ? (ar ? "إزالة التثبيت" : "Unpin this page") : (ar ? "تثبيت الصفحة" : "Pin this page")}
        className={ICON_BTN}
      >
        <Star
          size={15} strokeWidth={1.85}
          className={pinned ? "text-brand-ink" : ""}
          fill={pinned ? "currentColor" : "none"}
        />
      </button>

      {pins.length > 0 && (
        <div className="relative hidden md:block">
          <button
            type="button" onClick={() => setOpen((v) => !v)}
            aria-label={ar ? "المثبتة" : "Pinned pages"} className={ICON_BTN} aria-expanded={open}
          >
            <ChevronDown size={13} strokeWidth={2.1} />
          </button>
          {open && (
            <div className={MENU_CLS + " end-0 start-auto"}>
              <div className="text-micro uppercase tracking-[0.09em] text-muted-foreground/70 px-2.5 pt-1 pb-1.5 font-semibold">
                {ar ? "المثبتة" : "Pinned"}
              </div>
              {pins.map((p) => (
                <Link key={p} href={p} className={ROW_CLS} onClick={close}>
                  <Star size={13} className="text-brand-ink shrink-0" fill="currentColor" />
                  <span className="truncate">{labelFor(p, ar) ?? p}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
