import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { ROLE_TEMPLATES, MODULES } from "./permissions";
import { effectivePermissions, canOpenPath, hasCustomAccess } from "./access";

describe("role templates", () => {
  it("match access_role_templates in supabase/access-control-v2.sql", () => {
    const sql = fs.readFileSync(path.resolve(__dirname, "../../supabase/access-control-v2.sql"), "utf8");
    const block = sql.slice(sql.indexOf("-- BEGIN ROLE TEMPLATES"), sql.indexOf("-- END ROLE TEMPLATES"));
    const rows = [...block.matchAll(/\('([a-z_]+)', '(\{.*?\})'\)/g)].map((m) => [m[1], JSON.parse(m[2])] as const);
    const inSql = Object.fromEntries(rows);
    for (const t of ROLE_TEMPLATES) {
      if (t.id === "owner" || t.id === "admin") continue; // full access is decided by role, not a list
      const sorted = (o: Record<string, string[]>) =>
        Object.fromEntries(Object.entries(o).filter(([, a]) => a.length).map(([k, a]) => [k, [...a].sort()]).sort());
      expect(sorted(inSql[t.id] ?? {}), `template ${t.id}`).toEqual(sorted(t.permissions));
    }
    expect(Object.keys(inSql).sort()).toEqual(ROLE_TEMPLATES.filter((t) => !["owner", "admin"].includes(t.id)).map((t) => t.id).sort());
  });

  it("only list real modules", () => {
    const keys = new Set(MODULES.map((m) => m.key));
    for (const t of ROLE_TEMPLATES) for (const k of Object.keys(t.permissions)) expect(keys.has(k), `${t.id}.${k}`).toBe(true);
  });
});

describe("access", () => {
  it("custom access replaces the role template completely", () => {
    const perms = effectivePermissions("sales", { purchasing: ["view"] });
    expect(Object.keys(perms)).toEqual(["purchasing"]);
    expect(canOpenPath("sales", perms, "/purchasing")).toBe(true);
    expect(canOpenPath("sales", perms, "/quotations")).toBe(false);
    expect(canOpenPath("sales", perms, "/finance/invoices")).toBe(false);
    expect(canOpenPath("sales", perms, "/hr/employees")).toBe(false);
  });

  it("empty custom access falls back to the template", () => {
    expect(hasCustomAccess({})).toBe(false);
    expect(hasCustomAccess({ orders: [] })).toBe(false);
    const perms = effectivePermissions("sales", {});
    expect(canOpenPath("sales", perms, "/quotations")).toBe(true);
    expect(canOpenPath("sales", perms, "/purchasing")).toBe(false);
  });

  it("everyone keeps home and their own settings; unknown roles get nothing else", () => {
    const perms = effectivePermissions("nonsense", null);
    expect(perms).toEqual({});
    for (const p of ["/", "/today", "/activity", "/settings"]) expect(canOpenPath("nonsense", perms, p)).toBe(true);
    expect(canOpenPath("nonsense", perms, "/orders")).toBe(false);
    expect(canOpenPath("nonsense", perms, "/branches")).toBe(false);
  });

  it("owners and admins open everything", () => {
    expect(canOpenPath("admin", {}, "/finance/bank")).toBe(true);
    expect(canOpenPath("owner", {}, "/users")).toBe(true);
  });
});
