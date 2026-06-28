import { ImageResponse } from "next/og";

export const alt = "SlideX - Motion decks without the rebuild";
export const dynamic = "force-static";
export const size = {
  height: 630,
  width: 1200
};
export const contentType = "image/png";

async function getFont(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch font: ${url}`);
  return response.arrayBuffer();
}

export default async function OpenGraphImage() {
  const [outfitRegular, outfitBold, jetbrainsMono] = await Promise.all([
    getFont("https://fonts.gstatic.com/s/outfit/v15/QGYyz_MVcBeNP4NjuGObqx1XmO1I4TC1O4a0Fg.ttf"),
    getFont("https://fonts.gstatic.com/s/outfit/v15/QGYyz_MVcBeNP4NjuGObqx1XmO1I4deyO4a0Fg.ttf"),
    getFont("https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxTOlOQ.ttf")
  ]);

  const tracks = [
    { label: "Title", left: "0%", width: "70%", color: "#a9c0ff", opacity: 0.8 },
    { label: "Chart", left: "20%", width: "80%", color: "#8ea5ff", opacity: 1 },
    { label: "Export", left: "60%", width: "40%", color: "#dfe6ff", opacity: 0.6 }
  ] as const;

  const bars = [20, 40, 30, 60, 45, 85, 70] as const;

  return new ImageResponse(
    (
      // Root container
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "60px 80px",
          background:
            "radial-gradient(circle at 50% -20%, rgba(142,165,255,0.16) 0%, transparent 55%), radial-gradient(circle at 10% 90%, rgba(15,17,28,0.6) 0%, transparent 45%), #05060b",
          fontFamily: "Outfit, sans-serif",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Decorative: horizontal rule */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 90,
            left: 80,
            right: 80,
            height: 1,
            background: "rgba(255,255,255,0.05)"
          }}
        />

        {/* Decorative: vertical rule */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            left: 560,
            top: 60,
            bottom: 60,
            width: 1,
            background: "linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)"
          }}
        />

        {/* ─────────── LEFT COLUMN ─────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: 420,
            height: 470
          }}
        >
          {/* Top group */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {/* Logo row */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 42 }}>
              {/* Icon */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%)",
                  border: "1px solid rgba(255,255,255,0.12)"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    width: 16,
                    height: 16,
                    borderRadius: 5,
                    background: "linear-gradient(135deg, #a9c0ff 0%, #7f8795 100%)"
                  }}
                />
              </div>
              {/* Wordmark */}
              <div
                style={{
                  display: "flex",
                  fontSize: 24,
                  fontWeight: 700,
                  letterSpacing: -0.5,
                  color: "#ffffff"
                }}
              >
                <span>Slide</span>
                <span style={{ color: "#8ea5ff" }}>X</span>
              </div>
            </div>

            {/* Eyebrow label */}
            <div
              style={{
                display: "flex",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 2.5,
                textTransform: "uppercase",
                color: "#8ea5ff",
                marginBottom: 16
              }}
            >
              SlideX Pitch
            </div>

            {/* Headline */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: 56,
                fontWeight: 700,
                lineHeight: 1.06,
                letterSpacing: -2,
                marginBottom: 24
              }}
            >
              <span style={{ color: "#ffffff" }}>Motion decks</span>
              <span style={{ color: "#dfe6ff" }}>without the</span>
              <span style={{ color: "#8ea5ff" }}>rebuild.</span>
            </div>

            {/* Description */}
            <div
              style={{
                display: "flex",
                fontSize: 18,
                lineHeight: 1.45,
                color: "#9aa3b2",
                fontWeight: 400
              }}
            >
              Compose cinematic Slides with MDX, fine-tune timings on an interactive timeline, and export editable slides or video.
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  display: "flex",
                  padding: "4px 10px",
                  borderRadius: 8,
                  background: "rgba(142,165,255,0.08)",
                  border: "1px solid rgba(142,165,255,0.15)",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#a9c0ff",
                  textTransform: "uppercase"
                }}
              >
                Mac Beta 0.1.0
              </div>
              <div style={{ display: "flex", fontSize: 13, color: "#7f8795", fontWeight: 500 }}>
                Apple Silicon build available
              </div>
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 13,
                color: "#4f5666",
                fontFamily: "JetBrains Mono"
              }}
            >
              slide-x-psi.vercel.app
            </div>
          </div>
        </div>

        {/* ─────────── RIGHT COLUMN: Editor Mockup ─────────── */}
        <div
          style={{
            display: "flex",
            position: "relative",
            transform: "rotate(-1.5deg)"
          }}
        >
          {/* Outer bezel */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: 530,
              height: 450,
              borderRadius: 24,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              padding: 6,
              boxShadow: "0 32px 80px rgba(0,0,0,0.55)"
            }}
          >
            {/* Inner core */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                borderRadius: 18,
                background: "#08090d",
                border: "1px solid rgba(255,255,255,0.04)",
                padding: "16px 18px",
                overflow: "hidden"
              }}
            >
              {/* Window title bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16
                }}
              >
                {/* Traffic lights */}
                <div style={{ display: "flex", gap: 6 }}>
                  <div style={{ display: "flex", width: 8, height: 8, borderRadius: 4, background: "#ef4444" }} />
                  <div style={{ display: "flex", width: 8, height: 8, borderRadius: 4, background: "#eab308" }} />
                  <div style={{ display: "flex", width: 8, height: 8, borderRadius: 4, background: "#22c55e" }} />
                </div>
                {/* Active tab */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 8,
                    padding: "4px 10px",
                    fontSize: 12,
                    color: "#a9c0ff",
                    fontWeight: 500
                  }}
                >
                  <div style={{ display: "flex", width: 6, height: 6, borderRadius: 3, background: "#8ea5ff" }} />
                  <span>Editor.mdx</span>
                </div>
                {/* Encoding */}
                <div
                  style={{
                    display: "flex",
                    fontSize: 11,
                    color: "#4f5666",
                    fontFamily: "JetBrains Mono"
                  }}
                >
                  UTF-8
                </div>
              </div>

              {/* Workspace split */}
              <div style={{ display: "flex", flex: 1, gap: 12 }}>
                {/* Code pane */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: 210,
                    background: "rgba(0,0,0,0.25)",
                    border: "1px solid rgba(255,255,255,0.03)",
                    borderRadius: 12,
                    padding: "16px 14px",
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 12,
                    gap: 2
                  }}
                >
                  <div style={{ display: "flex", gap: 4 }}>
                    <span style={{ color: "#ff7b72" }}>{"<Slide"}</span>
                    <span style={{ color: "#79c0ff" }}>duration</span>
                    <span style={{ color: "#ff7b72" }}>{"={6}>"}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", paddingLeft: 12, gap: 1 }}>
                    <span style={{ color: "#8b949e" }}>{"<Text"}</span>
                    <span style={{ color: "#a5d6ff", paddingLeft: 12 }}>{"fontWeight={800}"}</span>
                    <span style={{ color: "#8b949e" }}>{">Welcome</Text>"}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", paddingLeft: 12, gap: 1, marginTop: 4 }}>
                    <span style={{ color: "#8b949e" }}>{"<Chart"}</span>
                    <span style={{ color: "#a5d6ff", paddingLeft: 12 }}>{'type="bar"'}</span>
                    <span style={{ color: "#a5d6ff", paddingLeft: 12 }}>{"animate"}</span>
                    <span style={{ color: "#8b949e" }}>{"/>"}</span>
                  </div>
                  <div style={{ display: "flex" }}>
                    <span style={{ color: "#ff7b72" }}>{"</Slide>"}</span>
                  </div>
                </div>

                {/* Preview + Timeline */}
                <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 12 }}>
                  {/* Slide preview */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      height: 140,
                      background: "linear-gradient(180deg, #12141c 0%, #0c0e14 100%)",
                      border: "1px solid rgba(255,255,255,0.05)",
                      borderRadius: 12,
                      padding: 16,
                      overflow: "hidden"
                    }}
                  >
                    <div style={{ display: "flex", fontSize: 14, fontWeight: 700, color: "#ffffff" }}>
                      Growth Metrics
                    </div>
                    <div style={{ display: "flex", fontSize: 11, color: "#7f8795", marginTop: 2 }}>
                      Quarterly active users
                    </div>
                    {/* Mini bar chart */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-end",
                        gap: 6,
                        marginTop: "auto",
                        height: 45
                      }}
                    >
                      {bars.map((h, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            flex: 1,
                            height: `${h}%`,
                            background:
                              i === 5
                                ? "linear-gradient(to top, #8ea5ff, #dfe6ff)"
                                : "rgba(255,255,255,0.08)",
                            borderRadius: 3
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                      background: "rgba(0,0,0,0.2)",
                      border: "1px solid rgba(255,255,255,0.03)",
                      borderRadius: 12,
                      padding: 12,
                      gap: 10
                    }}
                  >
                    {/* Time labels */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 10,
                        color: "#4f5666",
                        fontFamily: "JetBrains Mono"
                      }}
                    >
                      <span>0s</span>
                      <span>2s</span>
                      <span>4s</span>
                      <span>6s</span>
                    </div>

                    {/* Tracks */}
                    {tracks.map(({ label, left, width, color, opacity }) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div
                          style={{
                            display: "flex",
                            width: 36,
                            fontSize: 10,
                            color: "#8b94a5",
                            fontWeight: 500
                          }}
                        >
                          {label}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flex: 1,
                            height: 6,
                            background: "rgba(255,255,255,0.04)",
                            borderRadius: 3,
                            position: "relative"
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              position: "absolute",
                              left,
                              width,
                              height: "100%",
                              background: color,
                              borderRadius: 3,
                              opacity
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating export badges */}
          <div
            style={{
              display: "flex",
              position: "absolute",
              bottom: -15,
              right: 24,
              gap: 8
            }}
          >
            {(["MDX", "HTML5", "MP4"] as const).map((tag, idx) => (
              <div
                key={tag}
                style={{
                  display: "flex",
                  background:
                    idx === 0
                      ? "rgba(142,165,255,0.16)"
                      : "rgba(255,255,255,0.06)",
                  border:
                    idx === 0
                      ? "1px solid rgba(142,165,255,0.3)"
                      : "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  color: idx === 0 ? "#dfe6ff" : "#9aa3b2",
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "6px 12px"
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Outfit", data: outfitRegular, style: "normal", weight: 400 },
        { name: "Outfit", data: outfitBold, style: "normal", weight: 700 },
        { name: "JetBrains Mono", data: jetbrainsMono, style: "normal", weight: 400 }
      ]
    }
  );
}
