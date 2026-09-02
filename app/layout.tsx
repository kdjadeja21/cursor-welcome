import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next"
import { Inter } from "next/font/google";
import "./globals.css";

import { DEFAULT_THEME, THEMES } from "./themes";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Community Welcome Screen",
  description:
    "Configurable animated welcome screen for community events and workshops",
  icons: {
    icon: { url: THEMES[DEFAULT_THEME].favicon, type: "image/svg+xml" },
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme={DEFAULT_THEME}
      className={`${inter.variable} min-h-full antialiased`}
    >
      <Analytics />
      <body className="min-h-full min-h-dvh flex flex-col">{children}</body>
    </html>
  );
}
