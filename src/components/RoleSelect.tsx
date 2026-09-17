/** Role dropdown grouped by department, with the role's description. */

import { ROLE_GROUPS, ROLE_TEMPLATES } from "../lib/permissions";

export function RoleSelect({ value, onChange, ar, disabled, allowOwner, allowAdmin, className }: {
  value: string;
  onChange: (role: string) => void;
  ar: boolean;
  disabled?: boolean;
  allowOwner?: boolean;
  allowAdmin?: boolean;
  className?: string;
}) {
  const allowed = ROLE_TEMPLATES.filter((t) =>
    t.id === value || ((t.id !== "owner" || allowOwner) && (t.id !== "admin" || allowAdmin)));
  return (
    <select value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} className={className}>
      {ROLE_GROUPS.map((g) => {
        const roles = allowed.filter((t) => t.group === g.id);
        if (!roles.length) return null;
        return (
          <optgroup key={g.id} label={ar ? g.ar : g.en}>
            {roles.map((t) => <option key={t.id} value={t.id}>{ar ? t.ar : t.en} — {ar ? t.descriptionAr : t.description}</option>)}
          </optgroup>
        );
      })}
    </select>
  );
}
