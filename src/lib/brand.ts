/**
 * Bumblebee — single source of truth for the product's identity.
 *
 * Anywhere the app needs to say its own name, build a storage key, name an
 * export, or stamp a code, it comes from here. The previous identity (THOTH)
 * was 311 scattered string literals across 79 files, which is why renaming it
 * was a project rather than an edit. Do not reintroduce bare literals.
 *
 * The one thing NOT renamed: the `thoth_id` / `thoth_table` columns on
 * `shopify_entity_map` are live Postgres columns with an index. They need a
 * SQL migration, not a rename here. See supabase/shopify-sync-expansion.sql.
 */

export const BRAND = {
  /** Display name, English. */
  name: "Bumblebee",
  /** Display name, Arabic. */
  nameAr: "بامبلبي",

  /** The AI assistant's name. Bee-native, short, says what it is. */
  assistant: "Buzz",
  assistantAr: "باز",

  /** Prefix for localStorage keys — `bumblebee_onboarding`, etc. */
  storagePrefix: "bumblebee_",
  /** Prefix for generated CSV/XLSX downloads — `bumblebee-invoices-2026.csv`. */
  exportPrefix: "bumblebee-",
  /** Prefix for generated customer-facing codes — `BEE-LM00-X4Y5Z6`. */
  codePrefix: "BEE",
  /** Console prefix, so logs are greppable. */
  logPrefix: "[Bumblebee]",
} as const;

/** `storageKey("onboarding")` -> `"bumblebee_onboarding"` */
export function storageKey(name: string): string {
  return `${BRAND.storagePrefix}${name}`;
}

/** `exportName("invoices")` -> `"bumblebee-invoices-2026-08-29"` */
export function exportName(entity: string, date = new Date()): string {
  return `${BRAND.exportPrefix}${entity}-${date.toISOString().slice(0, 10)}`;
}

/**
 * Keys that existed under the old identity. Values people already have in
 * their browser must survive the rename — losing someone's saved reports
 * because the brand changed is not an acceptable trade.
 */
const LEGACY_KEYS = [
  "onboarding",
  "pending_invite",
  "saved_reports",
  "shopify_integration",
  "shopify_kit",
  "loyalty",
  "recent_pages",
  "command_history",
  "studio_search_recent",
  "quotation_templates",
  "code_settings",
  "code_counters",
  "loadtest",
] as const;

/**
 * One-time copy of `thoth_*` localStorage values onto their `bumblebee_*`
 * names. Idempotent, and never overwrites a value that already exists under
 * the new key. Call once at boot, before anything reads storage.
 */
export function migrateLegacyStorage(): void {
  let storage: Storage;
  try {
    storage = window.localStorage;
  } catch {
    return; // private mode / storage blocked — nothing to migrate
  }

  for (const name of LEGACY_KEYS) {
    const from = `thoth_${name}`;
    const to = `${BRAND.storagePrefix}${name}`;
    try {
      if (storage.getItem(to) !== null) continue; // already migrated
      const value = storage.getItem(from);
      if (value === null) continue;
      storage.setItem(to, value);
      storage.removeItem(from);
    } catch {
      // Quota or serialization trouble on one key must not block the rest.
    }
  }
}
