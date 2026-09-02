# Community Welcome Screen

A configurable animated welcome screen for community events and workshops, with **SpaceXAI branding by default** and a one-click toggle back to the classic Cursor look. Built with Next.js, React, Rive, and Tailwind CSS.

## Features

- Two branding themes: SpaceXAI (default, monochrome, Rive-animated logo) and Cursor (orange accent, animated SVG mark)
- Animated welcome display with the brand logo, heading, brand name, and live date
- Floating particle background effect
- Sidebar editor to customize all content without touching code — changes persist via `localStorage`
- Up to 5 sponsor entries (title + name each)
- Auto date or a fixed custom date
- Configurable animation replay interval (5–60 seconds)
- Fullscreen / presentation mode

## Branding toggle

The **SpaceXAI branding** switch sits at the top of the editor sidebar and is **on by default**. Turning it off restores the original Cursor welcome screen — palette, logo, and default copy.

Switching themes only rewrites the Brand and Title fields while they still hold the other theme's default text, so anything you typed yourself is preserved. The active theme is saved to `localStorage` and travels with **Share** links.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `E` | Open the editor sidebar |
| `T` | Toggle between SpaceXAI and Cursor branding |
| `F` or `P` | Toggle fullscreen / presentation mode |
| `Esc` | Close the sidebar or exit fullscreen |

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Customization

Click **Edit** (top-right) or press `E` to open the sidebar and update:

- **SpaceXAI branding** — switch between the SpaceXAI and Cursor themes
- **Brand** — community or chapter name (e.g. "SpaceXAI Ahmedabad")
- **Title** — the main heading displayed on screen
- **Date** — use today's date automatically or set a custom one
- **Interval** — how often the entry animation replays (5–60 s)
- **Additional Details** — add up to 5 sponsor entries, each with a title and name

All settings are saved to `localStorage` and restored on the next visit. Use **Reset to defaults** in the sidebar to clear them.

## Brand assets

The SpaceXAI files under `public/brand/spacexai/` are copied verbatim from the official brand asset kit — only the filenames were simplified. Per the [SpaceXAI brand guidelines](https://x.ai/legal/brand-guidelines), the logo is used exactly as provided: no recolouring, cropping, or glow effects are applied to it, and the chapter name is kept clear of the mark so the two never read as a single new logo. Do not edit these files.

The logo animation is the supplied `spacexai-dark.riv`, played with the Rive web runtime. If the runtime cannot load, or the visitor prefers reduced motion, the static `symbol-white.svg` is shown instead.

Theme definitions (copy, favicon, logo) live in [`app/themes.ts`](app/themes.ts).

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router)
- [React 19](https://react.dev)
- [Rive](https://rive.app) (`@rive-app/react-canvas`)
- [Tailwind CSS v4](https://tailwindcss.com)
- TypeScript

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
