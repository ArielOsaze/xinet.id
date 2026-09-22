/**
 * Visual audit: screenshots the tile-reveal sequence at real scroll positions.
 * Uses the installed Chrome (puppeteer-core, no bundled download).
 */
const puppeteer = require("puppeteer-core");
const path = require("path");

const CHROME =
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const URL = "http://localhost:3210";
const OUT = path.resolve(__dirname);

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--disable-gpu", "--hide-scrollbars"],
  });

  const shots = [
    { name: "seq-0-top", w: 1440, h: 900, scroll: 0 },
    // The reveal container is 100svh + 160svh tall, starting right after the hero.
    { name: "seq-1-flyin", w: 1440, h: 900, anchor: "#ecosystem", offset: 400 },
    { name: "seq-2-zoom", w: 1440, h: 900, anchor: "#ecosystem", offset: 900 },
    { name: "seq-3-clear", w: 1440, h: 900, anchor: "#ecosystem", offset: 1500 },
    { name: "seq-4-done", w: 1440, h: 900, anchor: "#ecosystem", offset: 2000 },
    { name: "products-1", w: 1440, h: 900, anchor: "#products", offset: 0 },
    { name: "products-2", w: 1440, h: 900, anchor: "#products", offset: 700 },
    { name: "m-375-hero", w: 375, h: 812, scroll: 0 },
    { name: "m-390-hero", w: 390, h: 844, scroll: 0 },
    { name: "m-390-eco", w: 390, h: 844, anchor: "#ecosystem", offset: 300 },
    { name: "t-768-eco", w: 768, h: 1024, anchor: "#ecosystem", offset: 500 },
    { name: "d-1920-hero", w: 1920, h: 1080, scroll: 0 },
  ];

  for (const s of shots) {
    const page = await browser.newPage();
    await page.setViewport({ width: s.w, height: s.h, deviceScaleFactor: 1 });
    await page.goto(URL, { waitUntil: "networkidle2", timeout: 60000 });

    if (s.anchor) {
      await page.evaluate(
        (anchor, offset) => {
          const el = document.querySelector(anchor);
          if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + offset);
        },
        s.anchor,
        s.offset || 0
      );
    } else {
      await page.evaluate((y) => window.scrollTo(0, y), s.scroll || 0);
    }

    // Let the rAF loop settle on the new scroll position.
    await new Promise((r) => setTimeout(r, 900));
    await page.screenshot({ path: path.join(OUT, `${s.name}.png`) });
    console.log("shot:", s.name, `${s.w}x${s.h}`);
    await page.close();
  }

  await browser.close();
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
