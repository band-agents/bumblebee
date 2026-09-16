import { supabase, isDemoMode } from "./supabase";
import type { User, Session, AuthError } from "@supabase/supabase-js";

/**
 * Authentication is username + password only.
 *
 * Accounts are created by a workspace owner/admin in Users & Access
 * (supabase/staff-accounts.sql → create_staff_account). There is no self
 * sign-up, no OAuth and no email-based reset: public sign-ups are disabled on
 * the Supabase project and admins reset passwords from inside the app.
 */

// ─── Demo user used when Supabase is not configured ───────

export const DEMO_USER: User = {
  id: "demo-user-id",
  email: "demo@bumblebee.app",
  app_metadata: { provider: "demo" },
  user_metadata: { full_name: "Demo User", avatar_url: null },
  aud: "authenticated",
  created_at: new Date().toISOString(),
  role: "authenticated",
  updated_at: new Date().toISOString(),
} as unknown as User;

export const DEMO_SESSION: Session = {
  access_token: "demo-token",
  refresh_token: "demo-refresh-token",
  expires_in: 9999999,
  token_type: "bearer",
  user: DEMO_USER,
} as unknown as Session;

// ─── Auth result shape ─────────────────────────────────────

export interface AuthResult {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

const INVALID = (): AuthError =>
  ({ name: "AuthApiError", message: "Invalid login credentials", status: 400 }) as AuthError;

// ─── Auth functions ────────────────────────────────────────

/**
 * Sign in with a username. The database maps it to the account's private login
 * address (email_for_username); an unknown username gets the same answer as a
 * wrong password, so the page never reveals which usernames exist.
 */
export async function signIn(username: string, password: string): Promise<AuthResult> {
  if (isDemoMode || !supabase) {
    console.warn("[Bumblebee] Demo mode — sign in is a no-op");
    return { user: DEMO_USER, session: DEMO_SESSION, error: null };
  }
  const name = username.trim().toLowerCase();
  if (!name || !password) return { user: null, session: null, error: INVALID() };

  const { data: email, error: lookupError } = await supabase.rpc("email_for_username" as never, { p_username: name } as never);
  if (lookupError) return { user: null, session: null, error: { name: "AuthApiError", message: lookupError.message, status: 500 } as AuthError };
  if (!email) return { user: null, session: null, error: INVALID() };

  const { data, error } = await supabase.auth.signInWithPassword({ email: email as unknown as string, password });
  return { user: data.user, session: data.session, error };
}

export async function signOut(): Promise<{ error: AuthError | null }> {
  if (isDemoMode || !supabase) {
    return { error: null };
  }
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser(): Promise<User | null> {
  if (isDemoMode || !supabase) return DEMO_USER;
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function getSession(): Promise<Session | null> {
  if (isDemoMode || !supabase) return DEMO_SESSION;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/** A signed-in user changing their own password. */
export async function updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
  if (isDemoMode || !supabase) return { error: null };
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return { error };
}

export function onAuthStateChange(callback: (user: User | null, session: Session | null) => void) {
  if (isDemoMode || !supabase) {
    callback(DEMO_USER, DEMO_SESSION);
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null, session);
  });
}
