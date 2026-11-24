import localFont from "next/font/local";

/* Self-hosted, preloaded and size-adjusted to avoid layout shift. */
export const serif = localFont({
  src: [
    { path: "../../public/fonts/cormorant-garamond-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/cormorant-garamond-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/cormorant-garamond-latin-400-italic.woff2", weight: "400", style: "italic" },
    { path: "../../public/fonts/cormorant-garamond-latin-500-italic.woff2", weight: "500", style: "italic" },
  ],
  variable: "--font-cormorant",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

export const sans = localFont({
  src: "../../public/fonts/manrope-latin-wght-normal.woff2",
  weight: "200 800",
  variable: "--font-manrope",
  display: "swap",
  fallback: ["system-ui", "Segoe UI", "sans-serif"],
});

export const label = localFont({
  src: "../../public/fonts/inter-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-inter",
  display: "swap",
  preload: false,
  fallback: ["system-ui", "sans-serif"],
});
