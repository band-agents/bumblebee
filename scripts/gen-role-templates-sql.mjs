// Writes the role templates from src/lib/permissions.ts into
// supabase/access-control-v2.sql (between the BEGIN/END markers), so the
// database and the app always share one list.
//   node scripts/gen-role-templates-sql.mjs
// src/lib/permissions.test.ts fails if you forget.
import { transformWithEsbuild } from "vite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// permissions.ts has no imports, so a plain transform is enough.
const src = fs.readFileSync(path.join(root, "src/lib/permissions.ts"), "utf8");
const { code } = await transformWithEsbuild(src, "permissions.ts", { format: "cjs", loader: "ts" });
const mod = { exports: {} };
new Function("module", "exports", code)(mod, mod.exports);
const { ROLE_TEMPLATES } = mod.exports;

const sqlPath = path.join(root, "supabase/access-control-v2.sql");
let sql = fs.readFileSync(sqlPath, "utf8");
const esc = (s) => s.replace(/'/g, "''");

const listed = ROLE_TEMPLATES.filter((t) => t.id !== "owner" && t.id !== "admin");
const rows = listed.map((t) => {
  const perms = Object.fromEntries(Object.entries(t.permissions).filter(([, a]) => a.length));
  return `  ('${t.id}', '${esc(JSON.stringify(perms))}')`;
});

const templates = `-- BEGIN ROLE TEMPLATES
-- Generated from src/lib/permissions.ts by scripts/gen-role-templates-sql.mjs — don't edit by hand.
create table if not exists access_role_templates (
  role        text primary key,
  permissions jsonb not null
);
alter table access_role_templates enable row level security;
drop policy if exists "access_role_templates_read" on access_role_templates;
create policy "access_role_templates_read" on access_role_templates for select to authenticated using (true);

insert into access_role_templates (role, permissions) values
${rows.join(",\n")}
on conflict (role) do update set permissions = excluded.permissions;

delete from access_role_templates where role not in (${listed.map((t) => `'${t.id}'`).join(", ")});
-- END ROLE TEMPLATES`;

const roleIds = ["owner", "admin", "manager", "member", ...ROLE_TEMPLATES.map((t) => t.id).filter((id) => !["owner", "admin"].includes(id))];
const roleList = `-- BEGIN ROLE LIST
alter table workspace_members drop constraint if exists workspace_members_role_check;
alter table workspace_members add constraint workspace_members_role_check
  check (role in (${[...new Set(roleIds)].map((r) => `'${r}'`).join(", ")}));
-- END ROLE LIST`;

const swap = (text, begin, end, replacement) => {
  const a = text.indexOf(begin), b = text.indexOf(end);
  if (a < 0 || b < 0) throw new Error(`markers ${begin} / ${end} not found`);
  return text.slice(0, a) + replacement + text.slice(b + end.length);
};
sql = swap(sql, "-- BEGIN ROLE TEMPLATES", "-- END ROLE TEMPLATES", templates);
sql = swap(sql, "-- BEGIN ROLE LIST", "-- END ROLE LIST", roleList);
fs.writeFileSync(sqlPath, sql);
console.log(`access-control-v2.sql: ${listed.length} role templates, ${new Set(roleIds).size} allowed roles`);
