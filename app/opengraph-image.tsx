import { ImageResponse } from "next/og";

export const alt = "Langport Life — Community Hub for Langport, Somerset";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          backgroundColor: "#68ABB4",
          color: "#ffffff",
        }}
      >
        <div style={{ fontSize: 88, fontWeight: 700, lineHeight: 1.05 }}>
          Langport Life
        </div>
        <div style={{ fontSize: 36, marginTop: 28, color: "#F3FBFC", maxWidth: 900 }}>
          Events, shops, community groups and town council news for Langport, Somerset
        </div>
        <div
          style={{
            marginTop: 48,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div style={{ width: 64, height: 6, backgroundColor: "#C8845A" }} />
          <div style={{ fontSize: 28, color: "#F3FBFC" }}>langport.life</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
