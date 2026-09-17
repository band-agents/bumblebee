/** Shared rendering for docs content — used by the website and the PDF page. */

import { Fragment } from "react";
import { Link } from "wouter";
import { Info, Lightbulb, TriangleAlert } from "lucide-react";
import type { Block } from "./types";

/** **bold**, `code`, [text](href) */
export function Inline({ text, plainLinks = false }: { text: string; plainLinks?: boolean }) {
  const parts: React.ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|`(.+?)`|\[(.+?)\]\((.+?)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1]) parts.push(<strong key={k++} className="font-semibold text-foreground">{m[1]}</strong>);
    else if (m[2]) parts.push(<code key={k++} className="font-mono text-[0.88em] px-1.5 py-0.5 rounded-md bg-muted/70 text-foreground">{m[2]}</code>);
    else if (m[3]) {
      const href = m[4];
      parts.push(plainLinks
        ? <span key={k++} className="font-medium text-foreground underline decoration-primary decoration-2 underline-offset-2">{m[3]}</span>
        : href.startsWith("/")
          ? <Link key={k++} href={href} className="font-medium text-foreground underline decoration-primary decoration-2 underline-offset-2 hover:decoration-foreground">{m[3]}</Link>
          : <a key={k++} href={href} className="font-medium underline">{m[3]}</a>);
    }
    last = re.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts.map((p, i) => <Fragment key={i}>{p}</Fragment>)}</>;
}

const NOTE = {
  tip: { icon: Lightbulb, cls: "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-100", label: "Tip" },
  warn: { icon: TriangleAlert, cls: "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-100", label: "Important" },
  info: { icon: Info, cls: "bg-sky-50 border-sky-200 text-sky-900 dark:bg-sky-500/10 dark:border-sky-500/30 dark:text-sky-100", label: "Good to know" },
} as const;

export function Blocks({ blocks, compact = false, plainLinks = false }: { blocks: Block[]; compact?: boolean; plainLinks?: boolean }) {
  const gap = compact ? "space-y-2.5" : "space-y-4";
  return (
    <div className={gap}>
      {blocks.map((b, i) => {
        switch (b.t) {
          case "p":
            return <p key={i} className="leading-relaxed text-foreground/85"><Inline text={b.text} plainLinks={plainLinks} /></p>;
          case "list":
            return (
              <ul key={i} className="space-y-1.5">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-2.5 leading-relaxed text-foreground/85">
                    <span aria-hidden className="mt-[0.6em] w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span><Inline text={it} plainLinks={plainLinks} /></span>
                  </li>
                ))}
              </ul>
            );
          case "steps":
            return (
              <ol key={i} className="space-y-2">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-3 leading-relaxed text-foreground/85">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-primary/70 text-foreground text-[12px] font-bold grid place-items-center mt-[0.1em]">{j + 1}</span>
                    <span><Inline text={it} plainLinks={plainLinks} /></span>
                  </li>
                ))}
              </ol>
            );
          case "note": {
            const n = NOTE[b.tone];
            const Icon = n.icon;
            return (
              <div key={i} className={`flex gap-3 rounded-xl border px-4 py-3 ${n.cls}`}>
                <Icon size={17} className="shrink-0 mt-0.5" />
                <p className="leading-relaxed"><span className="font-semibold">{n.label}: </span><Inline text={b.text} plainLinks={plainLinks} /></p>
              </div>
            );
          }
          case "table":
            return (
              <div key={i} className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-[0.92em] border-collapse">
                  <thead>
                    <tr className="bg-muted/60">
                      {b.head.map((h) => <th key={h} className="text-start font-semibold px-3 py-2 border-b border-border whitespace-nowrap">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((r, j) => (
                      <tr key={j} className="border-b border-border/60 last:border-0 align-top">
                        {r.map((c, x) => <td key={x} className={`px-3 py-2 leading-snug ${x === 0 ? "font-medium text-foreground" : "text-foreground/80"}`}><Inline text={c} plainLinks={plainLinks} /></td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
        }
      })}
    </div>
  );
}

/** Plain text of blocks, for search. */
export function blocksText(blocks: Block[]): string {
  return blocks.map((b) => {
    if (b.t === "p" || b.t === "note") return b.text;
    if (b.t === "list" || b.t === "steps") return b.items.join(" ");
    return [...b.head, ...b.rows.flat()].join(" ");
  }).join(" ").replace(/\*\*|`|\[|\]\([^)]*\)/g, "");
}

export const shotSrc = (name: string) => `/docs/shots/${name}.jpg`;
