// Needs puppeteer-core and the demo dev server on :5176 (npx vite --port 5176).
// Run from a folder where puppeteer-core is installed, e.g.:
//   npm i puppeteer-core --prefix .tmp && NODE_PATH=.tmp/node_modules node scripts/docs/capture-shots.cjs
// Captures every screen used by the Bumblebee docs (web + PDF) from the running demo.
// Usage: node docshots.cjs [name ...]   (no names = all)
const puppeteer = require("puppeteer-core");
const fs = require("fs");
const OUT = require("path").join(__dirname, "../../public/docs/shots");
const BASE = "http://127.0.0.1:5176";
fs.mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function clickText(page, text, { nth = 0, selector = "button, a, [role=tab]" } = {}) {
  const ok = await page.evaluate((text, nth, selector) => {
    const els = [...document.querySelectorAll(selector)].filter((e) => {
      const t = (e.innerText || e.getAttribute("aria-label") || "").trim();
      const r = e.getBoundingClientRect();
      return t.includes(text) && r.width > 0 && r.height > 0;
    });
    const el = els[nth];
    if (!el) return false;
    el.scrollIntoView({ block: "center" });
    el.click();
    return true;
  }, text, nth, selector);
  if (!ok) throw new Error(`no clickable "${text}"`);
  await sleep(900);
}

const S = (name, route, opts = {}) => ({ name, route, ...opts });
const SHOTS = [
  S("landing", "/welcome"),
  S("login", "https://bumblebee-cubs.vercel.app/auth", { external: true }),
  S("dashboard", "/"),
  S("today", "/today"),
  S("command-bar", "/", { act: async (p) => { await p.keyboard.down("Control"); await p.keyboard.press("k"); await p.keyboard.up("Control"); await sleep(700); await p.keyboard.type("hoodie"); await sleep(900); } }),
  S("arabic", "/", { lang: "ar" }),
  S("buzz", "/", { act: async (p) => clickText(p, "Ask Buzz") }),
  S("products", "/products"),
  S("product-new", "/products", { act: async (p) => clickText(p, "New Product") }),
  S("product-detail", "/products/prd-01"),
  S("inventory", "/inventory"),
  S("fabrics", "/inventory/fabrics"),
  S("materials", "/inventory/materials"),
  S("equipment", "/inventory/equipment"),
  S("purchasing", "/purchasing"),
  S("purchase-requests", "/purchasing", { act: async (p) => clickText(p, "Requests (") }),
  S("purchase-orders", "/purchasing", { act: async (p) => clickText(p, "Orders (") }),
  S("purchase-order-new", "/purchasing", { act: async (p) => {
    await clickText(p, "New PO");
    await p.type('input[placeholder="e.g. Winter season fabrics"]', "Imported fleece for joggers");
    await p.select("select", "vendor-01");
    await p.type('input[placeholder="e.g. French terry 320gsm"]', "Brushed Fleece 280gsm — Navy");
    const nums = await p.$$('input[type="number"]');
    await nums[1].click({ clickCount: 3 }); await nums[1].type("650");
    await nums[2].click({ clickCount: 3 }); await nums[2].type("104");
    await p.type('input[placeholder="e.g. 30 days"]', "30% advance, 70% on arrival");
    await sleep(400);
  } }),
  S("receive-goods", "/purchasing", { act: async (p) => { await clickText(p, "Orders ("); await clickText(p, "Receive"); } }),
  S("quotations", "/quotations"),
  S("quotation-new", "/quotations", { act: async (p) => clickText(p, "New Quotation") }),
  S("sales-orders", "/orders"),
  S("sales-order-new", "/orders", { act: async (p) => clickText(p, "New Order") }),
  S("invoice-create", "/orders", { act: async (p) => { await clickText(p, "Create invoice"); await clickText(p, "Part / deposit"); } }),
  S("finance-invoices", "/finance/invoices"),
  S("payment-record", "/finance/invoices", { act: async (p) => clickText(p, "Record payment") }),
  S("finance-receipts", "/finance/invoices", { act: async (p) => clickText(p, "Receipts") }),
  S("production", "/production"),
  S("production-exec", "/production/exec"),
  S("production-planning", "/production/planning"),
  S("production-order-new", "/production/planning", { act: async (p) => clickText(p, "New Order") }),
  S("production-order-detail", "/production/planning", { act: async (p) => clickText(p, "Explorer Zip Hoodie", { selector: "button" }) }),
  S("quality", "/quality"),
  S("delivery", "/delivery"),
  S("designs", "/designs"),
  S("site-visits", "/site-visits"),
  S("pos", "/pos"),
  S("branches", "/branches"),
  S("users", "/users"),
  S("users-create", "/users", { act: async (p) => clickText(p, "Create login") }),
  S("team", "/team"),
  S("hr-employees", "/hr/employees"),
  S("settings", "/settings"),
  S("settings-company", "/settings", { act: async (p) => clickText(p, "Company") }),
  S("reports", "/reports"),
  S("analytics", "/analytics"),
  S("data", "/data"),
  S("activity", "/activity"),
  S("work", "/work"),
  // preview modules
  S("crm", "/crm"),
  S("finance-dashboard", "/finance/dashboard"),
  S("hr-dashboard", "/hr/dashboard"),
  S("loyalty", "/loyalty"),
  S("shopify", "/shopify/integration"),
  S("mobile-apps", "/mobile-apps"),
  S("intelligence", "/intelligence"),
  // printed documents (A4 pages)
  S("print-quotation", "/print/quotation/qt-02", { print: true }),
  S("print-sales-order", "/print/sales_order/so-01", { print: true }),
  S("print-purchase-order", "/print/purchase_order/po-p02", { print: true }),
  S("print-grn", "/print/goods_receipt/po-p02?grn=GRN-2026-00014", { print: true }),
  S("print-invoice", "/print/invoice/inv-002", { print: true }),
  S("print-production-order", "/print/production_order/po-01", { print: true }),
];

(async () => {
  const only = process.argv.slice(2);
  const browser = await puppeteer.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: "new", args: ["--hide-scrollbars", "--disable-gpu"],
  });
  const failed = [];
  for (const s of SHOTS) {
    if (only.length && !only.includes(s.name)) continue;
    const page = await browser.newPage();
    try {
      await page.setViewport(s.print ? { width: 900, height: 1250, deviceScaleFactor: 1.4 } : { width: 1440, height: 900, deviceScaleFactor: 1 });
      await page.evaluateOnNewDocument((lang) => {
        try { localStorage.setItem("bumblebee_language", lang); } catch {}
      }, s.lang || "en");
      await page.goto(s.external ? s.route : BASE + s.route, { waitUntil: "networkidle0", timeout: 60000 });
      await page.waitForFunction(() => (document.body.innerText || "").trim().length > 80, { timeout: 30000 }).catch(() => {});
      await sleep(1800);
      if (s.act) await s.act(page);
      await sleep(900);
      if (s.print) {
        await page.addStyleTag({ content: ".no-print{display:none!important} body{background:#fff!important}" });
        const clip = await page.evaluate(() => {
          const sheet = document.querySelector(".sheet");
          const r = sheet.getBoundingClientRect();
          let bottom = r.top;
          for (const c of sheet.children) {
            if (getComputedStyle(c).position === "absolute") continue;
            bottom = Math.max(bottom, c.getBoundingClientRect().bottom);
          }
          return { x: r.left, y: r.top + window.scrollY, width: r.width, height: Math.min(r.height, bottom - r.top + 50) };
        });
        await page.screenshot({ path: `${OUT}/${s.name}.jpg`, type: "jpeg", quality: 85, clip });
      } else {
        await page.screenshot({ path: `${OUT}/${s.name}.jpg`, type: "jpeg", quality: 82 });
      }
      console.log("ok  ", s.name);
    } catch (e) {
      failed.push(s.name);
      console.log("FAIL", s.name, e.message);
    } finally {
      await page.close();
    }
  }
  await browser.close();
  console.log("failed:", failed.join(", ") || "none");
})();
