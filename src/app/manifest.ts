import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Newton House Alumni Association",
    short_name: "Newton House",
    description: "The Home. The Memories. The Brotherhood.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f1e9",
    theme_color: "#0b1f38",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
