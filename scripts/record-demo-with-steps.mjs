import { chromium } from "playwright";
import { mkdir, rename } from "fs/promises";

const OUTPUT_DIR = "/opt/cursor/artifacts/videos";
const FINAL_WEBM = "/opt/cursor/artifacts/videos/cursor-welcome-demo.webm";
const FINAL_MP4 = "/opt/cursor/artifacts/videos/cursor-welcome-demo.mp4";

async function showStep(page, stepNum, title, subtitle = "") {
  await page.evaluate(
    ({ stepNum, title, subtitle }) => {
      let overlay = document.getElementById("demo-step-overlay");
      if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "demo-step-overlay";
        overlay.style.cssText = `
          position: fixed;
          top: 20px;
          left: 20px;
          z-index: 99999;
          background: rgba(20, 18, 11, 0.92);
          border: 1px solid rgba(245, 78, 0, 0.35);
          border-radius: 10px;
          padding: 12px 16px;
          width: min(300px, calc(100vw - 220px));
          text-align: left;
          font-family: ui-sans-serif, system-ui, sans-serif;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
          pointer-events: none;
        `;
        document.body.appendChild(overlay);
      }

      overlay.innerHTML = `
        <div style="color: #f54e00; font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 6px;">
          Step ${stepNum}
        </div>
        <div style="color: #edecec; font-size: 14px; font-weight: 600; line-height: 1.3; margin-bottom: ${subtitle ? "4px" : "0"};">
          ${title}
        </div>
        ${
          subtitle
            ? `<div style="color: rgba(237, 236, 236, 0.62); font-size: 12px; line-height: 1.35;">${subtitle}</div>`
            : ""
        }
      `;
    },
    { stepNum, title, subtitle },
  );
}

async function hideStep(page) {
  await page.evaluate(() => {
    document.getElementById("demo-step-overlay")?.remove();
  });
}

await mkdir(OUTPUT_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: {
    dir: OUTPUT_DIR,
    size: { width: 1280, height: 720 },
  },
});

const page = await context.newPage();

try {
  await page.addInitScript(() => {
    localStorage.removeItem("cursor-welcome-config");
  });

  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

  await showStep(
    page,
    1,
    "Open the welcome screen",
    "Run npm run dev, then visit http://localhost:3000 in your browser",
  );
  await page.waitForTimeout(2500);

  await showStep(
    page,
    2,
    "Watch the welcome animation",
    "Logo, brand, title, date, and sponsors animate in automatically",
  );
  await page.waitForTimeout(7500);

  await showStep(
    page,
    3,
    "Click Edit to customize",
    "Use the Edit button (top-right) or press E on your keyboard",
  );
  await page.waitForTimeout(1800);
  await page.getByRole("button", { name: "Edit" }).click();
  await page.waitForTimeout(600);

  await showStep(
    page,
    4,
    "Update your event details",
    "Change brand, title, date, replay interval, and add up to 5 sponsors",
  );
  await page.waitForTimeout(1200);
  await page.getByPlaceholder("Cursor Ahmedabad").fill("Cursor San Francisco");
  await page
    .getByPlaceholder("Welcome to the Cursor Community Workshop")
    .fill("Welcome to the Cursor Community Meetup");
  await page.getByRole("button", { name: "Add Sponsor" }).click();
  await page.getByPlaceholder("Title (e.g. Gold Sponsor)").fill("Hosted by");
  await page.getByPlaceholder("Name (e.g. Acme Corp)").fill("Cursor Team");
  await page.waitForTimeout(2800);

  await showStep(
    page,
    5,
    "Close the editor",
    "Changes apply live and are saved automatically in your browser",
  );
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.waitForTimeout(5500);

  await showStep(
    page,
    6,
    "Enter presentation mode",
    "Click Preview (or press F / P) for a fullscreen display on projectors and TVs",
  );
  await page.waitForTimeout(1800);
  await page.getByRole("button", { name: "Preview" }).click();
  await page.waitForTimeout(3500);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(800);

  await showStep(
    page,
    7,
    "Share your configuration",
    "Click Share to copy a link — open it on another device to load the same setup",
  );
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: "Share" }).click();
  await page.waitForTimeout(2500);

  await showStep(
    page,
    8,
    "Reset anytime",
    "Open Edit → Reset to defaults to clear saved settings and start over",
  );
  await page.waitForTimeout(3000);
} finally {
  const video = page.video();
  await page.close();
  await context.close();
  await browser.close();

  if (video) {
    const tempPath = await video.path();
    await rename(tempPath, FINAL_WEBM);
    console.log(`Demo saved to ${FINAL_WEBM}`);
  }
}
