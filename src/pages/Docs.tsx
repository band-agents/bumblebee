/**
 * Bumblebee Help Center — public, no sign-in needed.
 *
 *   /docs                  home: search, categories, popular questions
 *   /docs/<slug>           article: text on the left, screenshot on the right
 *   /docs/troubleshooting  symptom → cause → fix
 *   /docs/faq              every question, grouped
 *
 * Content lives in src/docs/*.ts and is shared with the PDF (/docs/print).
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowRight, ArrowLeft, BookOpen, Boxes, ChevronDown, Compass, Download, Factory, FileText, HelpCircle,
  Landmark, Menu, Search, Settings, ShoppingBag, Sparkles, Users, Wrench, X, ZoomIn, LifeBuoy,
} from "lucide-react";
import { CoBrand } from "./AuthPage";
import { CATEGORIES, ARTICLES, ARTICLE_BY_SLUG } from "../docs/articles";
import { ISSUES, FAQS } from "../docs/support";
import { Blocks, Inline, blocksText, shotSrc } from "../docs/render";
import type { Article, CategoryId } from "../docs/types";

const ICONS: Record<string, React.ElementType> = { Compass, ShoppingBag, Factory, Boxes, Landmark, FileText, Users, Settings, Sparkles };
const PDF_HREF = "/docs/Bumblebee-Documentation.pdf";

// ─── Search ───────────────────────────────────────────────

type Hit = { kind: "article" | "issue" | "faq"; title: string; sub: string; href: string; score: number };

function useSearchIndex() {
  return useMemo(() => {
    const items: Omit<Hit, "score">[] & { text: string }[] = [];
    for (const a of ARTICLES) {
      items.push({ kind: "article", title: a.title, sub: a.summary, href: `/docs/${a.slug}`, text: `${a.title} ${a.summary}` } as never);
      for (const s of a.sections) {
        items.push({ kind: "article", title: `${a.title} › ${s.heading}`, sub: blocksText(s.blocks).slice(0, 140), href: `/docs/${a.slug}#${s.id}`, text: `${s.heading} ${blocksText(s.blocks)}` } as never);
      }
    }
    for (const i of ISSUES) items.push({ kind: "issue", title: i.symptom, sub: i.message ?? i.cause, href: `/docs/troubleshooting#${i.slug}`, text: `${i.symptom} ${i.message ?? ""} ${i.cause} ${i.fix.join(" ")} ${i.area}` } as never);
    FAQS.forEach((f, n) => items.push({ kind: "faq", title: f.q, sub: f.a.replace(/\*\*|`|\[|\]\([^)]*\)/g, "").slice(0, 140), href: `/docs/faq#q${n}`, text: `${f.q} ${f.a}` } as never));
    return items as (Omit<Hit, "score"> & { text: string })[];
  }, []);
}

function search(index: (Omit<Hit, "score"> & { text: string })[], q: string): Hit[] {
  const words = q.toLowerCase().split(/\s+/).filter((w) => w.length > 1);
  if (!words.length) return [];
  const hits: Hit[] = [];
  for (const it of index) {
    const title = it.title.toLowerCase();
    const text = it.text.toLowerCase();
    let score = 0;
    for (const w of words) {
      if (title.includes(w)) score += 5;
      else if (text.includes(w)) score += 1;
      else { score = -1; break; }
    }
    if (score > 0) hits.push({ ...it, score: score + (it.kind === "issue" ? 1 : 0) });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, 12);
}

function SearchBox({ big = false, autoFocus = false }: { big?: boolean; autoFocus?: boolean }) {
  const index = useSearchIndex();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();
  const hits = useMemo(() => search(index, q), [index, q]);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  const go = (href: string) => { setOpen(false); setQ(""); navigate(href); };

  return (
    <div ref={box} className="relative w-full">
      <label className={`flex items-center gap-3 rounded-2xl border border-border bg-card focus-within:ring-2 focus-within:ring-ring/30 ${big ? "h-14 px-5 shadow-sm" : "h-10 px-3.5"}`}>
        <Search size={big ? 19 : 15} className="text-muted-foreground shrink-0" />
        <input
          value={q} autoFocus={autoFocus}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => { if (e.key === "Enter" && hits[0]) go(hits[0].href); if (e.key === "Escape") setOpen(false); }}
          placeholder={big ? "Search: invoice a deposit, reset a password, print margins…" : "Search the docs"}
          className={`flex-1 min-w-0 bg-transparent outline-none placeholder:text-muted-foreground/70 ${big ? "text-[1.05rem]" : "text-body"}`}
          aria-label="Search the documentation"
        />
        {q && <button onClick={() => setQ("")} aria-label="Clear"><X size={15} className="text-muted-foreground" /></button>}
      </label>
      {open && q.trim().length > 1 && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border border-border bg-card shadow-xl overflow-hidden max-h-[70vh] overflow-y-auto">
          {hits.length === 0 ? (
            <div className="p-5 text-body text-muted-foreground">
              No results for “{q}”. Try other words, or browse <Link href="/docs/troubleshooting" className="underline">Troubleshooting</Link> and the <Link href="/docs/faq" className="underline">FAQ</Link>.
            </div>
          ) : hits.map((h) => (
            <button key={h.href + h.title} onClick={() => go(h.href)} className="w-full text-start px-4 py-3 hover:bg-brand-wash border-b border-border/50 last:border-0 flex gap-3">
              <span className={`mt-0.5 shrink-0 text-[10px] font-bold uppercase tracking-wide rounded-md px-1.5 py-0.5 h-fit ${h.kind === "issue" ? "bg-rose-100 text-rose-700" : h.kind === "faq" ? "bg-sky-100 text-sky-700" : "bg-primary/60 text-foreground"}`}>
                {h.kind === "issue" ? "Fix" : h.kind === "faq" ? "FAQ" : "Guide"}
              </span>
              <span className="min-w-0">
                <span className="block text-body font-medium text-foreground truncate">{h.title}</span>
                <span className="block text-caption text-muted-foreground line-clamp-2">{h.sub}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Shell ────────────────────────────────────────────────

function Header() {
  const [location] = useLocation();
  const [menu, setMenu] = useState(false);
  const nav = [
    { href: "/docs", label: "Guides" },
    { href: "/docs/troubleshooting", label: "Troubleshooting" },
    { href: "/docs/faq", label: "FAQ" },
  ];
  const active = (href: string) => href === "/docs"
    ? location === "/docs" || (location.startsWith("/docs/") && !["/docs/troubleshooting", "/docs/faq"].includes(location))
    : location === href;
  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/60">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="hidden md:inline-flex"><CoBrand size={20} /></span><a href="/" className="md:hidden font-semibold" style={{ fontFamily: "var(--app-font-serif)" }}>Bumblebee</a>
          <span className="hidden sm:inline text-muted-foreground/40">/</span>
          <Link href="/docs" className="hidden sm:inline font-semibold text-foreground whitespace-nowrap" style={{ fontFamily: "var(--app-font-serif)" }}>Help Center</Link>
        </div>
        <nav className="hidden md:flex items-center gap-1 ms-4">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className={`px-3 py-1.5 rounded-lg text-body transition-colors ${active(n.href) ? "bg-primary/50 text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}>{n.label}</Link>
          ))}
        </nav>
        <div className="flex-1" />
        <div className="hidden lg:block w-[300px]"><SearchBox /></div>
        <a href={PDF_HREF} download className="hidden sm:inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-border bg-card text-body font-medium hover:bg-brand-wash transition-colors">
          <Download size={15} /> PDF
        </a>
        <a href="/auth" className="hidden sm:inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-body font-semibold hover:brightness-[0.97] whitespace-nowrap">
          Sign in <ArrowRight size={15} />
        </a>
        <button className="md:hidden w-10 h-10 grid place-items-center rounded-xl border border-border" onClick={() => setMenu(!menu)} aria-label="Menu"><Menu size={17} /></button>
      </div>
      {menu && (
        <div className="md:hidden border-t border-border px-4 py-3 space-y-2 bg-background">
          <SearchBox />
          {nav.map((n) => <Link key={n.href} href={n.href} onClick={() => setMenu(false)} className="block px-2 py-2 rounded-lg text-body">{n.label}</Link>)}
          <a href={PDF_HREF} download className="block px-2 py-2 text-body">Download PDF</a>
          <a href="/auth" className="block px-2 py-2 text-body font-semibold">Sign in</a>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border mt-20">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row gap-3 items-center justify-between text-caption text-muted-foreground">
        <span>Bumblebee Help Center · for CUBS</span>
        <span className="flex gap-4">
          <Link href="/docs" className="hover:text-foreground">Guides</Link>
          <Link href="/docs/troubleshooting" className="hover:text-foreground">Troubleshooting</Link>
          <Link href="/docs/faq" className="hover:text-foreground">FAQ</Link>
          <a href="/" className="hover:text-foreground">Bumblebee</a>
        </span>
      </div>
    </footer>
  );
}

function Sidebar({ current, onPick }: { current?: string; onPick?: () => void }) {
  return (
    <nav className="space-y-6 text-body">
      {CATEGORIES.map((c) => {
        const list = ARTICLES.filter((a) => a.category === c.id);
        return (
          <div key={c.id}>
            <p className="text-caption font-semibold uppercase tracking-wider text-muted-foreground mb-2">{c.title}</p>
            <ul className="space-y-0.5">
              {list.map((a) => (
                <li key={a.slug}>
                  <Link href={`/docs/${a.slug}`} onClick={onPick}
                    className={`block px-2.5 py-1.5 rounded-lg leading-snug transition-colors ${current === a.slug ? "bg-primary/50 text-foreground font-medium" : "text-foreground/70 hover:text-foreground hover:bg-muted/60"}`}>
                    {a.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      <div>
        <p className="text-caption font-semibold uppercase tracking-wider text-muted-foreground mb-2">Help</p>
        <Link href="/docs/troubleshooting" onClick={onPick} className="block px-2.5 py-1.5 rounded-lg text-foreground/70 hover:bg-muted/60">Troubleshooting</Link>
        <Link href="/docs/faq" onClick={onPick} className="block px-2.5 py-1.5 rounded-lg text-foreground/70 hover:bg-muted/60">FAQ</Link>
      </div>
    </nav>
  );
}

function Lightbox({ src, caption, onClose }: { src: string; caption?: string; onClose: () => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm p-4 sm:p-10 flex flex-col items-center justify-center" onClick={onClose} role="dialog" aria-label={caption}>
      <img src={src} alt={caption ?? ""} className="max-w-full max-h-[85vh] rounded-xl shadow-2xl bg-white" />
      {caption && <p className="mt-3 text-white/80 text-body">{caption}</p>}
      <button className="absolute top-4 end-4 w-10 h-10 rounded-full bg-white/10 text-white grid place-items-center" aria-label="Close"><X size={18} /></button>
    </div>
  );
}

function Shot({ name, caption, onZoom }: { name: string; caption?: string; onZoom: () => void }) {
  const print = name.startsWith("print-");
  return (
    <figure className="group">
      <button onClick={onZoom} className="relative block w-full rounded-2xl overflow-hidden border border-border bg-card shadow-[0_18px_40px_-24px_rgba(40,30,10,0.35)] hover:shadow-[0_22px_50px_-22px_rgba(40,30,10,0.45)] transition-shadow">
        <img src={shotSrc(name)} alt={caption ?? name} loading="lazy" className={`w-full h-auto block ${print ? "bg-white" : ""}`} />
        <span className="absolute top-3 end-3 w-8 h-8 rounded-full bg-background/90 border border-border grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity"><ZoomIn size={15} /></span>
      </button>
      {caption && <figcaption className="mt-2.5 text-caption text-muted-foreground text-center">{caption}</figcaption>}
    </figure>
  );
}

// ─── Home ─────────────────────────────────────────────────

function Home() {
  return (
    <>
      <section className="relative">
        <div aria-hidden className="absolute inset-x-0 top-0 h-[420px] pointer-events-none" style={{ background: "radial-gradient(50% 70% at 50% 0%, hsl(var(--brand) / .5) 0%, transparent 70%)" }} />
        <div className="relative max-w-[860px] mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12 text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-caption font-medium text-foreground/80 mb-6">
            <BookOpen size={14} /> Bumblebee Help Center
          </p>
          <h1 className="text-[clamp(2.1rem,5vw,3.4rem)] leading-[1.05] tracking-[-0.02em]">How can we help?</h1>
          <p className="mt-4 text-[1.08rem] text-muted-foreground max-w-[56ch] mx-auto">
            Step-by-step guides for every screen, fixes for every error message, and answers to the questions people actually ask.
          </p>
          <div className="mt-8 max-w-[640px] mx-auto text-start"><SearchBox big /></div>
          <div className="mt-5 flex flex-wrap justify-center gap-2 text-caption">
            {[["Invoice a deposit", "/docs/invoices"], ["Receive goods", "/docs/receiving-goods"], ["Create a login", "/docs/users-and-access"], ["Print settings", "/docs/printing-documents"], ["Fix a wrong payment", "/docs/fixing-mistakes"]].map(([l, h]) => (
              <Link key={h} href={h} className="px-3 py-1.5 rounded-full border border-border bg-card hover:bg-brand-wash text-foreground/80">{l}</Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map((c) => {
            const Icon = ICONS[c.icon] ?? BookOpen;
            const list = ARTICLES.filter((a) => a.category === c.id);
            return (
              <div key={c.id} className="rounded-2xl border border-border bg-card p-5 flex flex-col">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-10 h-10 rounded-xl bg-primary/50 grid place-items-center"><Icon size={18} /></span>
                  <h2 className="text-title font-semibold" style={{ fontFamily: "var(--app-font-serif)" }}>{c.title}</h2>
                </div>
                <p className="text-body text-muted-foreground mb-3">{c.blurb}</p>
                <ul className="space-y-1 mt-auto">
                  {list.map((a) => (
                    <li key={a.slug}>
                      <Link href={`/docs/${a.slug}`} className="flex items-center justify-between gap-2 text-body text-foreground/85 hover:text-foreground py-1 group">
                        <span>{a.title}</span><ArrowRight size={14} className="opacity-40 group-hover:opacity-100 shrink-0" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 mt-8 grid md:grid-cols-2 gap-4">
        <Link href="/docs/troubleshooting" className="rounded-2xl border border-border bg-card p-6 hover:bg-brand-wash transition-colors">
          <div className="flex items-center gap-3 mb-2"><span className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 grid place-items-center"><LifeBuoy size={18} /></span>
            <h2 className="text-title font-semibold" style={{ fontFamily: "var(--app-font-serif)" }}>Something's not working</h2></div>
          <p className="text-body text-muted-foreground">{ISSUES.length} problems with the exact message you see, why it happens and how to fix it.</p>
        </Link>
        <Link href="/docs/faq" className="rounded-2xl border border-border bg-card p-6 hover:bg-brand-wash transition-colors">
          <div className="flex items-center gap-3 mb-2"><span className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 grid place-items-center"><HelpCircle size={18} /></span>
            <h2 className="text-title font-semibold" style={{ fontFamily: "var(--app-font-serif)" }}>Frequently asked questions</h2></div>
          <p className="text-body text-muted-foreground">{FAQS.length} short answers about access, numbers, money, stock, production and printing.</p>
        </Link>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 mt-8">
        <div className="rounded-3xl bg-primary text-primary-foreground px-6 sm:px-10 py-10 grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <h2 className="text-[clamp(1.4rem,3vw,2rem)] leading-tight">Take the whole guide with you</h2>
            <p className="mt-2 opacity-80 max-w-[60ch]">Every article with screenshots, the troubleshooting guide and the FAQ in one PDF you can print or share.</p>
          </div>
          <a href={PDF_HREF} download className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-foreground text-background font-semibold hover:opacity-90">
            <Download size={16} /> Download the PDF
          </a>
        </div>
      </section>
    </>
  );
}

// ─── Article ──────────────────────────────────────────────

function ArticlePage({ article }: { article: Article }) {
  const [zoom, setZoom] = useState<{ src: string; caption?: string } | null>(null);
  const [menu, setMenu] = useState(false);
  const idx = ARTICLES.indexOf(article);
  const prev = ARTICLES[idx - 1];
  const next = ARTICLES[idx + 1];
  const cat = CATEGORIES.find((c) => c.id === article.category)!;

  useEffect(() => {
    document.title = `${article.title} — Bumblebee Help`;
    const hash = window.location.hash.slice(1);
    if (hash) setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    else window.scrollTo(0, 0);
  }, [article]);

  return (
    <div className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-8 grid lg:grid-cols-[240px_minmax(0,1fr)] gap-10">
      <aside className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pe-2 pb-8"><Sidebar current={article.slug} /></div>
      </aside>

      <article className="min-w-0">
        <button className="lg:hidden mb-4 inline-flex items-center gap-2 h-9 px-3 rounded-xl border border-border text-body" onClick={() => setMenu(!menu)}>
          <Menu size={15} /> All guides <ChevronDown size={14} className={menu ? "rotate-180" : ""} />
        </button>
        {menu && <div className="lg:hidden mb-6 rounded-2xl border border-border bg-card p-4"><Sidebar current={article.slug} onPick={() => setMenu(false)} /></div>}

        <p className="text-caption text-muted-foreground mb-2"><Link href="/docs" className="hover:text-foreground">Guides</Link> / {cat.title}</p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[clamp(1.9rem,4vw,2.8rem)] leading-[1.08] tracking-[-0.02em]">{article.title}</h1>
          {article.status === "preview" && <span className="text-caption font-semibold rounded-full px-2.5 py-1 bg-violet-100 text-violet-700">Preview</span>}
        </div>
        <p className="mt-3 text-[1.1rem] text-muted-foreground max-w-[70ch]">{article.summary}</p>

        {article.sections.length > 2 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {article.sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="text-caption px-3 py-1.5 rounded-full border border-border bg-card hover:bg-brand-wash text-foreground/80">{s.heading}</a>
            ))}
          </div>
        )}

        <div className="mt-10 space-y-16">
          {article.sections.map((s) => (
            <section key={s.id} id={s.id} className={`scroll-mt-24 ${s.shot ? "grid xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-8 xl:gap-10 items-start" : ""}`}>
              <div className={`min-w-0 text-[0.98rem] ${s.shot ? "" : "max-w-[78ch]"}`}>
                <h2 className="text-[1.45rem] leading-tight mb-4 tracking-[-0.01em]">
                  <a href={`#${s.id}`} className="hover:underline decoration-primary decoration-2 underline-offset-4">{s.heading}</a>
                </h2>
                <Blocks blocks={s.blocks} />
              </div>
              {s.shot && (
                <div className="xl:sticky xl:top-24">
                  <Shot name={s.shot} caption={s.caption} onZoom={() => setZoom({ src: shotSrc(s.shot!), caption: s.caption })} />
                </div>
              )}
            </section>
          ))}
        </div>

        {article.related?.length ? (
          <div className="mt-16 rounded-2xl border border-border bg-card p-5">
            <p className="text-caption font-semibold uppercase tracking-wider text-muted-foreground mb-3">Related</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {article.related.map((r) => ARTICLE_BY_SLUG[r] && (
                <Link key={r} href={`/docs/${r}`} className="rounded-xl border border-border/70 px-3.5 py-2.5 hover:bg-brand-wash">
                  <span className="block text-body font-medium">{ARTICLE_BY_SLUG[r].title}</span>
                  <span className="block text-caption text-muted-foreground line-clamp-1">{ARTICLE_BY_SLUG[r].summary}</span>
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-6 rounded-2xl bg-brand-wash/60 border border-border px-5 py-4 flex flex-wrap items-center gap-3 justify-between">
          <p className="text-body text-foreground/80">Seeing an error message? It's probably in the troubleshooting guide.</p>
          <Link href="/docs/troubleshooting" className="inline-flex items-center gap-1.5 text-body font-semibold">Troubleshooting <ArrowRight size={14} /></Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          {prev ? <Link href={`/docs/${prev.slug}`} className="rounded-2xl border border-border p-4 hover:bg-brand-wash"><span className="flex items-center gap-1 text-caption text-muted-foreground"><ArrowLeft size={12} /> Previous</span><span className="block text-body font-medium mt-1">{prev.title}</span></Link> : <span />}
          {next ? <Link href={`/docs/${next.slug}`} className="rounded-2xl border border-border p-4 text-end hover:bg-brand-wash"><span className="flex items-center justify-end gap-1 text-caption text-muted-foreground">Next <ArrowRight size={12} /></span><span className="block text-body font-medium mt-1">{next.title}</span></Link> : <span />}
        </div>
      </article>

      {zoom && <Lightbox src={zoom.src} caption={zoom.caption} onClose={() => setZoom(null)} />}
    </div>
  );
}

// ─── Troubleshooting ──────────────────────────────────────

function Troubleshooting() {
  const areas = useMemo(() => [...new Set(ISSUES.map((i) => i.area))], []);
  const [area, setArea] = useState<string>("all");
  const [q, setQ] = useState("");
  useEffect(() => {
    document.title = "Troubleshooting — Bumblebee Help";
    const hash = window.location.hash.slice(1);
    if (hash) setTimeout(() => { const el = document.getElementById(hash); el?.scrollIntoView({ block: "center" }); el?.classList.add("ring-2", "ring-primary"); }, 80);
  }, []);
  const list = ISSUES.filter((i) => (area === "all" || i.area === area) &&
    (!q.trim() || `${i.symptom} ${i.message ?? ""} ${i.cause} ${i.fix.join(" ")}`.toLowerCase().includes(q.toLowerCase().trim())));

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 pt-10">
      <p className="text-caption text-muted-foreground mb-2"><Link href="/docs" className="hover:text-foreground">Help Center</Link> / Troubleshooting</p>
      <h1 className="text-[clamp(1.9rem,4vw,2.8rem)] leading-tight">Troubleshooting</h1>
      <p className="mt-3 text-[1.08rem] text-muted-foreground max-w-[65ch]">Find the message you see or describe the problem. Each entry says why it happens and exactly what to do.</p>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <label className="flex-1 flex items-center gap-2 h-11 px-3.5 rounded-xl border border-border bg-card">
          <Search size={15} className="text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type the error message or problem" className="flex-1 min-w-0 bg-transparent outline-none text-body" />
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {["all", ...areas].map((a) => (
          <button key={a} onClick={() => setArea(a)} className={`text-caption px-3 py-1.5 rounded-full border ${area === a ? "bg-foreground text-background border-foreground" : "border-border bg-card hover:bg-brand-wash"}`}>
            {a === "all" ? `All (${ISSUES.length})` : a}
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        {list.length === 0 && <p className="text-body text-muted-foreground">Nothing matches. Try fewer words, or check the <Link href="/docs/faq" className="underline">FAQ</Link>.</p>}
        {list.map((i) => (
          <div key={i.slug} id={i.slug} className="scroll-mt-24 rounded-2xl border border-border bg-card p-5 transition-shadow">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="text-title font-semibold" style={{ fontFamily: "var(--app-font-serif)" }}>{i.symptom}</h2>
              <span className="text-micro font-semibold uppercase tracking-wide text-muted-foreground bg-muted/60 rounded-md px-2 py-1">{i.area}</span>
            </div>
            {i.message && <p className="mt-2 inline-block font-mono text-caption rounded-lg bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-1 dark:bg-rose-500/10 dark:text-rose-100 dark:border-rose-500/30">“{i.message}”</p>}
            <div className="mt-3 grid sm:grid-cols-[110px_1fr] gap-x-4 gap-y-2 text-body">
              <span className="text-muted-foreground font-medium">Why</span>
              <span className="text-foreground/85">{i.cause}</span>
              <span className="text-muted-foreground font-medium">What to do</span>
              <ol className="space-y-1">
                {i.fix.map((f, n) => <li key={n} className="flex gap-2 text-foreground/85"><span className="text-muted-foreground tabular-nums">{n + 1}.</span><span>{f}</span></li>)}
              </ol>
            </div>
            {i.link && ARTICLE_BY_SLUG[i.link] && (
              <Link href={`/docs/${i.link}`} className="mt-3 inline-flex items-center gap-1.5 text-caption font-semibold">Read: {ARTICLE_BY_SLUG[i.link].title} <ArrowRight size={12} /></Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── FAQ ──────────────────────────────────────────────────

function FaqPage() {
  const groups = useMemo(() => [...new Set(FAQS.map((f) => f.group))], []);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<number | null>(null);
  useEffect(() => {
    document.title = "FAQ — Bumblebee Help";
    const m = window.location.hash.match(/^#q(\d+)$/);
    if (m) { const n = Number(m[1]); setOpen(n); setTimeout(() => document.getElementById(`q${n}`)?.scrollIntoView({ block: "center" }), 80); }
  }, []);
  const match = (f: (typeof FAQS)[number]) => !q.trim() || `${f.q} ${f.a}`.toLowerCase().includes(q.toLowerCase().trim());

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 pt-10">
      <p className="text-caption text-muted-foreground mb-2"><Link href="/docs" className="hover:text-foreground">Help Center</Link> / FAQ</p>
      <h1 className="text-[clamp(1.9rem,4vw,2.8rem)] leading-tight">Frequently asked questions</h1>
      <label className="mt-6 flex items-center gap-2 h-11 px-3.5 rounded-xl border border-border bg-card">
        <Search size={15} className="text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter questions" className="flex-1 min-w-0 bg-transparent outline-none text-body" />
      </label>
      <div className="mt-8 space-y-10">
        {groups.map((g) => {
          const items = FAQS.map((f, n) => ({ f, n })).filter(({ f }) => f.group === g && match(f));
          if (!items.length) return null;
          return (
            <section key={g}>
              <h2 className="text-[1.3rem] mb-3">{g}</h2>
              <div className="rounded-2xl border border-border bg-card divide-y divide-border">
                {items.map(({ f, n }) => (
                  <div key={n} id={`q${n}`} className="scroll-mt-24">
                    <button onClick={() => setOpen(open === n ? null : n)} className="w-full flex items-center justify-between gap-4 text-start px-5 py-4" aria-expanded={open === n}>
                      <span className="text-body font-medium">{f.q}</span>
                      <ChevronDown size={16} className={`shrink-0 transition-transform ${open === n ? "rotate-180" : ""}`} />
                    </button>
                    {open === n && <div className="px-5 pb-4 -mt-1 text-body text-foreground/80 leading-relaxed"><Inline text={f.a} /></div>}
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
      <p className="mt-10 text-body text-muted-foreground">Didn't find it? Try the <Link href="/docs/troubleshooting" className="underline">troubleshooting guide</Link> or search from the <Link href="/docs" className="underline">Help Center home</Link>.</p>
    </div>
  );
}

// ─── Router ───────────────────────────────────────────────

function NotFound() {
  return (
    <div className="max-w-[640px] mx-auto px-6 pt-24 text-center">
      <Wrench className="mx-auto mb-4 text-muted-foreground" />
      <h1 className="text-[2rem]">That page isn't here</h1>
      <p className="mt-2 text-muted-foreground">It may have moved. Search below or go back to the Help Center.</p>
      <div className="mt-6 text-start"><SearchBox big autoFocus /></div>
      <Link href="/docs" className="mt-6 inline-flex items-center gap-2 font-semibold">Help Center home <ArrowRight size={15} /></Link>
    </div>
  );
}

export default function Docs() {
  const [location] = useLocation();
  const slug = location.replace(/^\/docs\/?/, "").split(/[?#]/)[0];

  useEffect(() => {
    if (!slug) document.title = "Bumblebee Help Center";
  }, [slug]);

  let body: React.ReactNode;
  if (!slug) body = <Home />;
  else if (slug === "troubleshooting") body = <Troubleshooting />;
  else if (slug === "faq") body = <FaqPage />;
  else if (ARTICLE_BY_SLUG[slug]) body = <ArticlePage article={ARTICLE_BY_SLUG[slug]} />;
  else body = <NotFound />;

  return (
    <div dir="ltr" className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Header />
      <main>{body}</main>
      <Footer />
    </div>
  );
}

export type { CategoryId };
