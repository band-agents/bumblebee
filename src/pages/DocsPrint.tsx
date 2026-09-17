/**
 * /docs/print — the whole Help Center laid out for the PDF (A4 landscape).
 * Text on the left, the screenshot on the right, one section per block.
 * scripts/docs/build-docs-pdf.cjs loads this page in headless Chrome and prints it.
 */

import { useEffect } from "react";
import { CATEGORIES, ARTICLES } from "../docs/articles";
import { ISSUES, FAQS } from "../docs/support";
import { Blocks, Inline, shotSrc } from "../docs/render";
import { Logo } from "../components/Logo";
import { CLIENT } from "../lib/brand";

const CSS = `
@page { size: A4 landscape; margin: 13mm 14mm 15mm; }
html, body { background: #fff !important; }
.dp { color: #221d16; font-size: 9.1pt; line-height: 1.45; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.dp h1, .dp h2, .dp h3 { font-family: var(--app-font-serif); color: #1c170f; }
.dp .page { break-after: page; }
.dp .avoid { break-inside: avoid; }
.dp img { max-width: 100%; }
.dp ol.space-y-2 > * + * { margin-top: 0.3rem; }
@media screen { .dp { max-width: 297mm; margin: 0 auto; padding: 12mm; } }
`;

function SectionRow({ heading, blocks, shot, caption }: { heading: string; blocks: Parameters<typeof Blocks>[0]["blocks"]; shot?: string; caption?: string }) {
  if (!shot) {
    return (
      <div className="mb-6">
        <h3 className="text-[12.5pt] mb-2 avoid" style={{ breakAfter: "avoid" }}>{heading}</h3>
        <div className="max-w-[200mm]"><Blocks blocks={blocks} compact plainLinks /></div>
      </div>
    );
  }
  const tall = shot.startsWith("print-");
  return (
    <div className="avoid mb-[6mm] grid gap-[8mm] items-start" style={{ gridTemplateColumns: tall ? "1.3fr 1fr" : "1.05fr 1fr" }}>
      <div className="min-w-0">
        <h3 className="text-[12.5pt] mb-2">{heading}</h3>
        <Blocks blocks={blocks} compact plainLinks />
      </div>
      <figure className="m-0">
        <img src={shotSrc(shot)} alt={caption ?? ""} className="block w-full rounded-[7px] border border-[#e4ddcf]"
          style={{ boxShadow: "0 6px 18px -10px rgba(40,30,10,.35)", maxHeight: tall ? "120mm" : "82mm", objectFit: "contain", objectPosition: "top", background: "#fff" }} />
        {caption && <figcaption className="mt-1 text-[7.8pt] text-[#7a7163] text-center">{caption}</figcaption>}
      </figure>
    </div>
  );
}

export default function DocsPrint() {
  useEffect(() => {
    document.title = "Bumblebee — User Guide";
    // Tell the PDF builder when every image has loaded.
    const imgs = [...document.images];
    Promise.all(imgs.map((i) => (i.complete ? Promise.resolve() : new Promise((r) => { i.onload = i.onerror = r; }))))
      .then(() => document.fonts?.ready)
      .then(() => { document.body.dataset.docsReady = "1"; });
  }, []);

  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const issueAreas = [...new Set(ISSUES.map((i) => i.area))];
  const faqGroups = [...new Set(FAQS.map((f) => f.group))];
  let chapter = 0;

  return (
    <div className="dp" dir="ltr">
      <style>{CSS}</style>

      {/* ── Cover ── */}
      <section className="page relative" style={{ height: "178mm" }}>
        <div className="absolute inset-0 rounded-[10mm] overflow-hidden" style={{ background: "linear-gradient(135deg, #fbf3d6 0%, #fffaf0 55%, #f2ecff 100%)" }} />
        <div className="relative h-full grid grid-cols-[1fr_1.15fr] gap-[10mm] items-center px-[14mm]">
          <div>
            <div className="flex items-center gap-4 mb-[14mm]">
              <Logo variant="full" size={30} />
              <span className="text-[20pt] text-[#b9ae9a]">×</span>
              <img src={CLIENT.logo} alt="CUBS" style={{ width: 60, height: 60, objectFit: "contain" }} />
            </div>
            <p className="text-[10pt] font-semibold uppercase tracking-[0.18em] text-[#8a7d62]">User guide & reference</p>
            <h1 className="text-[40pt] leading-[1.02] mt-3">Bumblebee<br />documentation</h1>
            <p className="mt-5 text-[12.5pt] text-[#51493b] max-w-[120mm] leading-relaxed">
              Every screen, every workflow, every error message — with screenshots. Prepared for {CLIENT.name}.
            </p>
            <div className="mt-[12mm] text-[9.5pt] text-[#7a7163] space-y-0.5">
              <p>{ARTICLES.length} guides · {ISSUES.length} troubleshooting entries · {FAQS.length} questions answered</p>
              <p>Edition of {today} · bumblebee-cubs.vercel.app/docs</p>
            </div>
          </div>
          <img src={shotSrc("dashboard")} alt="" className="w-full rounded-[8px] border border-[#e4ddcf]" style={{ boxShadow: "0 24px 50px -24px rgba(40,30,10,.45)" }} />
        </div>
      </section>

      {/* ── Contents ── */}
      <section className="page">
        <h2 className="text-[22pt] mb-4">Contents</h2>
        <div className="mb-5 rounded-[4mm] border border-[#e4ddcf] bg-[#fbf7ec] px-5 py-3 text-[9pt] text-[#51493b] avoid">
          <p><b className="text-[#221d16]">How to read this guide. </b>Each page puts the explanation on the left and the matching screen on the right. <b>Bold words</b> are buttons, fields and menu names exactly as they appear in Bumblebee. Modules marked <b>Preview</b> show sample data and don't save changes yet. The same guide is online at bumblebee-cubs.vercel.app/docs, where you can search it.</p>
        </div>
        <div className="columns-4 gap-[8mm] text-[9pt]">
          {CATEGORIES.map((c) => {
            chapter++;
            return (
              <div key={c.id} className="avoid mb-3.5">
                <p className="font-semibold text-[10pt] mb-1"><span className="text-[#b19a4f] me-1.5">{chapter}.</span>{c.title}</p>
                <ul className="space-y-0.5 ps-5 text-[#51493b]">
                  {ARTICLES.filter((a) => a.category === c.id).map((a) => <li key={a.slug}>{a.title}</li>)}
                </ul>
              </div>
            );
          })}
          <div className="avoid mb-3.5">
            <p className="font-semibold text-[10pt] mb-1"><span className="text-[#b19a4f] me-1.5">{CATEGORIES.length + 1}.</span>Troubleshooting</p>
            <ul className="space-y-0.5 ps-5 text-[#51493b]">{issueAreas.map((a) => <li key={a}>{a}</li>)}</ul>
          </div>
          <div className="avoid mb-3.5">
            <p className="font-semibold text-[10pt] mb-1"><span className="text-[#b19a4f] me-1.5">{CATEGORIES.length + 2}.</span>Frequently asked questions</p>
            <ul className="space-y-0.5 ps-5 text-[#51493b]">{faqGroups.map((g) => <li key={g}>{g}</li>)}</ul>
          </div>
        </div>

      </section>

      {/* ── Chapters ── */}
      {CATEGORIES.map((c, ci) => (
        <div key={c.id}>
          {ARTICLES.filter((a) => a.category === c.id).map((a, ai) => (
            <section key={a.slug} className="page">
              <div className="flex items-baseline justify-between border-b-2 border-[#221d16] pb-2 mb-5 avoid">
                <div>
                  <p className="text-[8.5pt] font-semibold uppercase tracking-[0.16em] text-[#8a7d62]">{ci + 1}. {c.title}{ai === 0 ? "" : ""}</p>
                  <h2 className="text-[21pt] leading-tight mt-0.5">
                    {a.title}
                    {a.status === "preview" && <span className="ms-3 align-middle text-[8.5pt] font-sans font-semibold rounded-full px-2 py-0.5 bg-[#ede5ff] text-[#5b3fb0]">Preview</span>}
                  </h2>
                </div>
              </div>
              <p className="text-[11pt] text-[#51493b] mb-6 max-w-[220mm] avoid"><Inline text={a.summary} plainLinks /></p>
              {a.sections.map((s) => <SectionRow key={s.id} heading={s.heading} blocks={s.blocks} shot={s.shot} caption={s.caption} />)}
            </section>
          ))}
        </div>
      ))}

      {/* ── Troubleshooting ── */}
      <section className="page">
        <div className="border-b-2 border-[#221d16] pb-2 mb-5">
          <p className="text-[8.5pt] font-semibold uppercase tracking-[0.16em] text-[#8a7d62]">{CATEGORIES.length + 1}. Troubleshooting</p>
          <h2 className="text-[21pt] leading-tight mt-0.5">When something doesn't work</h2>
        </div>
        <p className="text-[11pt] text-[#51493b] mb-6 max-w-[220mm]">Find the message you see (shown in quotes) or the symptom. Each entry gives the cause and the fix.</p>
        {issueAreas.map((area) => (
          <div key={area} className="mb-4">
            <h3 className="text-[13pt] mb-2.5" style={{ breakAfter: "avoid" }}>{area}</h3>
            <div className="grid grid-cols-2 gap-x-[8mm] gap-y-3">
              {ISSUES.filter((i) => i.area === area).map((i) => (
                <div key={i.slug} className="avoid rounded-[3mm] border border-[#e4ddcf] px-3.5 py-2.5">
                  <p className="font-semibold text-[10.2pt]">{i.symptom}</p>
                  {i.message && <p className="mt-1 font-mono text-[8.4pt] text-[#9b2c2c] bg-[#fdf0ef] rounded px-1.5 py-0.5 inline-block">“{i.message}”</p>}
                  <p className="mt-1.5 text-[9.2pt] text-[#51493b]"><b className="text-[#221d16]">Why: </b>{i.cause}</p>
                  <ol className="mt-1 text-[9.2pt] text-[#51493b] space-y-0.5">
                    {i.fix.map((f, n) => <li key={n}><b className="text-[#221d16]">{i.fix.length > 1 ? `${n + 1}. ` : "Fix: "}</b>{f}</li>)}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ── FAQ ── */}
      <section>
        <div className="border-b-2 border-[#221d16] pb-2 mb-5">
          <p className="text-[8.5pt] font-semibold uppercase tracking-[0.16em] text-[#8a7d62]">{CATEGORIES.length + 2}. FAQ</p>
          <h2 className="text-[21pt] leading-tight mt-0.5">Frequently asked questions</h2>
        </div>
        <div className="columns-2 gap-[10mm]">
          {faqGroups.map((g) => (
            <div key={g} className="mb-4">
              <h3 className="text-[13pt] mb-2" style={{ breakAfter: "avoid" }}>{g}</h3>
              {FAQS.filter((f) => f.group === g).map((f) => (
                <div key={f.q} className="avoid mb-2.5">
                  <p className="font-semibold text-[10pt]">{f.q}</p>
                  <p className="text-[9.4pt] text-[#51493b] leading-snug mt-0.5"><Inline text={f.a} plainLinks /></p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
