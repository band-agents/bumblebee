/**
 * RolesMultiSelect — give one person one or more ready-made roles.
 * The first role is their main role (shown on their badge); access is the
 * combination of all of them. Owner and Admin already open everything, so
 * picking either replaces the others.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { ROLE_GROUPS, ROLE_TEMPLATES } from "../lib/permissions";

const FULL = ["owner", "admin"];

export function RolesMultiSelect({ value, onChange, ar, disabled, allowOwner, allowAdmin, allowEmpty }: {
  value: string[];
  onChange: (roles: string[]) => void;
  ar: boolean;
  disabled?: boolean;
  allowOwner?: boolean;
  allowAdmin?: boolean;
  /** Let the last role be removed (the create form starts with none). */
  allowEmpty?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const available = useMemo(() => ROLE_TEMPLATES.filter((t) =>
    value.includes(t.id) || ((t.id !== "owner" || allowOwner) && (t.id !== "admin" || allowAdmin))), [value, allowOwner, allowAdmin]);

  const term = q.trim().toLowerCase();
  const matches = (t: (typeof ROLE_TEMPLATES)[number]) =>
    !term || `${t.en} ${t.ar} ${t.description}`.toLowerCase().includes(term);

  function toggle(id: string) {
    if (value.includes(id)) {
      const next = value.filter((r) => r !== id);
      onChange(next.length || allowEmpty ? next : value); // a saved login always keeps at least one role
      return;
    }
    if (FULL.includes(id)) { onChange([id]); return; }
    onChange([...value.filter((r) => !FULL.includes(r)), id]);
  }

  const label = (id: string) => { const t = ROLE_TEMPLATES.find((x) => x.id === id); return t ? (ar ? t.ar : t.en) : id; };

  return (
    <div ref={box} className="relative">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-expanded={open}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={(e) => { if (!disabled && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); setOpen((o) => !o); } }}
        className={`min-h-10 w-full flex flex-wrap items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border/60 bg-background text-body ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-border"}`}
      >
        {value.length === 0 && <span className="text-body text-muted-foreground px-1">{ar ? "اختر دوراً أو أكثر…" : "Choose one or more roles…"}</span>}
        {value.map((id, i) => (
          <span key={id} className={`inline-flex items-center gap-1 h-7 ps-2.5 pe-1.5 rounded-lg text-caption font-medium ${i === 0 ? "bg-primary/60 text-foreground" : "bg-muted text-foreground"}`}>
            {label(id)}
            {i === 0 && value.length > 1 && <span className="text-[10px] text-foreground/60">{ar ? "رئيسي" : "main"}</span>}
            {!disabled && (value.length > 1 || allowEmpty) && (
              <button type="button" aria-label={ar ? "إزالة" : `Remove ${label(id)}`}
                onClick={(e) => { e.stopPropagation(); toggle(id); }}
                className="w-5 h-5 rounded-md grid place-items-center hover:bg-foreground/10"><X size={11} /></button>
            )}
          </span>
        ))}
        <span className="ms-auto flex items-center gap-1 text-micro text-muted-foreground ps-1">
          {!disabled && (ar ? "إضافة دور" : "Add role")}
          <ChevronDown size={14} className={open ? "rotate-180" : ""} />
        </span>
      </div>

      {open && (
        <div className="mt-1.5 w-full max-h-[380px] overflow-hidden rounded-xl border border-border bg-card shadow-lg flex flex-col">
          <label className="flex items-center gap-2 px-3 h-10 border-b border-border">
            <Search size={14} className="text-muted-foreground" />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={ar ? "ابحث عن دور…" : "Search roles…"}
              className="flex-1 bg-transparent outline-none text-caption" />
          </label>
          <div className="overflow-y-auto py-1">
            {ROLE_GROUPS.map((g) => {
              const roles = available.filter((t) => t.group === g.id && matches(t));
              if (!roles.length) return null;
              return (
                <div key={g.id} className="py-1">
                  <p className="px-3 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">{ar ? g.ar : g.en}</p>
                  {roles.map((t) => {
                    const on = value.includes(t.id);
                    return (
                      <button key={t.id} type="button" onClick={() => toggle(t.id)}
                        className={`w-full text-start px-3 py-2 flex items-start gap-2.5 hover:bg-brand-wash ${on ? "bg-primary/10" : ""}`}>
                        <span className={`mt-0.5 w-4 h-4 shrink-0 rounded border grid place-items-center ${on ? "bg-primary border-primary" : "border-border bg-background"}`}>
                          {on && <Check size={11} strokeWidth={3} />}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-caption font-semibold">{ar ? t.ar : t.en}</span>
                          <span className="block text-micro text-muted-foreground">{ar ? t.descriptionAr : t.description}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
          <p className="px-3 py-2 border-t border-border text-micro text-muted-foreground">
            {ar ? "يمكن اختيار أكثر من دور — تُجمع صلاحياتها. الأول هو الدور الرئيسي." : "Pick as many roles as the person needs — their access is combined. The first is the main role."}
          </p>
        </div>
      )}
    </div>
  );
}
