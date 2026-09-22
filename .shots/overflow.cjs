/**
 * Mobile + overflow audit for the tile-reveal sequence.
 * Checks document scrollWidth against the viewport at several widths.
 */
const puppeteer = require("puppeteer-core");
const path = require("path");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const URL = "http://localhost:3210";
const OUT = path.resolve(__dirname);

const VIEWPORTS = [
  { name: "375", w: 375, h: 812 },
  { name: "390", w: 390, h: 844 },
  { name: "430", w: 430, h: 932 },
  { name: "768", w: 768, h: 1024 },
  { name: "1024", w: 1024, h: 768 },
  { name: "1280", w: 1280, h: 800 },
  { name: "1440", w: 1440, h: 900 },
  { name: "1920", w: 1920, h: 1080 },
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--disable-gpu", "--hide-scrollbars"],
  });

  const report = [];

  for (const v of VIEWPORTS) {
    const page = await browser.newPage();
    await page.setViewport({ width: v.w, height: v.h, deviceScaleFactor: 1 });
    await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 45000 });
    await new Promise((r) => setTimeout(r, 1200));

    // Scroll through the whole page and record the worst overflow seen.
    const data = await page.evaluate(async () => {
      const max = document.documentElement.scrollHeight;
      let worst = 0;
      let worstAt = 0;
      const step = Math.max(200, window.innerHeight * 0.8);
      for (let y = 0; y <= max; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 60)));
        const sw = document.documentElement.scrollWidth;
        if (sw > worst) {
          worst = sw;
          worstAt = y;
        }
      }
      window.scrollTo(0, 0);
      return {
        scrollWidth: worst,
        viewportWidth: window.innerWidth,
        worstAt,
        docHeight: max,
      };
    });

    const overflow = data.scrollWidth - data.viewportWidth;
    report.push({ vp: v.name, overflow, at: data.worstAt, height: data.docHeight });

    // Capture the tile-reveal headline on this viewport.
    await page.evaluate(() => {
      const el = document.querySelector("#ecosystem");
      if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + 350);
    });
    await new Promise((r) => setTimeout(r, 900));
    await page.screenshot({ path: path.join(OUT, `ov-${v.name}.png`) });

    await page.close();
  }

  console.log("viewport | overflow(px) | atY | docHeight");
  for (const r of report) {
    const flag = r.overflow > 1 ? "  <-- OVERFLOW" : "";
    console.log(`${r.vp.padEnd(8)} | ${String(r.overflow).padStart(11)} | ${String(r.at).padStart(5)} | ${r.height}${flag}`);
  }

  await browser.close();
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
