# Cursor Community — Welcome Screen

A configurable animated welcome screen for Cursor community events and workshops. Built with Next.js, React, and Tailwind CSS.

## Features

- Animated welcome display with the Cursor logo, heading, brand name, and live date
- Floating particle background effect
- Sidebar editor to customize all content without touching code — changes persist via `localStorage`
- Up to 5 sponsor entries (title + name each)
- Auto date or a fixed custom date
- Configurable animation replay interval (5–60 seconds)
- Fullscreen / presentation mode

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `E` | Open the editor sidebar |
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

## How to Use (Step by Step)

Follow these steps to set up and run the welcome screen at your event.

### 1. Launch the app

1. Install dependencies (first time only): `npm install`
2. Start the dev server: `npm run dev`
3. Open [http://localhost:3000](http://localhost:3000) in your browser

For a production build, run `npm run build` and then `npm run start`.

### 2. Watch the welcome animation

When the page loads, the welcome screen plays automatically:

- The Cursor logo animates in and lights up
- Your **brand** name appears (e.g. "Cursor Ahmedabad")
- The **title** heading reveals word by word
- The **date** fades in below the heading
- Any **sponsors** you have configured appear at the bottom

If **Auto replay** is enabled (default), the animation replays on the interval you set (5–60 seconds).

### 3. Customize your content

1. Click **Edit** in the top-right corner, or press `E`
2. In the sidebar, update the fields you need:
   - **Brand** — your community or chapter name
   - **Title** — the main heading shown on screen
   - **Date** — leave **Use today** checked for the live date, or uncheck it and pick a fixed date
   - **Interval Time** — adjust how often the animation replays (5–60 s), or turn off **Auto replay** to play it once
   - **Additional Details** — click **Add Sponsor** to add up to 5 entries (each with a title and name, e.g. "Gold Sponsor" / "Acme Corp")
3. Changes apply live as you type — close the sidebar when you are done

All settings are saved automatically in your browser (`localStorage`) and restored the next time you visit.

### 4. Enter presentation mode

When you are ready to show the screen to your audience:

1. Click **Preview** in the top-right corner, or press `F` or `P`
2. The welcome screen goes fullscreen — the Edit, Preview, Share buttons and footer are hidden
3. Press `Esc` to exit fullscreen

Use this mode on a projector, TV, or shared screen during your workshop or meetup.

### 5. Share your configuration

To send your exact setup to a teammate or another device:

1. Click **Share** in the top-right corner
2. The link is copied to your clipboard (the button briefly shows **Copied!**)
3. Paste the link in a chat or open it on another browser — the same brand, title, date, interval, and sponsors load automatically

### 6. Reset to defaults

To clear all customizations and start over:

1. Open the editor (**Edit** or `E`)
2. Scroll to the bottom of the sidebar
3. Click **Reset to defaults** and confirm

This clears saved settings and restores the original welcome content.

## Customization

Click **Edit** (top-right) or press `E` to open the sidebar and update:

- **Brand** — community or chapter name (e.g. "Cursor Ahmedabad")
- **Title** — the main heading displayed on screen
- **Date** — use today's date automatically or set a custom one
- **Interval** — how often the entry animation replays (5–60 s)
- **Additional Details** — add up to 5 sponsor entries, each with a title and name

All settings are saved to `localStorage` and restored on the next visit. Use **Reset to defaults** in the sidebar to clear them.

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router)
- [React 19](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- TypeScript

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
