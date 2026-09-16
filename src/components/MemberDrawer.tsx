/**
 * MemberDrawer — manage one workspace login from Users & Access.
 *
 * Everything here writes to the database through the SECURITY DEFINER
 * functions in supabase/staff-accounts.sql, which re-check that the caller is
 * an owner/admin (and that only the owner touches owners and admins):
 *   - access level  → update_workspace_member(p_role)
 *   - suspend/allow → update_workspace_member(p_status)
 *   - new password  → reset_staff_password
 * Nothing is faked: in demo mode the drawer says so and changes stay local.
 */

import { useState } from "react";
import { X, Loader2, KeyRound, ShieldCheck, UserX, UserCheck, Copy, Check } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { getSupabaseClient, isDemoMode } from "../lib/supabase";
import { ROLE_TEMPLATES, countPermissions } from "../lib/permissions";
import { DEPARTMENTS } from "../lib/access-control";

export interface DrawerMember {
  id: string;
  user_id: string;
  role: string;
  department?: string;
  display_name?: string;
  status: string;
  email?: string;
  last_active?: string;
  joined_at?: string;
}

const inputCls = "w-full h-10 px-3 rounded-xl border border-border/60 bg-background text-body focus:outline-none focus:ring-2 focus:ring-brand-ink/20";
const labelCls = "text-micro text-muted-foreground font-medium mb-1 block";

function generatePassword(): string {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = new Uint32Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

export function MemberDrawer({ member, onClose, onChanged }: {
  member: DrawerMember;
  onClose: () => void;
  /** Called after any successful change so the list reloads. */
  onChanged: (message: string, local?: Partial<DrawerMember>) => void;
}) {
  const { lang } = useLanguage();
  const ar = lang === "ar";
  const { workspace, user } = useAuth();

  const [role, setRole] = useState(member.role);
  const [newPassword, setNewPassword] = useState("");
  const [shownPassword, setShownPassword] = useState<string | null>(null);
  const [busy, setBusy] = useState<"role" | "status" | "password" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isSelf = member.user_id === user?.id;
  const isOwner = member.role === "owner";
  const callerIsOwner = workspace?.role === "owner";
  // Admins manage everyone except owners and other admins; the owner manages all but can't demote themselves here.
  const canManage = !isSelf && (callerIsOwner || !(member.role === "owner" || member.role === "admin"));
  const suspended = member.status === "suspended";
  const tmpl = ROLE_TEMPLATES.find((t) => t.id === role);
  const username = member.email?.startsWith("@") ? member.email.slice(1) : member.email;

  async function rpc(fn: string, args: Record<string, unknown>) {
    const sb = getSupabaseClient();
    if (isDemoMode || !sb || !workspace) return null;
    const { error: err } = await sb.rpc(fn as never, { p_workspace_id: workspace.id, p_user_id: member.user_id, ...args } as never);
    return err;
  }

  async function saveRole() {
    setBusy("role"); setError(null);
    const err = await rpc("update_workspace_member", { p_role: role });
    setBusy(null);
    if (err) { setError(err.message); return; }
    onChanged(ar ? "تم تحديث الصلاحية ✓" : "Access level updated ✓", { role });
  }

  async function toggleStatus() {
    const next = suspended ? "active" : "suspended";
    setBusy("status"); setError(null);
    const err = await rpc("update_workspace_member", { p_status: next });
    setBusy(null);
    if (err) { setError(err.message); return; }
    onChanged(next === "suspended" ? (ar ? "تم إيقاف الحساب" : "Login suspended") : (ar ? "تم تفعيل الحساب ✓" : "Login re-activated ✓"), { status: next });
  }

  async function resetPassword() {
    if (newPassword.length < 8) { setError(ar ? "كلمة المرور 8 أحرف على الأقل" : "Password must be at least 8 characters"); return; }
    setBusy("password"); setError(null);
    const err = await rpc("reset_staff_password", { p_password: newPassword });
    setBusy(null);
    if (err) { setError(err.message); return; }
    setShownPassword(newPassword);
    setNewPassword("");
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-foreground/25" onClick={onClose} />
      <aside className="relative w-full max-w-md h-full bg-background border-s border-border shadow-2xl flex flex-col">
        <div className="px-6 py-5 border-b border-border flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-brand-wash flex items-center justify-center text-title font-semibold text-brand-ink shrink-0">
              {(member.display_name || "?").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-title font-semibold truncate">{member.display_name}</p>
              <p className="text-caption text-muted-foreground font-mono truncate">{username ? `@${username.replace(/^@/, "")}` : "—"}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted"><X size={15} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <div className="flex flex-wrap gap-2 text-micro">
            <span className={`px-2 py-0.5 rounded-full font-medium ${suspended ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
              {suspended ? (ar ? "موقوف" : "Suspended") : (ar ? "نشط" : "Active")}
            </span>
            {member.department && (
              <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {(() => { const d = DEPARTMENTS.find((x) => x.value === member.department); return d ? (ar ? d.ar : d.en) : member.department; })()}
              </span>
            )}
            {member.last_active && <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{member.last_active}</span>}
          </div>

          {isDemoMode && (
            <p className="rounded-xl bg-brand-wash border border-border px-4 py-3 text-caption text-foreground/80">
              {ar ? "وضع العرض: التغييرات لا تُحفظ في قاعدة بيانات." : "Demo mode: changes are not saved to a database."}
            </p>
          )}

          {!canManage && (
            <p className="rounded-xl bg-muted/50 border border-border px-4 py-3 text-caption text-muted-foreground">
              {isSelf
                ? (ar ? "لا يمكنك تعديل حسابك من هنا." : "You can't change your own access from here.")
                : (ar ? "فقط المالك يمكنه تعديل المالك أو المسؤولين." : "Only the owner can change owners and admins.")}
            </p>
          )}

          {/* Access level */}
          <section className="space-y-2">
            <h3 className="text-body font-semibold flex items-center gap-2"><ShieldCheck size={15} className="text-brand-ink" />{ar ? "الصلاحية" : "Access level"}</h3>
            <select value={role} disabled={!canManage || isOwner} onChange={(e) => setRole(e.target.value)} className={inputCls + " appearance-none cursor-pointer disabled:opacity-60"}>
              {ROLE_TEMPLATES.filter((t) => t.id !== "owner" || isOwner)
                .filter((t) => callerIsOwner || !["owner", "admin"].includes(t.id))
                .map((t) => <option key={t.id} value={t.id}>{ar ? t.ar : t.en} — {ar ? t.descriptionAr : t.description}</option>)}
            </select>
            {tmpl && <p className="text-micro text-muted-foreground">{countPermissions(tmpl.permissions)} {ar ? "صلاحية" : "permissions"}</p>}
            {canManage && role !== member.role && (
              <button onClick={saveRole} disabled={busy !== null} className="h-9 px-4 rounded-xl bg-primary text-primary-foreground text-caption font-semibold inline-flex items-center gap-2 disabled:opacity-50">
                {busy === "role" && <Loader2 size={12} className="animate-spin" />}{ar ? "حفظ الصلاحية" : "Save access level"}
              </button>
            )}
          </section>

          {/* Password */}
          {canManage && (
            <section className="space-y-2">
              <h3 className="text-body font-semibold flex items-center gap-2"><KeyRound size={15} className="text-brand-ink" />{ar ? "تعيين كلمة مرور جديدة" : "Set a new password"}</h3>
              {shownPassword ? (
                <div className="rounded-xl border border-border bg-brand-wash p-3 space-y-2">
                  <p className="text-micro text-muted-foreground">{ar ? "أرسلها له. لن تظهر مرة أخرى." : "Send this to them. It won't be shown again."}</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 font-mono text-body bg-card border border-border rounded-lg px-3 py-2 truncate">{shownPassword}</code>
                    <button
                      onClick={() => { navigator.clipboard?.writeText(shownPassword); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                      className="h-9 w-9 rounded-lg border border-border bg-card flex items-center justify-center" aria-label="Copy password">
                      {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <button onClick={() => setShownPassword(null)} className="text-micro text-brand-ink hover:underline">{ar ? "تم" : "Done"}</button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputCls + " font-mono pe-20"} placeholder={ar ? "8 أحرف على الأقل" : "At least 8 characters"} autoComplete="new-password" />
                    <button type="button" onClick={() => setNewPassword(generatePassword())} className="absolute end-1 top-1/2 -translate-y-1/2 h-8 px-2 rounded-lg text-micro font-medium text-brand-ink hover:bg-brand-wash">
                      {ar ? "توليد" : "Generate"}
                    </button>
                  </div>
                  <button onClick={resetPassword} disabled={busy !== null || newPassword.length < 8} className="h-9 px-4 rounded-xl border border-border bg-card text-caption font-semibold inline-flex items-center gap-2 hover:bg-brand-wash disabled:opacity-50">
                    {busy === "password" && <Loader2 size={12} className="animate-spin" />}{ar ? "تعيين كلمة المرور" : "Set password"}
                  </button>
                </>
              )}
            </section>
          )}

          {/* Suspend */}
          {canManage && !isOwner && (
            <section className="space-y-2">
              <h3 className="text-body font-semibold">{suspended ? (ar ? "إعادة التفعيل" : "Re-activate") : (ar ? "إيقاف الحساب" : "Suspend login")}</h3>
              <p className="text-micro text-muted-foreground">
                {suspended
                  ? (ar ? "سيتمكن من الدخول مرة أخرى بنفس البيانات." : "They'll be able to sign in again with the same username and password.")
                  : (ar ? "لن يتمكن من فتح أي بيانات حتى تعيد تفعيله." : "They won't be able to open any workspace data until you re-activate them.")}
              </p>
              <button onClick={toggleStatus} disabled={busy !== null}
                className={`h-9 px-4 rounded-xl text-caption font-semibold inline-flex items-center gap-2 disabled:opacity-50 ${suspended ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "border border-rose-200 text-rose-700 hover:bg-rose-50"}`}>
                {busy === "status" ? <Loader2 size={12} className="animate-spin" /> : suspended ? <UserCheck size={13} /> : <UserX size={13} />}
                {suspended ? (ar ? "إعادة التفعيل" : "Re-activate") : (ar ? "إيقاف" : "Suspend")}
              </button>
            </section>
          )}

          {error && <p role="alert" className="text-caption text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">{error}</p>}
        </div>
      </aside>
    </div>
  );
}
