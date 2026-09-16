// One-off codemod for the pastel palette: text stays on readable inks, white text
// on pastel fills becomes the hue's deep ink, and saturated chart hexes go pastel.
import fs from "node:fs";
import path from "node:path";
const H = "red|rose|pink|fuchsia|purple|violet|indigo|blue|sky|cyan|teal|emerald|green|lime|yellow|amber|orange";
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : /\.(tsx|ts)$/.test(e.name) ? [path.join(d, e.name)] : []);
const HEX = {
  "10b981": "#6FC39E", "059669": "#5DAE8B", "22c55e": "#7CCB9A", "16a34a": "#6FB88C", "14b8a6": "#7CC9BF",
  "f59e0b": "#EFC274", "d97706": "#E3B066", "eab308": "#EDD07A",
  "3b82f6": "#8AB0EA", "2563eb": "#7FA3E0", "0ea5e9": "#85C1E6", "06b6d4": "#84CCDA",
  "ef4444": "#EE9E9E", "dc2626": "#E39292", "e11d48": "#E99AAE", "f43f5e": "#EEA2B3",
  "ec4899": "#EFA3C6", "8b5cf6": "#B6A0EA", "7c3aed": "#AA94E3", "a855f7": "#C3A2EC", "6366f1": "#A3A9EE",
  "f97316": "#F2AE82", "e07a5f": "#EDA994",
};
const textRe = new RegExp(String.raw`(^|[\s"'\x60:])text-(${H})-(400|500)(?=[\s"'\x60/]|$)`, "gm");
const bgRe = new RegExp(String.raw`(?:^|[\s"'\x60:])bg-(${H})-(300|400|500)(?=[\s"'\x60/]|$)`);
let files = 0, t = 0, w = 0, x = 0;
for (const f of walk("src")) {
  if (/Logo\.tsx$|main\.tsx$/.test(f)) continue;
  const o = fs.readFileSync(f, "utf8");
  let s = o.replace(textRe, (_m, pre, h) => (t++, `${pre}text-${h}-600`));
  // white text sitting on a pastel fill in the same string literal
  s = s.replace(/(["'\x60])((?:(?!\1)[^\n])*)\1/g, (lit, q, body) => {
    const m = body.match(bgRe);
    if (!m || !/(^|\s)text-white(\s|$)/.test(body)) return lit;
    w++;
    return q + body.replace(/(^|\s)text-white(?=\s|$)/g, `$1text-${m[1]}-900`) + q;
  });
  s = s.replace(/#([0-9a-fA-F]{6})\b/g, (m, h) => HEX[h.toLowerCase()] ? (x++, HEX[h.toLowerCase()]) : m);
  if (s !== o) { fs.writeFileSync(f, s); files++; }
}
console.log({ files, textInk: t, whiteOnPastel: w, hex: x });
