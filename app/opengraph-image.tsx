import { ImageResponse } from "next/og";

// Link-preview card shown by LinkedIn, WhatsApp, Slack, etc. when the site URL is shared.
export const alt = "Sahana Kulal — Application Engineer at Ati Motors";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          color: "#f4f4f8",
          backgroundColor: "#0a0a12",
          backgroundImage:
            "radial-gradient(circle at 12% 18%, rgba(124,58,237,0.55), rgba(10,10,18,0) 45%), radial-gradient(circle at 88% 85%, rgba(6,182,212,0.45), rgba(10,10,18,0) 45%)",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 5, color: "#a1a1b5" }}>
          APPLICATION ENGINEER · ATI MOTORS
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 132, fontWeight: 700, lineHeight: 1 }}>Sahana Kulal</div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 40, color: "#c9c9d8" }}>
            Real-time software for robot fleets
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 28 }}>
          <div style={{ display: "flex", color: "#22d3ee" }}>sahana-kulal.vercel.app</div>
          <div style={{ display: "flex", color: "#a1a1b5" }}>React · TypeScript · WebRTC</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
