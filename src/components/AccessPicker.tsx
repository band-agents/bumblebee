/**
 * AccessPicker — choose exactly which modules a person can open.
 *
 * Each module is Off, View only, or Can work (every action the module has).
 * What's picked here is saved as the member's custom access and REPLACES
 * their role template: modules left Off don't appear for them at all, and the
 * database blocks their data too (supabase/access-control-v2.sql).
 */

import { MODULES, fullActions, type PermissionAction, type PermissionMap } from "../lib/permissions";

export type Level = "off" | "view" | "full";

export function levelOf(actions: PermissionAction[] | undefined): Level {
  if (!actions || actions.length === 0 || !actions.includes("view")) return "off";
  return actions.some((a) => a !== "view" && a !== "export") ? "full" : "view";
}

export function setLevel(map: PermissionMap, moduleKey: string, level: Level): PermissionMap {
  const next = { ...map };
  if (level === "off") delete next[moduleKey];
  else if (level === "view") next[moduleKey] = ["view"];
  else next[moduleKey] = fullActions(moduleKey);
  return next;
}

/** Modules with any access, in picker order. */
export function openModules(map: PermissionMap): string[] {
  return MODULES.filter((m) => levelOf(map[m.key]) !== "off").map((m) => m.key);
}

export function AccessPicker({ value, onChange, ar, disabled }: {
  value: PermissionMap;
  onChange: (next: PermissionMap) => void;
  ar: boolean;
  disabled?: boolean;
}) {
  const count = openModules(value).length;
  const levels: { id: Level; en: string; ar: string }[] = [
    { id: "off", en: "Off", ar: "مغلق" },
    { id: "view", en: "View", ar: "عرض" },
    { id: "full", en: "Work", ar: "عمل" },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-micro text-muted-foreground">
          {ar
            ? `${count} قسم مفتوح. الأقسام المغلقة لا تظهر له نهائياً.`
            : `${count} module${count === 1 ? "" : "s"} open. Modules left Off don't appear for them at all.`}
        </p>
        {!disabled && (
          <div className="flex gap-1 shrink-0">
            <button type="button" onClick={() => onChange({})} className="text-micro px-2 py-1 rounded-md hover:bg-muted text-muted-foreground">
              {ar ? "إغلاق الكل" : "All off"}
            </button>
          </div>
        )}
      </div>
      <div className="rounded-xl border border-border divide-y divide-border/70 bg-card">
        {MODULES.map((m) => {
          const lvl = levelOf(value[m.key]);
          return (
            <div key={m.key} className={`flex items-center gap-3 px-3 py-2.5 ${lvl === "off" ? "" : "bg-primary/[0.06]"}`}>
              <div className="min-w-0 flex-1">
                <p className={`text-caption font-semibold ${lvl === "off" ? "text-foreground/60" : "text-foreground"}`}>{ar ? m.ar : m.en}</p>
                <p className="text-micro text-muted-foreground truncate">{ar ? m.opensAr : m.opens}</p>
              </div>
              <div role="radiogroup" aria-label={ar ? m.ar : m.en} className="flex shrink-0 rounded-lg border border-border overflow-hidden">
                {levels.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    role="radio"
                    aria-checked={lvl === l.id}
                    disabled={disabled}
                    onClick={() => onChange(setLevel(value, m.key, l.id))}
                    className={`h-7 px-2.5 text-micro font-medium transition-colors disabled:cursor-not-allowed ${
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
          ? "عرض = يفتح القسم ويقرأ فقط. عمل = يضيف ويعدل ويعتمد داخل القسم. الرئيسية وإعداداته الشخصية مفتوحة للجميع."
          : "View = can open and read. Work = can also add, edit and approve there. Everyone keeps the home page and their own profile & password settings."}
      </p>
    </div>
  );
}
