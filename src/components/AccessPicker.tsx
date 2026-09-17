/**
 * AccessPicker — choose exactly which modules a person can open, and how far.
 *
 *   Off   hidden, and the database returns none of its data
 *   View  open and read (and export)
 *   Edit  also add and correct records — no deleting, approving or releasing
 *   Full  everything the module allows
 *
 * What's picked here is saved as the member's custom access and REPLACES
 * their role template (supabase/access-control-v2.sql enforces it). A role's
 * finer mix (e.g. a cashier who can add sales but not change them) is shown
 * as-is until you change that module.
 */

import { MODULES, PERMISSION_LABELS, fullActions, type PermissionAction, type PermissionMap } from "../lib/permissions";

export type Level = "off" | "view" | "edit" | "full";

const EDIT_ACTIONS: PermissionAction[] = ["view", "create", "edit", "export", "import", "assign"];

export function levelOf(moduleKey: string, actions: PermissionAction[] | undefined): Level {
  if (!actions || actions.length === 0 || !actions.includes("view")) return "off";
  if (fullActions(moduleKey).every((a) => actions.includes(a))) return "full";
  if (actions.some((a) => a === "create" || a === "edit" || a === "assign" || a === "import")) return "edit";
  return "view";
}

/** Short, exact label for a role's access to one module: Full, Edit, Edit + approve, View + approve, View. */
export function accessLabel(moduleKey: string, actions: PermissionAction[] | undefined, ar = false): string {
  const lvl = levelOf(moduleKey, actions);
  if (lvl === "off") return ar ? "مغلق" : "Off";
  if (lvl === "full") return ar ? "كامل" : "Full";
  const approves = !!actions?.some((a) => a === "approve" || a === "release");
  const deletes = !!actions?.includes("delete");
  const base = lvl === "edit" ? (ar ? "تعديل" : "Edit") : (ar ? "عرض" : "View");
  return base + (approves ? (ar ? " + اعتماد" : " + approve") : "") + (deletes ? (ar ? " + حذف" : " + delete") : "");
}

function actionsFor(moduleKey: string, level: Level): PermissionAction[] {
  const all = fullActions(moduleKey);
  if (level === "view") return all.filter((a) => a === "view" || a === "export");
  if (level === "edit") return all.filter((a) => EDIT_ACTIONS.includes(a));
  if (level === "full") return all;
  return [];
}

/** True when a module's actions are exactly what the level would give — otherwise the picker shows the precise mix. */
function isStandard(moduleKey: string, actions: PermissionAction[]): boolean {
  const lvl = levelOf(moduleKey, actions);
  if (lvl === "off") return true;
  const expected = actionsFor(moduleKey, lvl);
  return expected.length === actions.length && expected.every((a) => actions.includes(a));
}

export function setLevel(map: PermissionMap, moduleKey: string, level: Level): PermissionMap {
  const next = { ...map };
  if (level === "off") delete next[moduleKey];
  else next[moduleKey] = actionsFor(moduleKey, level);
  return next;
}

/** Modules with any access, in picker order. */
export function openModules(map: PermissionMap): string[] {
  return MODULES.filter((m) => levelOf(m.key, map[m.key]) !== "off").map((m) => m.key);
}

export const LEVELS: { id: Level; en: string; ar: string }[] = [
  { id: "off", en: "Off", ar: "مغلق" },
  { id: "view", en: "View", ar: "عرض" },
  { id: "edit", en: "Edit", ar: "تعديل" },
  { id: "full", en: "Full", ar: "كامل" },
];

export function AccessPicker({ value, onChange, ar, disabled }: {
  value: PermissionMap;
  onChange: (next: PermissionMap) => void;
  ar: boolean;
  disabled?: boolean;
}) {
  const count = openModules(value).length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-micro text-muted-foreground">
          {ar
            ? `${count} قسم مفتوح. الأقسام المغلقة لا تظهر له نهائياً.`
            : `${count} module${count === 1 ? "" : "s"} open. Modules left Off don't appear for them at all.`}
        </p>
        {!disabled && (
          <button type="button" onClick={() => onChange({})} className="text-micro px-2 py-1 rounded-md hover:bg-muted text-muted-foreground shrink-0">
            {ar ? "إغلاق الكل" : "All off"}
          </button>
        )}
      </div>
      <div className="rounded-xl border border-border divide-y divide-border/70 bg-card">
        {MODULES.map((m) => {
          const actions = (value[m.key] ?? []) as PermissionAction[];
          const lvl = levelOf(m.key, actions);
          const precise = lvl !== "off" && !isStandard(m.key, actions);
          return (
            <div key={m.key} className={`flex items-center gap-3 px-3 py-2.5 ${lvl === "off" ? "" : "bg-primary/[0.06]"}`}>
              <div className="min-w-0 flex-1">
                <p className={`text-caption font-semibold ${lvl === "off" ? "text-foreground/60" : "text-foreground"}`}>{ar ? m.ar : m.en}</p>
                <p className="text-micro text-muted-foreground truncate">
                  {precise
                    ? `${ar ? "بالضبط: " : "Exactly: "}${actions.map((a) => (ar ? PERMISSION_LABELS[a]?.ar : PERMISSION_LABELS[a]?.en) ?? a).join(" · ")}`
                    : (ar ? m.opensAr : m.opens)}
                </p>
              </div>
              <div role="radiogroup" aria-label={ar ? m.ar : m.en} className="flex shrink-0 rounded-lg border border-border overflow-hidden">
                {LEVELS.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    role="radio"
                    aria-checked={lvl === l.id}
                    disabled={disabled}
                    onClick={() => onChange(setLevel(value, m.key, l.id))}
                    className={`h-7 px-2 text-micro font-medium transition-colors disabled:cursor-not-allowed ${
                      lvl === l.id
                        ? l.id === "off" ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-muted/60"
                    }`}
                  >
                    {ar ? l.ar : l.en}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-micro text-muted-foreground">
        {ar
          ? "عرض = يفتح ويقرأ. تعديل = يضيف ويصحح بدون حذف أو اعتماد. كامل = كل شيء بما فيه الحذف والاعتماد. الرئيسية والإعدادات الشخصية مفتوحة للجميع."
          : "View = open and read. Edit = add and correct, no deleting or approving. Full = everything, including delete and approve. Everyone keeps the home page and their own profile & password settings."}
      </p>
    </div>
  );
}
