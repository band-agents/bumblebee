/**
 * RequireAccess — the route-level half of access control.
 *
 * ShellNav hides modules a member cannot view; this stops a pasted link or a
 * bookmark from opening them anyway, and turns a suspended member away.
 */

import { useMemo } from "react";
import { Link, useLocation } from "wouter";
import { Lock, UserX } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { canOpenPath, effectivePermissions } from "../lib/access";

export function RequireAccess({ children }: { children: React.ReactNode }) {
  const [path] = useLocation();
  const { workspace, isDemo, signOut } = useAuth();
  const { lang } = useLanguage();
  const ar = lang === "ar";

  const perms = useMemo(
    () => effectivePermissions(workspace?.role, workspace?.permissions),
    [workspace?.role, workspace?.permissions],
  );

  // Demo mode has one all-powerful sample user; nothing to enforce.
  if (isDemo || !workspace) return <>{children}</>;

  if (workspace.status === "suspended") {
    return (
      <Blocked
        icon={UserX}
        title={ar ? "تم إيقاف حسابك" : "Your access is paused"}
        body={ar
          ? "أوقف مسؤول مساحة العمل هذا الحساب. تواصل معه لإعادة تفعيله."
          : "An admin of this workspace has suspended this account. Ask them to turn it back on."}
        action={<button onClick={signOut} className="h-10 px-5 rounded-xl bg-primary text-primary-foreground text-body font-semibold">{ar ? "تسجيل الخروج" : "Sign out"}</button>}
      />
    );
  }

  if (!canOpenPath(workspace.role, perms, path)) {
    return (
      <Blocked
        icon={Lock}
        title={ar ? "هذه الصفحة غير متاحة لك" : "This page isn't part of your access"}
        body={ar
          ? "صلاحياتك الحالية لا تشمل هذا القسم. اطلب من المسؤول إضافته إذا كنت تحتاجه."
          : "Your current access level doesn't include this module. Ask an admin to add it if you need it."}
        action={<Link href="/" className="h-10 px-5 inline-flex items-center rounded-xl bg-primary text-primary-foreground text-body font-semibold">{ar ? "الصفحة الرئيسية" : "Go to dashboard"}</Link>}
      />
    );
  }

  return <>{children}</>;
}

function Blocked({ icon: Icon, title, body, action }: { icon: React.ElementType; title: string; body: string; action: React.ReactNode }) {
  return (
    <div className="min-h-full flex items-center justify-center px-6 py-16">
      <div className="max-w-[380px] text-center">
        <div className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-brand-wash border border-border flex items-center justify-center">
          <Icon size={22} className="text-brand-ink" />
        </div>
        <h2 className="text-title font-semibold mb-2">{title}</h2>
        <p className="text-body text-muted-foreground leading-relaxed mb-6">{body}</p>
        {action}
      </div>
    </div>
  );
}
