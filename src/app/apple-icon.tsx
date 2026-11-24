import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0b1f38", position: "relative" }}>
        <svg width="140" height="140" viewBox="0 0 64 64">
          <path d="M22.5 17.2l.9-6.6 4 3.8L32 8.6l3.6 5.8 4-3.8.9 6.6z" fill="#d6ad68" fillOpacity="0.3" stroke="#d6ad68" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M20 19.6h24v14.6c0 9-5.8 14.2-12 17.4-6.2-3.2-12-8.4-12-17.4z" fill="none" stroke="#d6ad68" strokeWidth="2" />
          <path d="M14 50C9 44 8 35 11 27M50 50c5-6 6-15 3-23" fill="none" stroke="#d6ad68" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <div style={{ position: "absolute", top: 70, left: 0, right: 0, display: "flex", justifyContent: "center", color: "#d6ad68", fontSize: 30, fontWeight: 700 }}>NH</div>
      </div>
    ),
    size,
  );
}
