// Contrast check for the colour tokens and the pastel palette in src/index.css.
// Run: node scripts/check-contrast.mjs
import fs from "node:fs";

const css = fs.readFileSync("src/index.css", "utf8");
const root = css.slice(css.indexOf(":root {"), css.indexOf(".dark {"));

const tok = (n) => {
  const m = root.match(new RegExp(`--${n}:\\s*([\\d.]+) ([\\d.]+)% ([\\d.]+)%`));
  if (!m) throw new Error(`token --${n} not found`);
  return m.slice(1).map(Number);
};
const hsl2rgb = ([h, s, l]) => {
  s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)];
};
const oklch2rgb = (l, c, h) => {
  h *= Math.PI / 180;
  const a = c * Math.cos(h), b = c * Math.sin(h);
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;
  const [L, M, S] = [l_ ** 3, m_ ** 3, s_ ** 3];
  return [
    4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S,
    -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S,
    -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S,
  ].map((v) => { v = Math.min(1, Math.max(0, v)); return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055; });
};
const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = (rgb) => 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

let fails = 0;
const report = (label, r, min = 4.5) => {
  const ok = r >= min;
  if (!ok) fails++;
  console.log(`${ok ? "ok  " : "FAIL"} ${r.toFixed(2)}  ${label}`);
};

console.log("── tokens (text on surface, need 4.5) ──");
for (const [a, b] of [
  ["foreground", "background"], ["foreground", "card"], ["foreground", "secondary"],
  ["muted-foreground", "background"], ["muted-foreground", "sidebar"], ["muted-foreground", "card"],
  ["brand-ink", "background"], ["brand-ink", "brand-wash"], ["brand-ink", "sidebar"],
  ["primary-foreground", "primary"], ["primary-foreground", "brand"],
  ["destructive", "background"], ["success", "background"], ["warning", "background"],
]) report(`${a} on ${b}`, ratio(hsl2rgb(tok(a)), hsl2rgb(tok(b))));

console.log("── pastel palette (badges: ink on tint) ──");
const pal = {};
for (const m of css.matchAll(/--color-(\w+)-(\d+): oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)/g))
  pal[`${m[1]}-${m[2]}`] = oklch2rgb(+m[3], +m[4], +m[5]);
const white = [1, 1, 1];
let worst = { r: 99 };
for (const hue of [...new Set(Object.keys(pal).map((k) => k.split("-")[0]))]) {
  for (const [t, b] of [["600", "50"], ["600", "100"], ["700", "100"], ["700", "200"], ["900", "500"]]) {
    const r = ratio(pal[`${hue}-${t}`], pal[`${hue}-${b}`]);
    if (r < worst.r) worst = { r, label: `${hue}-${t} on ${hue}-${b}` };
  }
  const rw = ratio(pal[`${hue}-600`], white);
  if (rw < worst.r) worst = { r: rw, label: `${hue}-600 on white` };
}
report(`worst pair: ${worst.label}`, worst.r);
process.exit(fails ? 1 : 0);
