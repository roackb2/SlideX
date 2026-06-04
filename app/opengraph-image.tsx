import { ImageResponse } from "next/og";

export const alt = "SlideX - Motion decks without the rebuild";
export const dynamic = "force-static";
export const size = {
  height: 630,
  width: 1200
};
export const contentType = "image/png";

// Fetch font utility
async function getFont(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch font from ${url}`);
  }
  return response.arrayBuffer();
}

export default async function OpenGraphImage() {
  // Load premium typography at build time
  const [outfitRegular, outfitBold, jetbrainsMono] = await Promise.all([
    getFont("https://fonts.gstatic.com/s/outfit/v15/QGYyz_MVcBeNP4NjuGObqx1XmO1I4TC1O4a0Fg.ttf"),
    getFont("https://fonts.gstatic.com/s/outfit/v15/QGYyz_MVcBeNP4NjuGObqx1XmO1I4deyO4a0Fg.ttf"),
    getFont("https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxTOlOQ.ttf")
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "60px 80px",
          background: "#05060b",
          backgroundImage: "radial-gradient(circle at 50% -20%, rgba(142, 165, 255, 0.16), transparent 55%), radial-gradient(circle at 10% 90%, rgba(15, 17, 28, 0.6), transparent 45%)",
          fontFamily: "Outfit, sans-serif",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Background Grid Lines */}
        <div
          style={{
            position: "absolute",
            top: 90,
            left: 80,
            right: 80,
            height: "1px",
            background: "rgba(255, 255, 255, 0.05)"
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 560,
            top: 60,
            bottom: 60,
            width: "1px",
            background: "linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)"
          }}
        />

        {/* Left Section: Branding & Info */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "420px",
            height: "470px",
            zIndex: 2
          }}
        >
          {/* Logo & Brand Label */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "42px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "36px",
                  height: "36px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  boxShadow: "inset 0 1px 1px rgba(255,255,255,0.2)"
                }}
              >
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "5px",
                    background: "linear-gradient(135deg, #a9c0ff 0%, #7f8795 100%)"
                  }}
                />
              </div>
              <div style={{ display: "flex", fontSize: "24px", fontWeight: 700, letterSpacing: "-0.5px", color: "#ffffff" }}>
                Slide<span style={{ color: "#8ea5ff" }}>X</span>
              </div>
            </div>

            {/* Eyebrow */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                color: "#8ea5ff",
                marginBottom: "16px"
              }}
            >
              MDX Motion Studio
            </div>

            {/* Title */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: "56px",
                fontWeight: 700,
                lineHeight: "1.06",
                letterSpacing: "-2px",
                color: "#ffffff",
                marginBottom: "24px"
              }}
            >
              <span>Motion decks</span>
              <span style={{ color: "#dfe6ff" }}>without the</span>
              <span
                style={{
                  backgroundImage: "linear-gradient(135deg, #ffffff 0%, #8ea5ff 100%)",
                  backgroundClip: "text",
                  color: "transparent"
                }}
              >
                rebuild.
              </span>
            </div>

            {/* Description */}
            <div style={{ fontSize: "18px", lineHeight: "1.45", color: "#9aa3b2", fontWeight: 400 }}>
              Compose cinematic presentation scenes with MDX. Fine-tune timings on an interactive timeline, and export editable slides or high-quality video.
            </div>
          </div>

          {/* Footer Pills & URL */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  display: "flex",
                  padding: "4px 10px",
                  borderRadius: "8px",
                  background: "rgba(142, 165, 255, 0.08)",
                  border: "1px solid rgba(142, 165, 255, 0.15)",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#a9c0ff",
                  textTransform: "uppercase"
                }}
              >
                Mac Beta 0.1.0
              </div>
              <div style={{ fontSize: "13px", color: "#7f8795", fontWeight: 500 }}>
                Apple Silicon build available
              </div>
            </div>
            <div style={{ fontSize: "13px", color: "#4f5666", fontFamily: "JetBrains Mono" }}>
              slide-x-psi.vercel.app
            </div>
          </div>
        </div>

        {/* Right Section: Editor/Timeline Mockup */}
        <div
          style={{
            display: "flex",
            position: "relative",
            transform: "rotate(-1.5deg)",
            zIndex: 2
          }}
        >
          {/* Double Bezel Card Enclosure */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "530px",
              height: "450px",
              borderRadius: "24px",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              padding: "6px",
              boxShadow: "0 32px 80px rgba(0, 0, 0, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.05)"
            }}
          >
            {/* Inner Core */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                borderRadius: "18px",
                background: "#08090d",
                border: "1px solid rgba(255, 255, 255, 0.04)",
                padding: "16px 18px",
                overflow: "hidden"
              }}
            >
              {/* Window Title Bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px"
                }}
              >
                <div style={{ display: "flex", gap: "6px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444" }} />
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#eab308" }} />
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e" }} />
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    borderRadius: "8px",
                    padding: "4px 10px",
                    fontSize: "12px",
                    color: "#a9c0ff",
                    fontWeight: 500
                  }}
                >
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#8ea5ff" }} />
                  <span>Editor.mdx</span>
                </div>
                <div style={{ fontSize: "11px", color: "#4f5666", fontFamily: "JetBrains Mono" }}>
                  UTF-8
                </div>
              </div>

              {/* Mockup Workspace Split */}
              <div style={{ display: "flex", flex: 1, gap: "12px", minHeight: 0 }}>
                {/* Code Pane */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "210px",
                    background: "rgba(0, 0, 0, 0.25)",
                    border: "1px solid rgba(255, 255, 255, 0.03)",
                    borderRadius: "12px",
                    padding: "16px 14px",
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "12px",
                    lineHeight: "1.6",
                    color: "#7f8795"
                  }}
                >
                  <div style={{ display: "flex", color: "#ff7b72" }}>
                    {"<Scene"} <span style={{ color: "#79c0ff", marginLeft: "4px" }}>duration</span>={"{"}
                    <span style={{ color: "#a5d6ff" }}>6</span>
                    {"}"}
                    {">"}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", paddingLeft: "12px" }}>
                    <span style={{ color: "#8b949e" }}>{"  <Title"}</span>
                    <span style={{ color: "#a5d6ff", paddingLeft: "12px" }}>text="Welcome"</span>
                    <span style={{ color: "#8b949e" }}>{"  />"}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", paddingLeft: "12px", marginTop: "4px" }}>
                    <span style={{ color: "#8b949e" }}>{"  <Chart"}</span>
                    <span style={{ color: "#a5d6ff", paddingLeft: "12px" }}>type="bar"</span>
                    <span style={{ color: "#a5d6ff", paddingLeft: "12px" }}>animate</span>
                    <span style={{ color: "#8b949e" }}>{"  />"}</span>
                  </div>
                  <div style={{ display: "flex", color: "#ff7b72" }}>{"</Scene>"}</div>
                </div>

                {/* Preview + Timeline Pane */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    gap: "12px"
                  }}
                >
                  {/* Visual Slide Frame */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      height: "140px",
                      background: "linear-gradient(180deg, #12141c 0%, #0c0e14 100%)",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                      borderRadius: "12px",
                      padding: "16px",
                      position: "relative",
                      overflow: "hidden"
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage: "radial-gradient(circle at 90% 90%, rgba(142, 165, 255, 0.08), transparent 70%)"
                      }}
                    />
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", zIndex: 1 }}>
                      Growth Metrics
                    </div>
                    <div style={{ fontSize: "11px", color: "#7f8795", marginTop: "2px", zIndex: 1 }}>
                      Quarterly active users
                    </div>

                    {/* Miniature Bars */}
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", marginTop: "auto", height: "45px", zIndex: 1 }}>
                      {[20, 40, 30, 60, 45, 85, 70].map((h, i) => (
                        <div
                          key={i}
                          style={{
                            flex: 1,
                            height: `${h}%`,
                            background: i === 5 ? "linear-gradient(to top, #8ea5ff, #dfe6ff)" : "rgba(255,255,255,0.08)",
                            borderRadius: "3px"
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Micro Timeline Track */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                      background: "rgba(0, 0, 0, 0.2)",
                      border: "1px solid rgba(255, 255, 255, 0.03)",
                      borderRadius: "12px",
                      padding: "12px",
                      gap: "10px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#4f5666", fontFamily: "JetBrains Mono" }}>
                      <span>0.0s</span>
                      <span>2.0s</span>
                      <span>4.0s</span>
                      <span>6.0s</span>
                    </div>

                    {/* Title Track */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "36px", fontSize: "10px", color: "#8b94a5", fontWeight: 500 }}>Title</div>
                      <div style={{ flex: 1, height: "6px", background: "rgba(255, 255, 255, 0.04)", borderRadius: "3px", position: "relative" }}>
                        <div style={{ position: "absolute", left: "0%", width: "70%", height: "100%", background: "#a9c0ff", borderRadius: "3px", opacity: 0.8 }} />
                      </div>
                    </div>

                    {/* Chart Track */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "36px", fontSize: "10px", color: "#8b94a5", fontWeight: 500 }}>Chart</div>
                      <div style={{ flex: 1, height: "6px", background: "rgba(255, 255, 255, 0.04)", borderRadius: "3px", position: "relative" }}>
                        <div style={{ position: "absolute", left: "20%", width: "80%", height: "100%", background: "#8ea5ff", borderRadius: "3px" }} />
                      </div>
                    </div>

                    {/* Export Track */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "36px", fontSize: "10px", color: "#8b94a5", fontWeight: 500 }}>Export</div>
                      <div style={{ flex: 1, height: "6px", background: "rgba(255, 255, 255, 0.04)", borderRadius: "3px", position: "relative" }}>
                        <div style={{ position: "absolute", left: "60%", width: "40%", height: "100%", background: "#dfe6ff", borderRadius: "3px", opacity: 0.6 }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Export Tags */}
          <div
            style={{
              position: "absolute",
              bottom: "-15px",
              right: "24px",
              display: "flex",
              gap: "8px",
              zIndex: 10
            }}
          >
            {["MDX", "HTML5", "MP4"].map((tag, idx) => (
              <div
                key={tag}
                style={{
                  background: idx === 0 ? "rgba(142, 165, 255, 0.16)" : "rgba(255, 255, 255, 0.06)",
                  border: idx === 0 ? "1px solid rgba(142, 165, 255, 0.3)" : "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "10px",
                  color: idx === 0 ? "#dfe6ff" : "#9aa3b2",
                  fontSize: "12px",
                  fontWeight: 600,
                  padding: "6px 12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.25)"
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
        {
          name: "Outfit",
          data: outfitRegular,
          style: "normal",
          weight: 400
        },
        {
          name: "Outfit",
          data: outfitBold,
          style: "normal",
          weight: 700
        },
        {
          name: "JetBrains Mono",
          data: jetbrainsMono,
          style: "normal",
          weight: 400
        }
      ]
    }
  );
}
