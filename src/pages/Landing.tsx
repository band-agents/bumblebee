/**
 * Landing — Bumblebee for CUBS.
 *
 * Bumblebee's own identity (warm paper, honey fills, graphite ink, Fredoka
 * headings) with the client's mark beside the bee. Every picture is a real
 * screen captured from the running app into public/landing/, and the hero film
 * is rendered from those same screens by Remotion (remotion/HeroLoop.tsx).
 *
 * Rules this page keeps:
 *   - Nothing is hidden until an animation finishes. Motion is CSS-only and
 *     decorative; with reduced motion it simply doesn't run.
 *   - Images below the fold load lazily; the film has a poster and never blocks.
 */

import { useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight, Factory, Shirt, Boxes, ShoppingBag, Landmark, Users, ShieldCheck,
  KeyRound, Globe, Check, Layers, Scissors, Wrench, Paintbrush, ClipboardCheck, Package, Truck, Play, BookOpen,
} from "lucide-react";
import { Logo } from "../components/Logo";
import { CoBrand } from "./AuthPage";
import { BRAND, CLIENT } from "../lib/brand";

// ─── Content ─────────────────────────────────────────────

type Module = { id: string; label: string; icon: React.ElementType; img: string; title: string; points: string[] };

const MODULES: Module[] = [
  {
    id: "production", label: "Production", icon: Factory, img: "/landing/production.png",
    title: "Every production order, at every stage, right now.",
    points: ["Orders move pattern → cutting → sewing → finishing → QC → packing", "Live pieces-per-hour and efficiency by line", "Alerts when fabric is short or an order slips"],
  },
  {
    id: "products", label: "Products", icon: Shirt, img: "/landing/products.png",
    title: "A product listing built for clothes.",
    points: ["Sizes, colours, fabric and trims on one card", "Bill of materials and cost per piece, calculated", "Routing templates so a new style takes minutes"],
  },
  {
    id: "overview", label: "Floor overview", icon: Layers, img: "/landing/production-exec.png",
    title: "The whole floor from one screen.",
    points: ["Pipeline count at each stage", "Daily output and efficiency trend", "Which team, which line, which order is behind"],
  },
  {
    id: "inventory", label: "Inventory", icon: Boxes, img: "/landing/inventory.png",
    title: "Imported fabric and local trims, tracked to the metre.",
    points: ["Stock levels with reorder points", "Materials reserved against each order", "Purchasing and supplier lead times"],
  },
  {
    id: "sales", label: "Sales & CRM", icon: ShoppingBag, img: "/landing/crm.png",
    title: "Customers, quotations and orders that feed production.",
    points: ["Quotation → sales order → production order", "Online store, branches and wholesale in one view", "Point of sale and loyalty built in"],
  },
  {
    id: "finance", label: "Finance", icon: Landmark, img: "/landing/finance.png",
    title: "Money in and out, in EGP, without a second system.",
    points: ["Invoices, expenses, receivables and payables", "Cost of every production run", "Reports you can export"],
  },
  {
    id: "people", label: "People", icon: Users, img: "/landing/hr.png",
    title: "Your team, payroll and who can open what.",
    points: ["Employees, payroll and performance", "Access levels per person", "An audit trail of changes"],
  },
];

const STAGES = [
  { icon: Layers, en: "Pattern", ar: "الباترون" },
  { icon: Scissors, en: "Cutting", ar: "القص" },
  { icon: Wrench, en: "Sewing", ar: "الخياطة" },
  { icon: Paintbrush, en: "Finishing", ar: "التشطيب" },
  { icon: ClipboardCheck, en: "QC", ar: "الجودة" },
  { icon: Package, en: "Packing", ar: "التغليف" },
  { icon: Truck, en: "Dispatch", ar: "التسليم" },
];

const ROLES = [
  { role: "Owner", sees: "Everything, including billing and admins" },
  { role: "Production manager", sees: "Production, products, quality, stock" },
  { role: "Warehouse", sees: "Inventory, purchasing, materials" },
  { role: "Sales", sees: "Customers, quotations, orders" },
  { role: "Finance", sees: "Invoices, expenses, reports" },
  { role: "Viewer", sees: "Read-only, nothing can be changed" },
];

// ─── Page ─────────────────────────────────────────────────

export default function Landing() {
  const [active, setActive] = useState(MODULES[0].id);
  const mod = MODULES.find((m) => m.id === active) ?? MODULES[0];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .bb-float { animation: bb-float 7s ease-in-out infinite; }
          @keyframes bb-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
        }
      `}</style>

      {/* ── Nav ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-border/60">
        <div className="max-w-[1200px] mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <CoBrand size={24} />
          <nav className="hidden md:flex items-center gap-7 text-body text-muted-foreground">
            <a href="#modules" className="hover:text-foreground transition-colors">Modules</a>
            <a href="#production" className="hover:text-foreground transition-colors">Production</a>
            <a href="#access" className="hover:text-foreground transition-colors">Team access</a>
            <Link href="/docs" className="hover:text-foreground transition-colors">Docs</Link>
          </nav>
          <div className="flex items-center gap-2">
          <Link href="/docs" className="inline-flex md:hidden items-center gap-1.5 h-10 px-3.5 rounded-xl border border-border bg-card text-body font-semibold hover:bg-brand-wash transition-colors" aria-label="Documentation">
            <BookOpen size={15} /> Docs
          </Link>
          <Link href="/auth" className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-primary text-primary-foreground text-body font-semibold hover:brightness-[0.97] transition">
            Sign in <ArrowRight size={15} className="rtl:rotate-180" />
          </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="relative">
        <div aria-hidden className="absolute inset-x-0 top-0 h-[640px] pointer-events-none"
          style={{ background: "radial-gradient(55% 60% at 75% 35%, hsl(var(--brand) / .55) 0%, transparent 70%)" }} />
        <div className="relative max-w-[1200px] mx-auto px-5 pt-16 sm:pt-24 pb-16 grid lg:grid-cols-[1fr_1.15fr] gap-12 items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-caption font-medium text-foreground/80 mb-6">
              <img src={CLIENT.logo} alt="" width={18} height={18} className="dark:invert" />
              Set up for {CLIENT.name}
            </p>
            <h1 className="text-[clamp(2.5rem,5.6vw,4.4rem)] leading-[1.02] tracking-[-0.025em]">
              From fabric roll to <span className="relative whitespace-nowrap">
                <span className="relative z-10">packed order</span>
                <span aria-hidden className="absolute inset-x-0 bottom-[0.08em] h-[0.32em] rounded-full bg-primary/70" />
              </span>, in one place.
            </h1>
            <p className="mt-6 text-[1.15rem] leading-relaxed text-muted-foreground max-w-[46ch]">
              {BRAND.name} runs everything {CLIENT.name} makes: production stages, product listings,
              imported fabric and trims, sales, finance and your team — in English and Arabic.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/auth" className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-primary text-primary-foreground text-body font-semibold shadow-[0_12px_30px_-12px_hsl(var(--primary))] hover:brightness-[0.97] transition">
                Sign in to {BRAND.name} <ArrowRight size={16} className="rtl:rotate-180" />
              </Link>
              <a href="#modules" className="inline-flex items-center gap-2 h-12 px-6 rounded-xl border border-border bg-card text-body font-semibold hover:bg-brand-wash transition-colors">
                <Play size={15} /> See the modules
              </a>
              <Link href="/docs" className="inline-flex items-center gap-2 h-12 px-6 rounded-xl border border-border bg-card text-body font-semibold hover:bg-brand-wash transition-colors">
                <BookOpen size={15} /> Documentation
              </Link>
            </div>
            <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-caption text-muted-foreground">
              {["Logins created by your admin", "Access set per person", "English / العربية"].map((t) => (
                <li key={t} className="flex items-center gap-1.5"><Check size={14} className="text-brand-ink" /> {t}</li>
              ))}
            </ul>
          </div>

          {/* Product film — Remotion render of real screens */}
          <div className="bb-float">
            <div className="rounded-2xl border border-border bg-card shadow-[0_40px_80px_-40px_hsl(36_30%_14%/.45)] overflow-hidden">
              <video
                className="block w-full h-auto"
                src="/landing/hero.mp4"
                poster="/landing/production.png"
                autoPlay muted loop playsInline preload="metadata"
                width={1600} height={1000}
                aria-label={`${BRAND.name} production, products and inventory screens`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stage strip ─────────────────────────────────── */}
      <section id="production" className="border-y border-border bg-sidebar">
        <div className="max-w-[1200px] mx-auto px-5 py-10">
          <p className="text-caption font-semibold text-brand-ink mb-5">How an order moves through the {CLIENT.name} floor</p>
          <ol className="grid grid-cols-4 sm:grid-cols-7 gap-3">
            {STAGES.map(({ icon: Icon, en, ar }, i) => (
              <li key={en} className="flex flex-col items-center text-center gap-2">
                <span className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${i < 3 ? "bg-primary text-primary-foreground border-transparent" : "bg-card border-border text-foreground/70"}`}>
                  <Icon size={20} />
                </span>
                <span className="text-body font-semibold leading-none">{en}</span>
                <span className="text-caption text-muted-foreground leading-none" lang="ar" dir="rtl">{ar}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Modules with real screens ───────────────────── */}
      <section id="modules" className="max-w-[1200px] mx-auto px-5 py-20 sm:py-28">
        <div className="max-w-[640px] mb-10">
          <h2 className="text-[clamp(2rem,4vw,3rem)] leading-[1.05] tracking-[-0.02em]">Every module, shown as it really looks.</h2>
          <p className="mt-4 text-[1.05rem] text-muted-foreground leading-relaxed">
            These are live screens from the {CLIENT.name} workspace, not mock-ups. Pick a module.
          </p>
        </div>

        <div role="tablist" aria-label="Modules" className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 sm:mx-0 sm:px-0 sm:flex-wrap">
          {MODULES.map((m) => (
            <button
              key={m.id} role="tab" aria-selected={m.id === active} onClick={() => setActive(m.id)}
              className={`shrink-0 inline-flex items-center gap-2 h-10 px-4 rounded-xl border text-body font-medium transition-colors ${m.id === active ? "bg-primary text-primary-foreground border-transparent" : "bg-card border-border text-foreground/75 hover:bg-brand-wash"}`}
            >
              <m.icon size={16} /> {m.label}
            </button>
          ))}
        </div>

        <div className="mt-8 grid lg:grid-cols-[0.8fr_1.6fr] gap-10 items-start" role="tabpanel">
          <div className="lg:pt-6">
            <h3 className="text-[1.75rem] leading-tight tracking-[-0.015em]">{mod.title}</h3>
            <ul className="mt-6 space-y-3.5">
              {mod.points.map((p) => (
                <li key={p} className="flex items-start gap-3 text-body text-foreground/85 leading-snug">
                  <span className="mt-0.5 w-5 h-5 shrink-0 rounded-full bg-brand-wash border border-border flex items-center justify-center"><Check size={12} className="text-brand-ink" /></span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <figure className="rounded-2xl border border-border bg-card overflow-hidden shadow-[0_30px_70px_-40px_hsl(36_30%_14%/.4)]">
            <div className="h-8 bg-muted/60 border-b border-border flex items-center gap-1.5 px-3" aria-hidden>
              {["#E8B4A0", "#EFD38A", "#B9D3A6"].map((c) => <span key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />)}
            </div>
            <img key={mod.img} src={mod.img} alt={`${mod.label} screen in ${BRAND.name}`} width={1440} height={900} className="block w-full h-auto" />
          </figure>
        </div>

        {/* Thumbnail grid: all modules at a glance */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { img: "/landing/dashboard.png", label: "Dashboard" },
            { img: "/landing/quality.png", label: "Quality control" },
            { img: "/landing/orders.png", label: "Sales orders" },
            { img: "/landing/analytics.png", label: "Analytics" },
          ].map((t) => (
            <figure key={t.label} className="rounded-xl border border-border bg-card overflow-hidden">
              <img src={t.img} alt={`${t.label} screen`} loading="lazy" width={1440} height={900} className="block w-full h-auto" />
              <figcaption className="px-3 py-2 text-caption font-medium text-foreground/80 border-t border-border">{t.label}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ── Access ──────────────────────────────────────── */}
      <section id="access" className="bg-sidebar border-y border-border">
        <div className="max-w-[1200px] mx-auto px-5 py-20 sm:py-24 grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-[clamp(2rem,4vw,3rem)] leading-[1.05] tracking-[-0.02em]">Only people you add. Only what each needs.</h2>
            <div className="mt-8 space-y-5">
              {[
                { icon: KeyRound, t: "Logins you hand out", d: "No public sign-up. Your admin creates a username and password for each colleague, chooses their level, and sends them the details." },
                { icon: ShieldCheck, t: "Access levels that hold", d: "Each person only sees the modules their role allows — hidden in the menu and blocked if they paste a link. Suspend anyone in one click." },
              ].map(({ icon: Icon, t, d }) => (
                <div key={t} className="flex gap-4">
                  <span className="w-11 h-11 shrink-0 rounded-xl bg-primary text-primary-foreground flex items-center justify-center"><Icon size={19} /></span>
                  <div>
                    <p className="text-title font-semibold">{t}</p>
                    <p className="text-body text-muted-foreground leading-relaxed mt-1">{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <p className="text-body font-semibold">Access levels</p>
              <span className="text-caption text-muted-foreground">You decide per person</span>
            </div>
            <ul>
              {ROLES.map((r) => (
                <li key={r.role} className="px-5 py-3.5 border-b border-border last:border-0 flex items-center justify-between gap-4">
                  <span className="text-body font-medium">{r.role}</span>
                  <span className="text-caption text-muted-foreground text-end">{r.sees}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Closing ─────────────────────────────────────── */}
      {/* ── Help Center ─────────────────────────────────── */}
      <section id="docs" className="max-w-[1200px] mx-auto px-5 pt-20 sm:pt-28">
        <div className="rounded-3xl border border-border bg-card px-6 sm:px-10 py-10 grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-caption font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-4"><BookOpen size={14} /> Help Center</p>
            <h2 className="text-[clamp(1.8rem,3.6vw,2.6rem)] leading-[1.08] tracking-[-0.02em] max-w-[20ch]">Every screen explained. Every error answered.</h2>
            <p className="mt-4 text-[1.05rem] text-muted-foreground max-w-[52ch]">
              Step-by-step guides with screenshots, a troubleshooting guide built from the real error messages, and answers to the questions your team will ask — online and as a PDF.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/docs" className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-primary text-primary-foreground text-body font-semibold hover:brightness-[0.97] transition">
                Open the documentation <ArrowRight size={16} className="rtl:rotate-180" />
              </Link>
              <a href="/docs/Bumblebee-Documentation.pdf" download className="inline-flex items-center gap-2 h-12 px-6 rounded-xl border border-border bg-background text-body font-semibold hover:bg-brand-wash transition-colors">
                Download PDF
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Guides", "Sales, production, stock, invoices, printing", "/docs"],
              ["Troubleshooting", "The message you see, why, and the fix", "/docs/troubleshooting"],
              ["FAQ", "Short answers to common questions", "/docs/faq"],
              ["Fixing mistakes", "Void, cancel and re-issue the right way", "/docs/fixing-mistakes"],
            ].map(([t, d, h]) => (
              <Link key={h} href={h} className="rounded-2xl border border-border bg-background p-4 hover:bg-brand-wash transition-colors">
                <span className="block text-body font-semibold">{t}</span>
                <span className="block mt-1 text-caption text-muted-foreground">{d}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-5 py-20 sm:py-28">
        <div className="rounded-3xl bg-primary text-primary-foreground px-6 sm:px-12 py-14 sm:py-16 grid md:grid-cols-[1fr_auto] gap-8 items-center">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <Logo variant="mark" theme="dark" size={34} />
              <span className="text-title opacity-50" aria-hidden>×</span>
              <img src={CLIENT.logo} alt={CLIENT.name} width={48} height={48} loading="lazy" />
            </div>
            <h2 className="text-[clamp(1.8rem,3.6vw,2.6rem)] leading-[1.08] tracking-[-0.02em] max-w-[22ch]">
              The {CLIENT.name} workspace is ready. Sign in and look around.
            </h2>
          </div>
          <Link href="/auth" className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl bg-foreground text-background text-body font-semibold hover:opacity-90 transition-opacity">
            Sign in <ArrowRight size={16} className="rtl:rotate-180" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="max-w-[1200px] mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-caption text-muted-foreground">
          <Logo variant="full" size={20} />
          <p>© {new Date().getFullYear()} {BRAND.name} · Built for {CLIENT.name} · Cairo</p>
        </div>
      </footer>
    </div>
  );
}
