/**
 * AuthPage — sign in, create a workspace, reset a password.
 *
 * Bumblebee's own palette and type (warm paper, honey fills, Fredoka headings),
 * with the client's mark beside the bee so the door already says whose system
 * this is. Three ways in, in the order people reach for them:
 *   1. Google                     — one click, no password to forget
 *   2. Email or username + pass   — the credentials an admin created and shared
 *   3. Invite link                — handled by /invite/:token, not here
 *
 * Nothing on this page waits on an animation to become usable.
 */

import { useState } from "react";
import { signInWithGoogle, signIn, signUp, resetPasswordForEmail } from "../lib/auth";
import { isDemoMode } from "../lib/supabase";
import { BRAND, CLIENT } from "../lib/brand";
import { Logo } from "../components/Logo";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Factory, Loader2, Lock, ShieldCheck, Shirt, Users } from "lucide-react";

type Mode = "signin" | "signup" | "reset";

/** Supabase's messages are written for developers. These are written for the person at the door. */
function friendlyError(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes("invalid login credentials")) return "That email or username and password don't match. Check both and try again.";
  if (m.includes("email not confirmed")) return "This account hasn't been confirmed yet. Open the confirmation email, or ask your admin to create the account for you.";
  if (m.includes("user already registered")) return "An account with this email already exists. Sign in instead.";
  if (m.includes("password should be at least")) return "Use a password of at least 8 characters.";
  if (m.includes("rate limit") || m.includes("too many")) return "Too many attempts. Wait a minute, then try again.";
  if (m.includes("failed to fetch") || m.includes("network")) return "Can't reach the server. Check your connection and try again.";
  if (m.includes("provider is not enabled")) return "Google sign-in isn't switched on for this workspace yet. Use your email or username for now.";
  return raw;
}

const inputCls =
  "w-full h-12 rounded-xl border border-border bg-card px-4 text-body text-foreground placeholder:text-muted-foreground/70 " +
  "focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-colors";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState<"google" | "form" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setNotice(null);
    setPassword("");
  }

  async function handleGoogle() {
    setBusy("google"); setError(null); setNotice(null);
    try {
      const res = await signInWithGoogle();
      // Success leaves the page for Google; only an error comes back here.
      if (res.error) { setError(friendlyError(res.error.message)); setBusy(null); }
    } catch (e) {
      setError(friendlyError(e instanceof Error ? e.message : "Something went wrong."));
      setBusy(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy("form"); setError(null); setNotice(null);
    try {
      if (mode === "signin") {
        const res = await signIn(identifier, password);
        if (res.error) throw res.error;
        // AuthContext picks up the session and the router moves on.
      } else if (mode === "signup") {
        const res = await signUp(identifier.trim(), password, fullName.trim());
        if (res.error) throw res.error;
        if (res.session) return; // email confirmation is off — straight in
        setNotice("Check your inbox for a confirmation link, then sign in.");
        switchMode("signin");
      } else {
        const res = await resetPasswordForEmail(identifier.trim());
        if (res.error) throw res.error;
        setNotice("If that email has an account, a reset link is on its way.");
      }
    } catch (err) {
      setError(friendlyError(err instanceof Error ? err.message : String((err as { message?: string })?.message ?? err)));
    } finally {
      setBusy(null);
    }
  }

  const isUsername = mode === "signin" && identifier.trim() !== "" && !identifier.includes("@");
  const canSubmit =
    mode === "reset" ? identifier.includes("@")
    : mode === "signup" ? identifier.includes("@") && password.length >= 8
    : identifier.trim() !== "" && password !== "";

  const heading = mode === "signin" ? "Welcome back" : mode === "signup" ? "Set up your workspace" : "Reset your password";
  const sub =
    mode === "signin" ? `Sign in to ${CLIENT.name} on ${BRAND.name}.`
    : mode === "signup" ? "For the business owner. Your team gets their logins from you afterwards."
    : "Enter the email on your account and we'll send a reset link.";

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
              { icon: Users, text: "Each colleague sees only the modules you give them" },
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
          {mode !== "signin" && (
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className="mb-6 inline-flex items-center gap-1.5 text-caption font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={14} className="rtl:rotate-180" /> Back to sign in
            </button>
          )}

          <h1 className="text-[2rem] leading-tight mb-1.5">{heading}</h1>
          <p className="text-body text-muted-foreground mb-7">{sub}</p>

          {isDemoMode && (
            <p className="mb-5 rounded-xl bg-brand-wash border border-border px-4 py-3 text-caption text-foreground/80">
              Demo mode: no database is connected, so any details will open the sample workspace.
            </p>
          )}

          {mode !== "reset" && (
            <>
              <button
                type="button"
                onClick={handleGoogle}
                disabled={busy !== null}
                className="w-full h-12 flex items-center justify-center gap-3 rounded-xl border border-border bg-card text-body font-semibold hover:bg-brand-wash transition-colors disabled:opacity-50"
              >
                {busy === "google" ? <Loader2 size={18} className="animate-spin text-muted-foreground" /> : <GoogleMark />}
                Continue with Google
              </button>

              <div className="flex items-center gap-3 my-6" aria-hidden>
                <div className="flex-1 h-px bg-border" />
                <span className="text-caption text-muted-foreground">
                  {mode === "signin" ? "or with your login" : "or with email"}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            {mode === "signup" && (
              <Field label="Your name">
                <input
                  className={inputCls} value={fullName} onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name" placeholder="Full name"
                />
              </Field>
            )}

            <Field label={mode === "signin" ? "Email or username" : "Email"}>
              <input
                className={inputCls}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                type={mode === "signin" ? "text" : "email"}
                inputMode={mode === "signin" ? "email" : "email"}
                autoComplete={mode === "signin" ? "username" : "email"}
                autoCapitalize="none"
                spellCheck={false}
                placeholder={mode === "signin" ? "name@cubs.com or username" : "name@company.com"}
                required
                autoFocus
              />
            </Field>

            {mode !== "reset" && (
              <Field
                label="Password"
                aside={mode === "signin" && (
                  <button type="button" onClick={() => switchMode("reset")}
                    className="text-caption font-medium text-brand-ink hover:underline underline-offset-2">
                    Forgot password?
                  </button>
                )}
              >
                <div className="relative">
                  <input
                    className={inputCls + " pe-12"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    placeholder={mode === "signup" ? "At least 8 characters" : "Password"}
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
            )}

            {isUsername && (
              <p className="text-caption text-muted-foreground flex items-center gap-1.5">
                <Lock size={12} /> Signing in with a username your admin created.
              </p>
            )}

            <button
              type="submit"
              disabled={busy !== null || !canSubmit}
              className="w-full h-12 mt-1 rounded-xl bg-primary text-primary-foreground text-body font-semibold flex items-center justify-center gap-2 hover:brightness-[0.97] active:brightness-95 transition disabled:opacity-45"
            >
              {busy === "form" && <Loader2 size={16} className="animate-spin" />}
              {mode === "signin" ? "Sign in" : mode === "signup" ? "Create workspace" : "Send reset link"}
              {busy !== "form" && <ArrowRight size={16} className="rtl:rotate-180" />}
            </button>
          </form>

          {error && (
            <p role="alert" className="mt-4 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-caption text-destructive">
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="mt-4 rounded-xl border border-border bg-brand-wash px-4 py-3 text-caption text-foreground/85 flex items-start gap-2">
              <ShieldCheck size={15} className="text-brand-ink shrink-0 mt-px" /> {notice}
            </p>
          )}

          {mode === "signin" && (
            <div className="mt-8 pt-6 border-t border-border space-y-2 text-caption text-muted-foreground">
              <p>
                Got a username and password from your admin? Enter them above — no email needed.
              </p>
              <p>
                Setting up {BRAND.name} for your business?{" "}
                <button type="button" onClick={() => switchMode("signup")}
                  className="font-semibold text-brand-ink hover:underline underline-offset-2">
                  Create a workspace
                </button>
              </p>
            </div>
          )}

          <a href="/" className="mt-8 inline-flex items-center gap-1.5 text-caption text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={13} className="rtl:rotate-180" /> {BRAND.name} home
          </a>
        </div>
      </main>
    </div>
  );
}

// ─── Pieces ───────────────────────────────────────────────

function Field({ label, aside, children }: { label: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="flex items-center justify-between mb-1.5">
        <span className="text-caption font-medium text-foreground/80">{label}</span>
        {aside}
      </span>
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

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}
