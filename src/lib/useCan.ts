import { useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { effectivePermissions, isFullAccess } from "./access";
import type { PermissionAction } from "./permissions";

/**
 * useCan() → can(module, action). Hides buttons the database would refuse.
 * "work" = any action beyond view/export in that module (what the access
 * picker calls Work), matching member_can(…, 'work') in the database.
 */
export function useCan() {
  const { workspace, isDemo } = useAuth();
  return useCallback((module: string, action: PermissionAction | "work" = "view") => {
    if (isDemo || !workspace) return true;
    if (isFullAccess(workspace.role)) return true;
    const actions = effectivePermissions(workspace.role, workspace.permissions)[module] ?? [];
    return action === "work" ? actions.some((a) => a !== "view" && a !== "export") : actions.includes(action);
  }, [isDemo, workspace]);
}
