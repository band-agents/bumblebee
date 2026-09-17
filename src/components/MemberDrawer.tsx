/**
 * MemberDrawer — manage one workspace login from Users & Access.
 *
 * Everything here writes to the database through SECURITY DEFINER functions
 * (supabase/staff-accounts.sql, supabase/access-control-v2.sql), which
 * re-check that the caller is an owner/admin (and that only the owner touches
 * admins):
 *   - access (role or exact modules) → update_workspace_member(p_role, p_permissions)
 *   - suspend / re-activate          → update_workspace_member(p_status) — signs them out everywhere
 *   - new password                   → reset_staff_password
 *   - remove login                   → remove_workspace_member
 * Nothing is faked: in demo mode the drawer says so and changes stay local.
 */

import { useMemo, useState } from "react";
import { X, Loader2, KeyRound, ShieldCheck, UserX, UserCheck, Copy, Check, Trash2, SlidersHorizontal } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { getSupabaseClient, isDemoMode } from "../lib/supabase";
import { type PermissionMap } from "../lib/permissions";
import { effectivePermissions, hasCustomAccess, isFullAccess } from "../lib/access";
import { DEPARTMENTS } from "../lib/access-control";
import { AccessPicker, openModules } from "./AccessPicker";
import { RolesMultiSelect } from "./RolesMultiSelect";
import { friendlyAccessError } from "../lib/errors";

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
  permissions?: PermissionMap;
  extra_roles?: string[];
}

const inputCls = "w-full h-10 px-3 rounded-xl border border-border/60 bg-background text-body focus:outline-none focus:ring-2 focus:ring-brand-ink/20";

function generatePassword(): string {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = new Uint32Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

const sameMap = (a: PermissionMap, b: PermissionMap) => {
  const norm = (m: PermissionMap) => JSON.stringify(Object.keys(m).sort().map((k) => [k, [...m[k]].sort()]));
  return norm(a) === norm(b);
};

export function MemberDrawer({ member, onClose, onChanged }: {
  member: DrawerMember;
  onClose: () => void;
  /** Called after any successful change so the list reloads. `removed` = the login is gone. */
  onChanged: (message: string, local?: Partial<DrawerMember>, removed?: boolean) => void;
}) {
  const { lang } = useLanguage();
  const ar = lang === "ar";
  const { workspace, user } = useAuth();

  const startRoles = [member.role, ...(member.extra_roles ?? [])];
  const [roles, setRoles] = useState<string[]>(startRoles);
  const role = roles[0];
  const extraRoles = roles.slice(1);
  const startCustom = hasCustomAccess(member.permissions);
  const [custom, setCustom] = useState(startCustom);
  const [access, setAccess] = useState<PermissionMap>(() => effectivePermissions(member.role, member.permissions, member.extra_roles));
  const [newPassword, setNewPassword] = useState("");
  const [shownPassword, setShownPassword] = useState<string | null>(null);
  const [busy, setBusy] = useState<"access" | "status" | "password" | "remove" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const isSelf = member.user_id === user?.id;
  const isOwner = member.role === "owner";
  const callerIsOwner = workspace?.role === "owner";
  // Admins manage everyone except owners and other admins; nobody changes their own access here.
  const canManage = !isSelf && !isOwner && (callerIsOwner || member.role !== "admin");
  const suspended = member.status === "suspended";
  const username = member.email?.startsWith("@") ? member.email.slice(1) : member.email;
  const roleIsFull = isFullAccess(role);

  const templateAccess = useMemo(() => effectivePermissions(role, null, extraRoles), [roles.join("|")]); // eslint-disable-line react-hooks/exhaustive-deps
  const shownAccess = custom ? access : templateAccess;
  const originalAccess = useMemo(() => effectivePermissions(member.role, member.permissions, member.extra_roles), [member.role, member.permissions, member.extra_roles]);
  const accessDirty = roles.join("|") !== startRoles.join("|") || custom !== startCustom || (custom && !sameMap(access, originalAccess));

  async function rpc(fn: string, args: Record<string, unknown>) {
    const sb = getSupabaseClient();
    if (isDemoMode || !sb || !workspace) return null;
    const { error: err } = await sb.rpc(fn as never, { p_workspace_id: workspace.id, p_user_id: member.user_id, ...args } as never);
    return err;
  }

  async function saveAccess() {
    if (custom && !roleIsFull && openModules(access).length === 0) {
      setError(ar ? "اختر قسماً واحداً على الأقل، أو أوقف الحساب بدلاً من ذلك." : "Open at least one module — or suspend the login instead.");
      return;
    }
    setBusy("access"); setError(null);
    // An empty map means "use the role template".
    const permissions = custom && !roleIsFull ? access : {};
    const err = await rpc("update_workspace_member", { p_role: role, p_permissions: permissions, p_extra_roles: roleIsFull ? [] : extraRoles });
    setBusy(null);
    if (err) { setError(friendlyAccessError(err.message, ar)); return; }
    onChanged(ar ? "تم حفظ الصلاحيات ✓ — تتحدث عنده خلال ثوانٍ" : "Access saved ✓ — it updates on their screen within seconds", { role, permissions, extra_roles: roleIsFull ? [] : extraRoles });
  }

  async function toggleStatus() {
    const next = suspended ? "active" : "suspended";
    setBusy("status"); setError(null);
    const err = await rpc("update_workspace_member", { p_status: next });
    setBusy(null);
    if (err) { setError(friendlyAccessError(err.message, ar)); return; }
    onChanged(next === "suspended"
      ? (ar ? "تم إيقاف الحساب وتسجيل خروجه من كل الأجهزة" : "Login suspended and signed out of every device")
      : (ar ? "تم تفعيل الحساب ✓" : "Login re-activated ✓"), { status: next });
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

  async function removeLogin() {
    setBusy("remove"); setError(null);
    const err = await rpc("remove_workspace_member", {});
    setBusy(null);
    if (err) { setError(friendlyAccessError(err.message, ar)); setConfirmRemove(false); return; }
    onChanged(ar ? "تم حذف الحساب وتسجيل خروجه" : "Login removed and signed out", undefined, true);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-foreground/25" onClick={onClose} />
      <aside className="relative w-full max-w-lg h-full bg-background border-s border-border shadow-2xl flex flex-col">
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

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">
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
                : isOwner
                  ? (ar ? "صلاحيات المالك لا تتغير." : "The owner always has full access.")
                  : (ar ? "فقط المالك يمكنه تعديل المسؤولين." : "Only the owner can change admins.")}
            </p>
          )}

          {/* ── Access ── */}
          <section className="space-y-3">
            <h3 className="text-body font-semibold flex items-center gap-2"><ShieldCheck size={15} className="text-brand-ink" />{ar ? "ماذا يفتح" : "What they can open"}</h3>

            <div>
              <label className="text-micro text-muted-foreground font-medium mb-1 block">{ar ? "الأدوار" : "Roles"}</label>
              <RolesMultiSelect value={roles} onChange={(r) => { setRoles(r); setCustom(false); }} ar={ar} disabled={!canManage}
                allowOwner={isOwner} allowAdmin={callerIsOwner} />
            </div>

            {roleIsFull ? (
              <p className="rounded-xl bg-muted/40 border border-border px-4 py-3 text-caption text-muted-foreground">
                {ar ? "المالك والمسؤول يفتحان كل شيء." : "Owners and admins open everything."}
              </p>
            ) : (
              <>
                <div className="flex rounded-xl border border-border overflow-hidden text-caption font-medium">
                  <button type="button" disabled={!canManage} onClick={() => setCustom(false)}
                    className={`flex-1 h-9 ${!custom ? "bg-foreground text-background" : "bg-background text-muted-foreground hover:bg-muted"}`}>
                    {ar ? "حسب الأدوار" : roles.length > 1 ? "Use the roles' modules" : "Use the role's modules"}
                  </button>
                  <button type="button" disabled={!canManage} onClick={() => { if (!custom) setAccess(templateAccess); setCustom(true); }}
                    className={`flex-1 h-9 inline-flex items-center justify-center gap-1.5 ${custom ? "bg-foreground text-background" : "bg-background text-muted-foreground hover:bg-muted"}`}>
                    <SlidersHorizontal size={13} /> {ar ? "اختيار الأقسام بنفسي" : "Pick modules myself"}
                  </button>
                </div>
                <AccessPicker
                  value={shownAccess}
                  ar={ar}
                  disabled={!canManage}
                  onChange={(next) => { if (!custom) setCustom(true); setAccess(next); }}
                />
              </>
            )}

            {canManage && accessDirty && (
              <button onClick={saveAccess} disabled={busy !== null} className="h-10 px-5 rounded-xl bg-primary text-primary-foreground text-caption font-semibold inline-flex items-center gap-2 disabled:opacity-50">
                {busy === "access" && <Loader2 size={12} className="animate-spin" />}{ar ? "حفظ الصلاحيات" : "Save access"}
              </button>
            )}
          </section>

          {/* ── Password ── */}
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

          {/* ── Suspend ── */}
          {canManage && (
            <section className="space-y-2">
              <h3 className="text-body font-semibold">{suspended ? (ar ? "إعادة التفعيل" : "Re-activate") : (ar ? "إيقاف الحساب" : "Suspend login")}</h3>
              <p className="text-micro text-muted-foreground">
                {suspended
                  ? (ar ? "سيتمكن من الدخول مرة أخرى بنفس اسم المستخدم وكلمة المرور." : "They'll be able to sign in again with the same username and password.")
                  : (ar ? "يتم تسجيل خروجه فوراً من كل الأجهزة ولن يستطيع الدخول حتى تعيد تفعيله. بياناته تبقى كما هي." : "They're signed out of every device within seconds and can't sign in until you re-activate them. Nothing they created is deleted.")}
              </p>
              <button onClick={toggleStatus} disabled={busy !== null}
                className={`h-9 px-4 rounded-xl text-caption font-semibold inline-flex items-center gap-2 disabled:opacity-50 ${suspended ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "border border-rose-200 text-rose-700 hover:bg-rose-50"}`}>
                {busy === "status" ? <Loader2 size={12} className="animate-spin" /> : suspended ? <UserCheck size={13} /> : <UserX size={13} />}
                {suspended ? (ar ? "إعادة التفعيل" : "Re-activate") : (ar ? "إيقاف وتسجيل خروج" : "Suspend & sign out")}
              </button>
            </section>
          )}

          {/* ── Remove ── */}
          {canManage && (
            <section className="space-y-2 rounded-xl border border-rose-200/80 p-4">
              <h3 className="text-body font-semibold text-rose-700 flex items-center gap-2"><Trash2 size={14} />{ar ? "حذف الحساب نهائياً" : "Remove login"}</h3>
              <p className="text-micro text-muted-foreground">
                {ar
                  ? "يُحذف من مساحة العمل، يُسجَّل خروجه من كل الأجهزة، ولا يمكنه الدخول مرة أخرى. ما أنشأه يبقى باسمه، واسم المستخدم يصبح متاحاً لحساب جديد. لا يمكن التراجع."
                  : "They're taken out of the workspace, signed out of every device and can never sign in with this login again. What they created stays, still under their name, and the username becomes free for a new login. This can't be undone."}
              </p>
              {confirmRemove ? (
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={removeLogin} disabled={busy !== null} className="h-9 px-4 rounded-xl bg-rose-600 text-white text-caption font-semibold inline-flex items-center gap-2 disabled:opacity-50">
                    {busy === "remove" ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={13} />}
                    {ar ? `نعم، احذف ${member.display_name}` : `Yes, remove ${member.display_name}`}
                  </button>
                  <button onClick={() => setConfirmRemove(false)} className="h-9 px-4 rounded-xl border border-border text-caption">{ar ? "إلغاء" : "Cancel"}</button>
                </div>
              ) : (
                <button onClick={() => setConfirmRemove(true)} disabled={busy !== null} className="h-9 px-4 rounded-xl border border-rose-300 text-rose-700 text-caption font-semibold inline-flex items-center gap-2 hover:bg-rose-50 disabled:opacity-50">
                  <Trash2 size={13} /> {ar ? "حذف الحساب" : "Remove login"}
                </button>
              )}
            </section>
          )}

          {error && <p role="alert" className="text-caption text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">{error}</p>}
        </div>
      </aside>
    </div>
  );
}
