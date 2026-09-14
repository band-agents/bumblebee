/**
 * ResetPassword — where the "Forgot password?" email lands.
 *
 * Supabase signs the visitor in with a short-lived recovery session when they
 * follow the link (PKCE ?code= or #access_token). This page exchanges the code
 * if there is one, then lets them choose a new password and continues into
 * the app. Rendered before the auth guards, so a recovery session does not
 * skip straight past it into the dashboard.
 */

import { useEffect, useState } from "react";
import { getSupabaseClient } from "../lib/supabase";
import { updatePassword } from "../lib/auth";
import { CoBrand } from "./AuthPage";
import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";

const inputCls =
  "w-full h-12 rounded-xl border border-border bg-card px-4 pe-12 text-body text-foreground placeholder:text-muted-foreground/70 " +
  "focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-colors";

export default function ResetPassword() {
  const [ready, setReady] = useState<"checking" | "ok" | "expired">("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const sb = getSupabaseClient();
    if (!sb) { setReady("expired"); return; }
    (async () => {
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        const { error: exErr } = await sb.auth.exchangeCodeForSession(code);
        if (exErr) { setReady("expired"); return; }
        window.history.replaceState({}, "", "/reset-password");
      }
      // Hash-token links are consumed by detectSessionInUrl; give it a beat.
      for (let i = 0; i < 6; i++) {
        const { data } = await sb.auth.getSession();
        if (data.session) { setReady("ok"); return; }
        await new Promise((r) => setTimeout(r, 300));
      }
      setReady("expired");
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError("Use at least 8 characters."); return; }
    if (password !== confirm) { setError("The two passwords don't match."); return; }
    setBusy(true);
    const { error: upErr } = await updatePassword(password);
    setBusy(false);
    if (upErr) { setError(upErr.message); return; }
    setDone(true);
  }

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col items-center justify-center px-5 py-10">
      <div className="mb-10"><CoBrand size={28} /></div>
      <div className="w-full max-w-[400px]">
        {ready === "checking" && (
          <p className="flex items-center justify-center gap-2 text-body text-muted-foreground">
            <Loader2 size={16} className="animate-spin" /> Checking your reset link…
          </p>
        )}

        {ready === "expired" && (
          <>
            <h1 className="text-[2rem] leading-tight mb-2">This link has expired</h1>
            <p className="text-body text-muted-foreground mb-7">
              Reset links work once and only for a short time. Request a new one from the sign-in page.
            </p>
            <a href="/auth" className="w-full h-12 rounded-xl bg-primary text-primary-foreground text-body font-semibold flex items-center justify-center gap-2">
              Back to sign in <ArrowRight size={16} className="rtl:rotate-180" />
            </a>
          </>
        )}

        {ready === "ok" && done && (
          <>
            <CheckCircle2 size={36} className="text-success mb-4" />
            <h1 className="text-[2rem] leading-tight mb-2">Password updated</h1>
            <p className="text-body text-muted-foreground mb-7">You're signed in with your new password.</p>
            <a href="/" className="w-full h-12 rounded-xl bg-primary text-primary-foreground text-body font-semibold flex items-center justify-center gap-2">
              Continue <ArrowRight size={16} className="rtl:rotate-180" />
            </a>
          </>
        )}

        {ready === "ok" && !done && (
          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            <h1 className="text-[2rem] leading-tight mb-1.5">Choose a new password</h1>
            <p className="text-body text-muted-foreground mb-5">At least 8 characters.</p>
            <div className="relative">
              <input className={inputCls} type={show ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="New password" autoFocus />
              <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"}
                className="absolute end-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted">
                {show ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            <input className={inputCls} type={show ? "text" : "password"} value={confirm}
              onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" placeholder="Repeat new password" />
            <button type="submit" disabled={busy || !password || !confirm}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground text-body font-semibold flex items-center justify-center gap-2 disabled:opacity-45">
              {busy && <Loader2 size={16} className="animate-spin" />} Save password
            </button>
            {error && (
              <p role="alert" className="rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-caption text-destructive">{error}</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
