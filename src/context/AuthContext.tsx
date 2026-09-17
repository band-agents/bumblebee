import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";
import {
  DEMO_USER, DEMO_SESSION,
  signIn, signOut as authSignOut,
  onAuthStateChange,
} from "../lib/auth";
import { isDemoMode, getSupabaseClient } from "../lib/supabase";

/** Set when an admin's suspension or removal signs this device out; the sign-in page explains it. */
export const SIGNOUT_REASON_KEY = "bumblebee_signout_reason";
const ACCESS_CHECK_MS = 8000;

// ─── Workspace shape ───────────────────────────────────────

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: string;
  /** The signed-in user's role here — one of the ROLE_TEMPLATES ids in lib/permissions. */
  role: "owner" | "admin" | "manager" | "member" | "sales" | "finance" | "production_manager"
    | "warehouse" | "purchasing" | "qc" | "delivery" | "viewer";
  /** Per-user overrides on top of the role template. Empty = use the template. */
  permissions?: Record<string, string[]>;
  /** Roles held besides `role`; access combines them all. */
  extra_roles?: string[];
  /** "active" or "suspended". A suspended member is signed out of the workspace. */
  status?: string;
  settings?: Record<string, unknown>;
}

const DEMO_WORKSPACE: Workspace = {
  id: "demo-workspace-id",
  name: "CUBS",
  slug: "cubs",
  plan: "pro",
  role: "owner",
  settings: { currency: "EGP", enabled_modules: ["production", "inventory", "purchasing", "finance", "analytics", "hr", "delivery", "quality"] },
};

// ─── Context shape ─────────────────────────────────────────

export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  workspace: Workspace | null;
  loading: boolean;
  workspaceLoading: boolean;
  isDemo: boolean;
  isAuthenticated: boolean;
  signIn: (username: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshWorkspace: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ──────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(isDemoMode ? DEMO_USER : null);
  const [session, setSession] = useState<Session | null>(isDemoMode ? DEMO_SESSION : null);
  const [workspace, setWorkspace] = useState<Workspace | null>(isDemoMode ? DEMO_WORKSPACE : null);
  const [loading, setLoading] = useState(!isDemoMode);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);

  /** An admin suspended or removed this login: end the session on this device and say why on the sign-in page. */
  const forceSignOut = useCallback(async (reason: "suspended" | "removed") => {
    try { sessionStorage.setItem(SIGNOUT_REASON_KEY, reason); } catch { /* storage blocked */ }
    const sb = getSupabaseClient();
    // The server already revoked every session; clear this device's copy.
    try { await sb?.auth.signOut({ scope: "local" }); } catch { /* already gone */ }
    setUser(null);
    setSession(null);
    setWorkspace(null);
    window.location.replace("/auth");
  }, []);

  const fetchWorkspace = useCallback(async (userId: string) => {
    if (isDemoMode) return;
    const sb = getSupabaseClient();
    if (!sb) return;
    setWorkspaceLoading(true);
    try {
      const { data, error } = await sb
        .from("workspace_members")
        .select("*, workspaces(*)")
        .eq("user_id", userId)
        .order("joined_at", { ascending: true })
        .limit(1)
        .maybeSingle() as unknown as {
          data: { role: string; permissions: Record<string, string[]> | null; status: string | null; extra_roles?: string[] | null; workspaces: Record<string, unknown> } | null;
          error: unknown;
        };

      if (!error && data && data.workspaces) {
        const ws = data.workspaces;
        setWorkspace({
          id: ws.id as string,
          name: ws.name as string,
          slug: ws.slug as string,
          plan: ws.plan as string,
          role: data.role as Workspace["role"],
          permissions: data.permissions ?? {},
          extra_roles: data.extra_roles ?? [],
          status: data.status ?? "active",
          settings: (ws.settings as Record<string, unknown>) ?? {},
        });
      } else {
        if (error) console.error("[Bumblebee] Workspace fetch failed:", error);
        // No readable membership: find out whether they were suspended or removed.
        const { data: access } = await sb.rpc("my_access" as never, {} as never);
        const status = (access as { status?: string } | null)?.status;
        if (status === "suspended" || status === "removed") {
          await forceSignOut(status);
          return;
        }
        setWorkspace(null);
      }
    } catch (e) {
      console.error("[Bumblebee] Workspace fetch threw:", e);
      setWorkspace(null);
    } finally {
      setWorkspaceLoading(false);
    }
  }, []);

  // Which user we already loaded a workspace for. Supabase re-emits auth
  // events on every token refresh (e.g. each time the tab regains focus);
  // without this guard the app flashed its loading screen on every switch.
  const workspaceLoadedFor = useRef<string | null>(null);

  useEffect(() => {
    if (isDemoMode) return;

    const sb = getSupabaseClient();

    const { data } = onAuthStateChange((authUser, authSession) => {
      setUser(authUser);
      setSession(authSession);
      setLoading(false);

      if (authUser && sb) {
        if (workspaceLoadedFor.current === authUser.id) return; // token refresh — workspace already loaded
        workspaceLoadedFor.current = authUser.id;
        setWorkspaceLoading(true);
        // Supabase calls must run OUTSIDE this callback: the client holds an
        // internal auth lock while emitting events, so awaiting auth.getUser()
        // here deadlocks on page load when a stored session is restored.
        setTimeout(async () => {
          // Verify the session is still valid against the Supabase auth server.
          // A stale JWT in localStorage (e.g. after a project wipe) would cause
          // "User from sub claim in JWT does not exist" (403) on every request.
          const { error: verifyErr } = await sb.auth.getUser();
          if (verifyErr) {
            console.warn("[Bumblebee] Stale session detected — signing out automatically.", verifyErr.message);
            await sb.auth.signOut();
            workspaceLoadedFor.current = null;
            setUser(null);
            setSession(null);
            setWorkspace(null);
            setWorkspaceLoading(false);
            return;
          }
          await fetchWorkspace(authUser.id);
        }, 0);
      } else {
        workspaceLoadedFor.current = null;
        setWorkspace(null);
        setWorkspaceLoading(false);
      }
    });

    return () => {
      if (data?.subscription?.unsubscribe) {
        data.subscription.unsubscribe();
      }
    };
  }, [fetchWorkspace]);

  // ── Live access check ──
  // Every few seconds (and whenever the tab comes back into view) ask the
  // database whether this login is still allowed in. Suspended or removed →
  // signed out on this device at once. Changed role or module access → the
  // sidebar and pages update without a reload.
  const workspaceId = workspace?.id;
  useEffect(() => {
    if (isDemoMode || !workspaceId) return;
    const sb = getSupabaseClient();
    if (!sb) return;
    let stopped = false;

    const check = async () => {
      if (stopped || document.visibilityState === "hidden") return;
      const { data, error } = await sb.rpc("my_access" as never, { p_workspace_id: workspaceId } as never);
      if (stopped) return;
      if (error) {
        // A revoked session shows up as an auth error once the token is refused.
        const { error: userErr } = await sb.auth.getUser();
        if (userErr && !stopped) await forceSignOut("suspended");
        return;
      }
      const a = data as { status?: string; role?: string; permissions?: Record<string, string[]>; extra_roles?: string[] } | null;
      if (!a) return;
      if (a.status === "suspended" || a.status === "removed") {
        await forceSignOut(a.status);
        return;
      }
      setWorkspace((prev) => {
        if (!prev) return prev;
        const perms = a.permissions ?? {};
        const extra = a.extra_roles ?? prev.extra_roles ?? [];
        if (prev.role === a.role && JSON.stringify(prev.permissions ?? {}) === JSON.stringify(perms)
          && JSON.stringify(prev.extra_roles ?? []) === JSON.stringify(extra) && prev.status === a.status) return prev;
        return { ...prev, role: (a.role ?? prev.role) as Workspace["role"], permissions: perms, extra_roles: extra, status: a.status };
      });
    };

    const timer = window.setInterval(check, ACCESS_CHECK_MS);
    const onVisible = () => { if (document.visibilityState === "visible") void check(); };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      stopped = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [workspaceId, forceSignOut]);

  const refreshWorkspace = useCallback(async () => {
    if (user) await fetchWorkspace(user.id);
  }, [user, fetchWorkspace]);

  const handleSignIn = useCallback(async (email: string, password: string) => {
    const result = await signIn(email, password);
    if (result.error) return { error: result.error.message };
    setUser(result.user);
    setSession(result.session);
    if (result.user) await fetchWorkspace(result.user.id);
    return { error: null };
  }, [fetchWorkspace]);

  const handleSignOut = useCallback(async () => {
    await authSignOut();
    if (isDemoMode) {
      // Demo has no real session — clear the onboarding gate so the app resets,
      // then return to the public landing page.
      localStorage.removeItem("bumblebee_onboarding");
    } else {
      setUser(null);
      setSession(null);
      setWorkspace(null);
    }
    window.location.href = "/welcome";
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      workspace: workspace ?? (isDemoMode ? DEMO_WORKSPACE : null),
      loading,
      workspaceLoading,
      isDemo: isDemoMode,
      isAuthenticated: !!user,
      signIn: handleSignIn,
      signOut: handleSignOut,
      refreshWorkspace,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
