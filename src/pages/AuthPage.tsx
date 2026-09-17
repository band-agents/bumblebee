/**
 * AuthPage — sign in with the username and password an admin created.
 *
 * There is no self sign-up, no Google, no email login and no reset-by-email:
 * every account is created by a workspace admin in Users & Access
 * (supabase/staff-accounts.sql → create_staff_account), and a forgotten
 * password is reset there too. Public sign-ups are disabled on the Supabase
 * project, so this page is the only way in.
 *
 * Bumblebee's own palette and type, with the client's mark beside the bee.
 */

import { useState } from "react";
import { signIn } from "../lib/auth";
import { SIGNOUT_REASON_KEY } from "../context/AuthContext";
import { isDemoMode } from "../lib/supabase";
import { BRAND, CLIENT } from "../lib/brand";
import { Logo } from "../components/Logo";
import { ArrowRight, Eye, EyeOff, Factory, Loader2, ShieldCheck, Shirt, Users } from "lucide-react";

/** Supabase's messages are written for developers. These are written for the person at the door. */
function friendlyError(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes("invalid login credentials")) return "That username and password don't match. Check both and try again.";
  if (m.includes("rate limit") || m.includes("too many")) return "Too many attempts. Wait a minute, then try again.";
  if (m.includes("failed to fetch") || m.includes("network")) return "Can't reach the server. Check your connection and try again.";
  if (m.includes("banned")) return "This login is suspended or was removed. Ask your admin.";
  return raw;
}

const inputCls =
  "w-full h-12 rounded-xl border border-border bg-card px-4 text-body text-foreground placeholder:text-muted-foreground/70 " +
  "focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-colors";

export default function AuthPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signedOutReason] = useState<string | null>(() => {
    try {
      const r = sessionStorage.getItem(SIGNOUT_REASON_KEY);
      sessionStorage.removeItem(SIGNOUT_REASON_KEY);
      return r;
    } catch { return null; }
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await signIn(username, password);
      if (res.error) throw res.error;
      // AuthContext picks up the session and the router moves on.
    } catch (err) {
      setError(friendlyError(err instanceof Error ? err.message : String((err as { message?: string })?.message ?? err)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-[100dvh] flex bg-background text-foreground">
      {/* ── Brand panel (desktop) ───────────────────────────── */}
      <aside className="hidden lg:flex w-[46%] max-w-[640px] flex-col justify-between bg-sidebar border-e border-sidebar-border px-12 py-10">
        <CoBrand size={30} />

        <div className="max-w-[440px]">
          <p className="text-caption font-semibold text-brand-ink mb-4">
            {CLIENT.name} · {BRAND.name}
          </p>
          <h2 className="text-[2.6rem] leading-[1.05] mb-5" style={{ fontFamily: "var(--app-font-serif)" }}>
            From fabric roll to packed order, in one place.
          </h2>
          <p className="text-body-lg text-muted-foreground leading-relaxed mb-8">
            Production stages, product listings, stock of imported fabric and trims, sales and your team —
            set up for how {CLIENT.name} makes things.
          </p>
          <ul className="space-y-3.5">
            {[
              { icon: Factory, text: "Pattern → cutting → sewing → finishing → QC → packing, live" },
              { icon: Shirt, text: "Products with sizes, colours, fabric and cost per piece" },
              { icon: Users, text: "Each colleague sees only the modules their admin gives them" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <span className="mt-0.5 w-8 h-8 shrink-0 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                  <Icon size={16} />
                </span>
                <span className="text-body text-foreground/85 leading-snug pt-1.5">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-caption text-muted-foreground">
          © {new Date().getFullYear()} {BRAND.name} · Built for {CLIENT.name}
        </p>
      </aside>

      {/* ── Form ─────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 py-10">
        <div className="lg:hidden mb-10"><CoBrand size={28} /></div>

        <div className="w-full max-w-[400px]">
          <h1 className="text-[2rem] leading-tight mb-1.5">Welcome back</h1>
          <p className="text-body text-muted-foreground mb-7">Sign in to {CLIENT.name} on {BRAND.name}.</p>

          {signedOutReason && (
            <p role="status" className="mb-5 rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-caption text-amber-900 dark:bg-amber-500/10 dark:text-amber-100">
              {signedOutReason === "removed"
                ? "You were signed out because an admin removed your login. Ask them if you still need access."
                : "You were signed out because an admin suspended your login. Ask them to re-activate it."}
            </p>
          )}

          {isDemoMode && (
            <p className="mb-5 rounded-xl bg-brand-wash border border-border px-4 py-3 text-caption text-foreground/80">
              Demo mode: no database is connected, so any details will open the sample workspace.
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            <Field label="Username">
              <input
                className={inputCls}
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="e.g. sara.cutting"
                required
                autoFocus
              />
            </Field>

            <Field label="Password">
              <div className="relative">
                <input
                  className={inputCls + " pe-12"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute end-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </Field>

            <button
              type="submit"
              disabled={busy || !username.trim() || !password}
              className="w-full h-12 mt-1 rounded-xl bg-primary text-primary-foreground text-body font-semibold flex items-center justify-center gap-2 hover:brightness-[0.97] active:brightness-95 transition disabled:opacity-45"
            >
              {busy && <Loader2 size={16} className="animate-spin" />}
              Sign in
              {!busy && <ArrowRight size={16} className="rtl:rotate-180" />}
            </button>
          </form>

          {error && (
            <p role="alert" className="mt-4 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-caption text-destructive">
              {error}
            </p>
          )}

          <div className="mt-8 pt-6 border-t border-border flex items-start gap-2.5 text-caption text-muted-foreground">
            <ShieldCheck size={15} className="text-brand-ink shrink-0 mt-px" />
            <p>
              Accounts are created by your {CLIENT.name} admin. No login yet, or forgot your password?
              Ask your admin — they can set a new one for you.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Pieces ───────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block mb-1.5 text-caption font-medium text-foreground/80">{label}</span>
      {children}
    </label>
  );
}

/** "Bumblebee × CUBS" — the product keeps its own mark; the client's sits beside it. */
export function CoBrand({ size = 28 }: { size?: number }) {
  return (
    <a href="/" className="inline-flex items-center gap-3" aria-label={`${BRAND.name} for ${CLIENT.name}`}>
      <Logo variant="full" size={size} />
      <span className="text-muted-foreground/60 text-title" aria-hidden>×</span>
      <img
        src={CLIENT.logo}
        alt={CLIENT.name}
        width={size * 1.6}
        height={size * 1.6}
        className="dark:invert"
        style={{ width: size * 1.6, height: size * 1.6, objectFit: "contain" }}
      />
    </a>
  );
}
