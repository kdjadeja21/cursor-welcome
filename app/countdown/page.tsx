import type { Metadata, Viewport } from "next";

import { CountdownScene } from "./countdown-scene";
import "./countdown.css";

export const metadata: Metadata = {
  title: "Grok Bot Galaxy",
  description: "Grok Bot Galaxy workshop countdown",
  icons: {
    icon: { url: "/brand/grokbot/favicon.svg", type: "image/svg+xml" },
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function CountdownPage() {
  return <CountdownScene />;
}
