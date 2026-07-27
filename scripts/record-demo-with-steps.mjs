import { chromium } from "playwright";
import { mkdir, rename } from "fs/promises";

const OUTPUT_DIR = "/opt/cursor/artifacts/videos";
const FINAL_WEBM = "/opt/cursor/artifacts/videos/cursor-welcome-demo.webm";

async function injectDemoStyles(page) {
  await page.evaluate(() => {
    if (document.getElementById("demo-highlight-styles")) return;

    const style = document.createElement("style");
    style.id = "demo-highlight-styles";
    style.textContent = `
      @keyframes demo-pulse-ring {
        0%, 100% { box-shadow: 0 0 0 2px rgba(245, 78, 0, 0.85), 0 0 14px rgba(245, 78, 0, 0.35); }
        50% { box-shadow: 0 0 0 5px rgba(245, 78, 0, 0.55), 0 0 22px rgba(245, 78, 0, 0.5); }
      }
      @keyframes demo-click-ripple {
        0% { transform: translate(-50%, -50%) scale(0.35); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
      }
      @keyframes demo-pointer-bob {
        0%, 100% { transform: translate(-4px, -4px) rotate(-8deg); }
        50% { transform: translate(0, 0) rotate(-8deg); }
      }
      @keyframes demo-arrow-pulse {
        0%, 100% { opacity: 0.85; }
        50% { opacity: 1; }
      }
      .demo-highlight-ring {
        position: fixed;
        border: 2px solid #f54e00;
        border-radius: 10px;
        animation: demo-pulse-ring 1.1s ease-in-out infinite;
        pointer-events: none;
        z-index: 99998;
        box-sizing: border-box;
      }
      .demo-pointer {
        position: fixed;
        width: 32px;
        height: 32px;
        z-index: 100001;
        pointer-events: none;
        transform: rotate(-8deg);
        filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.55));
        animation: demo-pointer-bob 0.9s ease-in-out infinite;
      }
      .demo-click-ripple {
        position: fixed;
        width: 44px;
        height: 44px;
        border: 3px solid #f54e00;
        border-radius: 50%;
        animation: demo-click-ripple 0.45s ease-out forwards;
        pointer-events: none;
        z-index: 100000;
      }
      #demo-highlights svg {
        position: fixed;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 99997;
        overflow: visible;
      }
      #demo-highlights .demo-arrow-line {
        stroke: #f54e00;
        stroke-width: 3;
        fill: none;
        stroke-linecap: round;
        animation: demo-arrow-pulse 1.1s ease-in-out infinite;
      }
      #demo-highlights .demo-arrow-head {
        fill: #f54e00;
        animation: demo-arrow-pulse 1.1s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
  });
}

async function clearHighlights(page) {
  await page.evaluate(() => {
    document.getElementById("demo-highlights")?.remove();
    document.querySelectorAll(".demo-pointer, .demo-click-ripple").forEach((node) => {
      node.remove();
    });
  });
}

async function highlightElement(page, locator, options = {}) {
  const box = await locator.boundingBox();
  if (!box) return null;

  await injectDemoStyles(page);

  const payload = {
    x: box.x,
    y: box.y,
    w: box.width,
    h: box.height,
    from: options.from ?? "auto",
  };

  await page.evaluate(({ x, y, w, h, from }) => {
    document.getElementById("demo-highlights")?.remove();

    const container = document.createElement("div");
    container.id = "demo-highlights";

    const ring = document.createElement("div");
    ring.className = "demo-highlight-ring";
    ring.style.left = `${x - 5}px`;
    ring.style.top = `${y - 5}px`;
    ring.style.width = `${w + 10}px`;
    ring.style.height = `${h + 10}px`;
    container.appendChild(ring);

    const cx = x + w / 2;
    const cy = y + h / 2;
    const margin = 18;

    let startX;
    let startY;

    if (from === "left") {
      startX = x - 90;
      startY = cy;
    } else if (from === "right") {
      startX = x + w + 90;
      startY = cy;
    } else if (from === "top") {
      startX = cx;
      startY = y - 70;
    } else if (from === "bottom") {
      startX = cx;
      startY = y + h + 70;
    } else {
      const spaceLeft = x;
      const spaceRight = window.innerWidth - (x + w);
      const spaceTop = y;
      const spaceBottom = window.innerHeight - (y + h);

      if (spaceLeft >= spaceRight && spaceLeft >= spaceTop && spaceLeft >= spaceBottom) {
        startX = x - 90;
        startY = cy;
      } else if (spaceRight >= spaceTop && spaceRight >= spaceBottom) {
        startX = x + w + 90;
        startY = cy;
      } else if (spaceTop >= spaceBottom) {
        startX = cx;
        startY = y - 70;
      } else {
        startX = cx;
        startY = y + h + 70;
      }
    }

    const dx = cx - startX;
    const dy = cy - startY;
    const length = Math.hypot(dx, dy) || 1;
    const tipX = cx - (dx / length) * margin;
    const tipY = cy - (dy / length) * margin;
    const angle = Math.atan2(tipY - startY, tipX - startX);
    const headLength = 14;
    const headAngle = Math.PI / 7;

    const leftX = tipX - headLength * Math.cos(angle - headAngle);
    const leftY = tipY - headLength * Math.sin(angle - headAngle);
    const rightX = tipX - headLength * Math.cos(angle + headAngle);
    const rightY = tipY - headLength * Math.sin(angle + headAngle);

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.innerHTML = `
      <line class="demo-arrow-line" x1="${startX}" y1="${startY}" x2="${tipX}" y2="${tipY}" />
      <polygon class="demo-arrow-head" points="${tipX},${tipY} ${leftX},${leftY} ${rightX},${rightY}" />
    `;
    container.appendChild(svg);
    document.body.appendChild(container);
  }, payload);

  return box;
}

async function movePointer(page, x, y, animate = true) {
  await injectDemoStyles(page);

  await page.evaluate(
    ({ x, y, animate }) => {
      let pointer = document.getElementById("demo-pointer");
      if (!pointer) {
        pointer = document.createElement("div");
        pointer.id = "demo-pointer";
        pointer.className = "demo-pointer";
        pointer.innerHTML = `
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 2 L4 26 L11 19 L16 28 L20 26 L15 17 L26 17 Z" fill="#ffffff" stroke="#14120b" stroke-width="1.5" stroke-linejoin="round"/>
          </svg>
        `;
        document.body.appendChild(pointer);
      }

      pointer.style.transition = animate ? "left 0.55s ease-out, top 0.55s ease-out" : "none";
      pointer.style.left = `${x - 4}px`;
      pointer.style.top = `${y - 2}px`;
    },
    { x, y, animate },
  );
}

async function showClickRipple(page, x, y) {
  await page.evaluate(({ x, y }) => {
    const ripple = document.createElement("div");
    ripple.className = "demo-click-ripple";
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    document.body.appendChild(ripple);
    window.setTimeout(() => ripple.remove(), 500);
  }, { x, y });
}

async function demoClick(page, locator, options = {}) {
  const box = await highlightElement(page, locator, options);
  if (!box) {
    await locator.click();
    return;
  }

  const startX = 180;
  const startY = 420;
  const targetX = box.x + box.width / 2;
  const targetY = box.y + box.height / 2;

  await movePointer(page, startX, startY, false);
  await page.waitForTimeout(150);
  await movePointer(page, targetX, targetY, true);
  await page.waitForTimeout(650);
  await showClickRipple(page, targetX, targetY);
  await page.waitForTimeout(250);
  await locator.click();
  await page.waitForTimeout(350);
  await clearHighlights(page);
}

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
  await highlightElement(page, page.locator(".welcome-logo-wrap"), { from: "left" });
  await page.waitForTimeout(2500);
  await highlightElement(page, page.locator(".welcome-heading"), { from: "bottom" });
  await page.waitForTimeout(2500);
  await clearHighlights(page);
  await page.waitForTimeout(2500);

  await showStep(
    page,
    3,
    "Click Edit to customize",
    "Use the Edit button (top-right) or press E on your keyboard",
  );
  await page.waitForTimeout(1200);
  await demoClick(page, page.getByRole("button", { name: "Edit" }), { from: "left" });

  await showStep(
    page,
    4,
    "Update your event details",
    "Change brand, title, date, replay interval, and add up to 5 sponsors",
  );
  await page.waitForTimeout(800);

  const brandInput = page.getByPlaceholder("Cursor Ahmedabad");
  await highlightElement(page, brandInput, { from: "left" });
  await page.waitForTimeout(900);
  await brandInput.fill("Cursor San Francisco");
  await page.waitForTimeout(700);

  const titleInput = page.getByPlaceholder("Welcome to the Cursor Community Workshop");
  await highlightElement(page, titleInput, { from: "left" });
  await page.waitForTimeout(900);
  await titleInput.fill("Welcome to the Cursor Community Meetup");
  await page.waitForTimeout(700);

  const addSponsorButton = page.getByRole("button", { name: "Add Sponsor" });
  await demoClick(page, addSponsorButton, { from: "left" });

  const sponsorTitleInput = page.getByPlaceholder("Title (e.g. Gold Sponsor)");
  await highlightElement(page, sponsorTitleInput, { from: "left" });
  await page.waitForTimeout(700);
  await sponsorTitleInput.fill("Hosted by");

  const sponsorNameInput = page.getByPlaceholder("Name (e.g. Acme Corp)");
  await highlightElement(page, sponsorNameInput, { from: "left" });
  await page.waitForTimeout(700);
  await sponsorNameInput.fill("Cursor Team");
  await clearHighlights(page);
  await page.waitForTimeout(1200);

  await showStep(
    page,
    5,
    "Close the editor",
    "Changes apply live and are saved automatically in your browser",
  );
  await page.waitForTimeout(900);
  await demoClick(page, page.getByRole("button", { name: "Close", exact: true }), {
    from: "left",
  });
  await page.waitForTimeout(5500);

  await showStep(
    page,
    6,
    "Enter presentation mode",
    "Click Preview (or press F / P) for a fullscreen display on projectors and TVs",
  );
  await page.waitForTimeout(1200);
  await demoClick(page, page.getByRole("button", { name: "Preview" }), { from: "left" });
  await page.waitForTimeout(3200);
  await page.keyboard.press("Escape");
  await clearHighlights(page);
  await page.waitForTimeout(900);

  await showStep(
    page,
    7,
    "Share your configuration",
    "Click Share to copy a link — open it on another device to load the same setup",
  );
  await page.waitForTimeout(1200);
  await demoClick(page, page.getByRole("button", { name: "Share" }), { from: "left" });
  await page.waitForTimeout(2200);

  await showStep(
    page,
    8,
    "Reset anytime",
    "Open Edit → Reset to defaults to clear saved settings and start over",
  );
  await page.waitForTimeout(1200);
  await demoClick(page, page.getByRole("button", { name: "Edit" }), { from: "left" });
  await page.waitForTimeout(800);
  const resetButton = page.getByRole("button", { name: "Reset to defaults" });
  await highlightElement(page, resetButton, { from: "left" });
  await page.waitForTimeout(2800);
  await clearHighlights(page);
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
