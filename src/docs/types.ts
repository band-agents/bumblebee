/**
 * Documentation model — one source for the /docs website and the PDF.
 *
 * Inline text supports **bold**, `code` and [links](/docs/slug).
 * Every section may carry one screenshot (public/docs/shots/<shot>.jpg);
 * the web page and the PDF both lay text on the left, the visual on the right.
 */

export type Block =
  | { t: "p"; text: string }
  | { t: "steps"; items: string[] }
  | { t: "list"; items: string[] }
  | { t: "note"; tone: "tip" | "warn" | "info"; text: string }
  | { t: "table"; head: string[]; rows: string[][] };

export interface Section {
  id: string;
  heading: string;
  blocks: Block[];
  shot?: string;
  caption?: string;
}

export type CategoryId =
  | "start" | "sales" | "production" | "stock" | "finance" | "documents" | "people" | "admin" | "preview";

export interface Category {
  id: CategoryId;
  title: string;
  blurb: string;
  icon: string; // lucide icon name, resolved in the page
}

export interface Article {
  slug: string;
  category: CategoryId;
  title: string;
  summary: string;
  status?: "live" | "preview";
  sections: Section[];
  related?: string[];
}

export interface Issue {
  slug: string;
  area: string;
  symptom: string;
  message?: string; // the exact text the user sees, when there is one
  cause: string;
  fix: string[];
  link?: string;
}

export interface Faq {
  group: string;
  q: string;
  a: string;
}
