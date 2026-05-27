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
