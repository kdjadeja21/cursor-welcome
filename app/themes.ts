export type HomeThemeId = "spacexai" | "cursor";
export type ThemeId = HomeThemeId | "grokbot";

/**
 * What the welcome stage renders. Always a static mark — the Rive file is
 * reserved for the one-time loading overlay.
 */
export type ThemeLogo =
  | { kind: "image"; src: string; alt: string }
  | { kind: "path"; d: string; viewBox: string; alt: string }
  | { kind: "face"; fill: string; alt: string };

/** A one-time Rive intro played before the welcome stage appears. */
export interface ThemeIntro {
  src: string;
  artboard: string;
  stateMachine: string;
  alt: string;
}

export interface Theme {
  id: ThemeId;
  label: string;
  brand: string;
  heading: string;
  favicon: string;
  logo: ThemeLogo;
  intro?: ThemeIntro;
}

const CURSOR_LOGO_PATH =
  "m466.383 137.073-206.469-119.2034c-6.63-3.8287-14.811-3.8287-21.441 0l-206.4586 119.2034c-5.5734 3.218-9.0144 9.169-9.0144 15.615v240.375c0 6.436 3.441 12.397 9.0144 15.615l206.4686 119.203c6.63 3.829 14.811 3.829 21.441 0l206.468-119.203c5.574-3.218 9.015-9.17 9.015-15.615v-240.375c0-6.436-3.441-12.397-9.015-15.615zm-12.969 25.25-199.316 345.223c-1.347 2.326-4.904 1.376-4.904-1.319v-226.048c0-4.517-2.414-8.695-6.33-10.963l-195.7577-113.019c-2.3263-1.347-1.3764-4.905 1.3182-4.905h398.6305c5.661 0 9.199 6.136 6.368 11.041h-.009z";

export const THEMES: Record<ThemeId, Theme> = {
  spacexai: {
    id: "spacexai",
    label: "SpaceXAI",
    brand: "SpaceXAI Ahmedabad",
    heading: "Welcome to the SpaceXAI Community Workshop",
    favicon: "/brand/spacexai/favicon.svg",
    logo: {
      kind: "image",
      src: "/brand/spacexai/wordmark-white.svg",
      alt: "SpaceXAI",
    },
    intro: {
      src: "/brand/spacexai/spacexai-dark.riv",
      artboard: "SPACE X WEB",
      stateMachine: "SPACE X WEB",
      alt: "SpaceXAI",
    },
  },
  cursor: {
    id: "cursor",
    label: "Cursor",
    brand: "Cursor Ahmedabad",
    heading: "Welcome to the Cursor Community Workshop",
    favicon: "/brand/cursor/logo.svg",
    logo: {
      kind: "path",
      d: CURSOR_LOGO_PATH,
      viewBox: "0 0 476 530",
      alt: "Cursor logo",
    },
  },
  grokbot: {
    id: "grokbot",
    label: "Grok Bot",
    brand: "Grok Bot",
    heading: "Welcome",
    favicon: "/brand/grokbot/favicon.svg",
    logo: {
      kind: "face",
      fill: "#0a0a0a",
      alt: "Grok Bot",
    },
  },
};

export const DEFAULT_THEME: HomeThemeId = "spacexai";

export function isHomeThemeId(value: unknown): value is HomeThemeId {
  return value === "spacexai" || value === "cursor";
}

export function isThemeId(value: unknown): value is ThemeId {
  return isHomeThemeId(value) || value === "grokbot";
}
