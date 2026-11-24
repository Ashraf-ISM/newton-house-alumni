import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Newton House — Patna Science College Alumni Association";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const root = process.cwd();
  const [serif, italic, photo] = await Promise.all([
    readFile(join(root, "src/assets/og/cormorant-garamond-latin-600-normal.woff")),
    readFile(join(root, "src/assets/og/cormorant-garamond-latin-500-italic.woff")),
    readFile(join(root, "public/images/hero/og-exterior.jpg")),
  ]);
  const photoSrc = `data:image/jpeg;base64,${photo.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#0b1f38", position: "relative" }}>
        <img src={photoSrc} alt="" width={780} height={630} style={{ position: "absolute", right: 0, top: 0, width: 780, height: 630, objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", background: "linear-gradient(90deg, #0b1f38 0%, #0b1f38 38%, rgba(11,31,56,0.55) 65%, rgba(11,31,56,0.05) 100%)" }} />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 72px", width: 760 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, color: "#d6ad68", fontSize: 20, letterSpacing: 6 }}>
            <div style={{ width: 48, height: 1, background: "#d6ad68" }} />
            PATNA SCIENCE COLLEGE
          </div>
          <div style={{ fontFamily: "Cormorant", fontSize: 112, color: "#f5f1e9", lineHeight: 1, marginTop: 24 }}>Newton House</div>
          <div style={{ fontFamily: "CormorantItalic", fontSize: 42, color: "#d6ad68", marginTop: 18 }}>The Home. The Memories. The Brotherhood.</div>
          <div style={{ fontSize: 22, color: "rgba(245,241,233,0.75)", marginTop: 28, letterSpacing: 2 }}>ALUMNI ASSOCIATION</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Cormorant", data: serif, weight: 600, style: "normal" },
        { name: "CormorantItalic", data: italic, weight: 500, style: "italic" },
      ],
    },
  );
}
