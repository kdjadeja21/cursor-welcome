import type { Metadata, Viewport } from "next";

import { WelcomeApp } from "../welcome-app";

export const metadata: Metadata = {
  title: "Grok Bot Welcome Screen",
  description:
    "Configurable Grok Bot welcome screen for community events and workshops",
  icons: {
    icon: { url: "/brand/grokbot/favicon.svg", type: "image/svg+xml" },
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function GrokBotPage() {
  return (
    <WelcomeApp
      lockedTheme="grokbot"
      storageKey="cursor-welcome-config-grokbot-v2"
      defaultBotAvatars
    />
  );
}
