// Needs puppeteer-core and the demo dev server on :5176. Writes public/docs/Bumblebee-Documentation.pdf.
//   NODE_PATH=.tmp/node_modules node scripts/docs/build-docs-pdf.cjs
// Prints /docs/print to a PDF (A4 landscape) with page numbers.
const puppeteer = require("puppeteer-core");
const fs = require("fs");
const OUT = require("path").join(__dirname, "../../public/docs/Bumblebee-Documentation.pdf");

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: "new", args: ["--disable-gpu"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1000 });
  await page.goto("http://127.0.0.1:5176/docs/print", { waitUntil: "networkidle0", timeout: 120000 });
  await page.waitForFunction(() => document.body.dataset.docsReady === "1", { timeout: 120000 });
  await page.emulateMediaType("print");
  await new Promise((r) => setTimeout(r, 1500));
  await page.pdf({
    path: OUT,
    format: "A4",
    landscape: true,
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: true,
    headerTemplate: "<span></span>",
    footerTemplate: `<div style="width:100%;font-size:7.5px;color:#9a917f;padding:0 14mm;display:flex;justify-content:space-between;font-family:Arial,sans-serif">
      <span>Bumblebee documentation · CUBS</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
    margin: { top: "13mm", bottom: "15mm", left: "14mm", right: "14mm" },
  });
  await browser.close();
  const kb = Math.round(fs.statSync(OUT).size / 1024);
  console.log("PDF written", OUT, kb + " KB");
})().catch((e) => { console.error(e); process.exit(1); });
