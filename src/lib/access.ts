/**
 * Access — what the signed-in user may open.
 *
 * A member's access is their role template (lib/permissions ROLE_TEMPLATES)
 * with any per-user overrides from workspace_members.permissions laid on top.
 * The sidebar hides what a user cannot view, and <RequireAccess> blocks the
 * route itself, so a shared link cannot reach a page the sidebar hid.
 *
 * This is the interface layer. The database enforces the same boundary for
 * account management (supabase/staff-accounts.sql); module data is still
 * workspace-scoped by RLS, not role-scoped.
 */

import { getTemplateById, type PermissionAction, type PermissionMap } from "./permissions";

/** Which permission module guards a route. Longest prefix wins; unlisted paths are open to every member. */
const PATH_MODULES: [prefix: string, module: string][] = [
  ["/print/quotation", "quotations"],
  ["/print/sales_order", "orders"],
  ["/print/invoice", "finance"],
  ["/print/receipt", "finance"],
  ["/print/purchase_request", "purchasing"],
  ["/print/purchase_order", "purchasing"],
  ["/print/goods_receipt", "inventory"],
  ["/print/production_order", "production"],
  ["/print/delivery_note", "delivery"],
  ["/print/pos_sale", "orders"],
  ["/crm", "customers"],
  ["/organizations", "customers"],
  ["/people", "contacts"],
  ["/sales", "orders"],
  ["/quotations", "quotations"],
  ["/orders", "orders"],
  ["/pos", "orders"],
  ["/products", "products"],
  ["/designs", "products"],
  ["/site-visits", "products"],
  ["/production", "production"],
  ["/work", "production"],
  ["/operations", "production"],
  ["/queue", "production"],
  ["/quality", "quality"],
  ["/inventory", "inventory"],
  ["/purchasing", "purchasing"],
  ["/delivery", "delivery"],
  ["/finance", "finance"],
  ["/loyalty", "customers"],
  ["/hr", "users"],
  ["/team", "users"],
  ["/users", "users"],
  ["/analytics", "analytics"],
  ["/reports", "reports"],
  ["/forecast", "analytics"],
  ["/risk", "analytics"],
  ["/intelligence", "analytics"],
  ["/decisions", "analytics"],
  ["/memory", "analytics"],
  ["/rhythms", "analytics"],
  ["/exec", "analytics"],
  ["/shopify", "settings"],
  ["/mobile-apps", "settings"],
  ["/branches", "settings"],
  ["/tools", "settings"],
  ["/data", "settings"],
  ["/settings", "settings"],
  ["/studio", "settings"],
].sort((a, b) => b[0].length - a[0].length) as [string, string][];

export function moduleForPath(path: string): string | null {
  const hit = PATH_MODULES.find(([prefix]) => path === prefix || path.startsWith(prefix + "/"));
  return hit ? hit[1] : null;
}

/** Template permissions, with any non-empty per-user module overrides replacing that module's list. */
export function effectivePermissions(role: string | undefined, overrides?: Record<string, string[]> | null): PermissionMap {
  const base = { ...(getTemplateById(role ?? "viewer")?.permissions ?? getTemplateById("viewer")!.permissions) };
  for (const [module, actions] of Object.entries(overrides ?? {})) {
    if (Array.isArray(actions)) base[module] = actions as PermissionAction[];
  }
  return base;
}

export function isFullAccess(role: string | undefined): boolean {
  return role === "owner" || role === "admin";
}

export function can(perms: PermissionMap, module: string, action: PermissionAction = "view"): boolean {
  return (perms[module] ?? []).includes(action);
}

/** Can this member open this path? Owners and admins can open everything. */
export function canOpenPath(role: string | undefined, perms: PermissionMap, path: string): boolean {
  if (isFullAccess(role)) return true;
  const module = moduleForPath(path);
  return module === null || can(perms, module, "view");
}
