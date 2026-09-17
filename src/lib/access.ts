/**
 * Access — what the signed-in user may open.
 *
 * A member's access is EITHER their custom module list (workspace_members.
 * permissions, set in Users & Access → Custom access) OR, when that is empty,
 * their role template (lib/permissions ROLE_TEMPLATES). Custom access
 * replaces the template completely — a module that isn't listed isn't open.
 *
 * The sidebar hides what a user cannot view, <RequireAccess> blocks the route
 * itself, and the database applies the same module list to the data
 * (supabase/access-control-v2.sql), so a pasted link or a direct API call
 * can't reach it either.
 */

import { ALWAYS_OPEN_PATHS, getTemplateById, type PermissionAction, type PermissionMap } from "./permissions";

/** Which permission module guards a route. Longest prefix wins. */
const PATH_MODULES: [prefix: string, module: string][] = [
  ["/print/quotation", "quotations"],
  ["/print/sales_order", "orders"],
  ["/print/invoice", "finance"],
  ["/print/receipt", "finance"],
  ["/print/purchase_request", "purchasing"],
  ["/print/purchase_order", "purchasing"],
  ["/print/goods_receipt", "purchasing"],
  ["/print/production_order", "production"],
  ["/print/delivery_note", "delivery"],
  ["/print/pos_sale", "pos"],
  ["/crm", "customers"],
  ["/organizations", "customers"],
  ["/sales", "customers"],
  ["/loyalty", "customers"],
  ["/people", "contacts"],
  ["/quotations", "quotations"],
  ["/orders", "orders"],
  ["/pos", "pos"],
  ["/products", "products"],
  ["/designs", "products"],
  ["/site-visits", "products"],
  ["/production", "production"],
  ["/work", "production"],
  ["/operations", "production"],
  ["/queue", "production"],
  ["/quality", "quality"],
  ["/inventory", "inventory"],
  ["/resources", "inventory"],
  ["/purchasing", "purchasing"],
  ["/delivery", "delivery"],
  ["/finance", "finance"],
  ["/hr", "hr"],
  ["/team", "users"],
  ["/users", "users"],
  ["/analytics", "analytics"],
  ["/forecast", "analytics"],
  ["/risk", "analytics"],
  ["/intelligence", "analytics"],
  ["/decisions", "analytics"],
  ["/memory", "analytics"],
  ["/rhythms", "analytics"],
  ["/exec", "analytics"],
  ["/reports", "reports"],
  ["/roadmap", "settings"],
  ["/knowledge", "settings"],
  ["/shopify", "settings"],
  ["/mobile-apps", "settings"],
  ["/branches", "settings"],
  ["/tools", "settings"],
  ["/data", "settings"],
  ["/settings/codes", "settings"],
  ["/studio", "settings"],
].sort((a, b) => b[0].length - a[0].length) as [string, string][];

export function moduleForPath(path: string): string | null {
  const clean = path.split(/[?#]/)[0];
  const hit = PATH_MODULES.find(([prefix]) => clean === prefix || clean.startsWith(prefix + "/"));
  return hit ? hit[1] : null;
}

/** True when the member has a custom module list (not just their role template). */
export function hasCustomAccess(overrides?: Record<string, string[]> | null): boolean {
  return !!overrides && Object.values(overrides).some((a) => Array.isArray(a) && a.length > 0);
}

/**
 * The member's permissions: the custom list when there is one (exactly as
 * saved — nothing inherited), otherwise the role template. An unknown role
 * gets nothing rather than something.
 */
export function effectivePermissions(
  role: string | undefined,
  overrides?: Record<string, string[]> | null,
  extraRoles?: string[] | null,
): PermissionMap {
  if (hasCustomAccess(overrides)) {
    const map: PermissionMap = {};
    for (const [module, actions] of Object.entries(overrides!)) {
      if (Array.isArray(actions) && actions.length) map[module] = actions as PermissionAction[];
    }
    return map;
  }
  // Every role they hold, combined: a module's actions are the union across roles.
  const map: PermissionMap = {};
  for (const id of [role ?? "", ...(extraRoles ?? [])]) {
    for (const [module, actions] of Object.entries(getTemplateById(id)?.permissions ?? {})) {
      map[module] = [...new Set([...(map[module] ?? []), ...actions])];
    }
  }
  return map;
}

export function isFullAccess(role: string | undefined): boolean {
  return role === "owner" || role === "admin";
}

export function can(perms: PermissionMap, module: string, action: PermissionAction = "view"): boolean {
  return (perms[module] ?? []).includes(action);
}

/** Can this member open this path? Owners and admins can open everything; home pages are open to all. */
export function canOpenPath(role: string | undefined, perms: PermissionMap, path: string): boolean {
  if (isFullAccess(role)) return true;
  const clean = path.split(/[?#]/)[0];
  if (ALWAYS_OPEN_PATHS.includes(clean)) return true;
  const module = moduleForPath(clean);
  // Pages that no module guards are only for owners and admins.
  return module !== null && can(perms, module, "view");
}
