import { ImageResponse } from "next/og";

export const alt = "SlideX - Motion decks without the rebuild";
export const dynamic = "force-static";
export const size = {
  height: 630,
  width: 1200
};
export const contentType = "image/png";

const timelineRows = [
  ["Title", 206, "#dfe6ff"],
  ["Chart", 282, "#88a2ff"],
  ["Scene", 338, "#f3f6ff"],
  ["Export", 238, "#88a2ff"]
] as const;

const sceneBars = [26, 44, 32, 70, 54, 92, 122] as const;
const navItems = ["MDX", "Preview", "Export"] as const;
const outputTags = ["MDX", "HTML", "MP4"] as const;

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background:
            "radial-gradient(circle at 80% 30%, rgba(116, 145, 255, 0.22), transparent 34%), radial-gradient(circle at 38% 108%, rgba(248, 250, 252, 0.12), transparent 34%), linear-gradient(135deg, #050608 0%, #0b0d11 48%, #12141a 100%)",
          color: "#f8fafc",
          display: "flex",
          flexDirection: "row",
          fontFamily: "Arial, Helvetica, sans-serif",
          height: "100%",
          justifyContent: "center",
          overflow: "hidden",
          padding: "54px 62px",
          position: "relative",
          width: "100%"
        }}
      >
        <div
          style={{
            background: "linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0))",
            height: 1,
            left: 0,
            opacity: 0.72,
            position: "absolute",
            top: 92,
            width: "100%"
          }}
        />
        <div
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0))",
            height: "100%",
            left: 520,
            position: "absolute",
            top: 0,
            transform: "skewX(-18deg)",
            width: 1
          }}
        />
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.09)",
            height: 560,
            left: 36,
            position: "absolute",
            top: 30,
            width: 1128
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            justifyContent: "space-between",
            paddingBottom: 34,
            paddingTop: 6,
            width: 492
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ alignItems: "center", display: "flex", gap: 15 }}>
              <div style={{ display: "flex", fontSize: 42, fontWeight: 900, letterSpacing: -1.6 }}>
                <span>Slide</span>
                <span
                  style={{
                    background: "linear-gradient(135deg, #a9c0ff, #6f63ff)",
                    backgroundClip: "text",
                    color: "transparent"
                  }}
                >
                  X
                </span>
              </div>
            </div>

            <div
              style={{
                color: "#9aa3b2",
                display: "flex",
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: 2.6,
                marginTop: 54,
                textTransform: "uppercase"
              }}
            >
              MDX motion studio
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: 76,
                fontWeight: 900,
                letterSpacing: -4.2,
                lineHeight: 0.93,
                marginTop: 16
              }}
            >
              <span>Motion decks</span>
              <span>without the</span>
              <span>rebuild.</span>
            </div>
            <div
              style={{
                color: "#c7ccd8",
                display: "flex",
                fontSize: 27,
                lineHeight: 1.32,
                marginTop: 28,
                maxWidth: 462
              }}
            >
              Compose scenes with MDX, tune timing, and export a deck that stays editable.
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                alignItems: "center",
                borderTop: "1px solid rgba(255,255,255,0.12)",
                color: "#f8fafc",
                display: "flex",
                fontSize: 20,
                gap: 18,
                paddingTop: 20
              }}
            >
              <span style={{ color: "#a9c0ff", fontWeight: 800 }}>Mac Beta 0.1.0</span>
              <span style={{ color: "rgba(255,255,255,0.28)" }}>|</span>
              <span style={{ color: "#d9dee8" }}>Apple Silicon DMG available</span>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            height: "100%",
            justifyContent: "flex-end",
            position: "relative"
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.04))",
              border: "1px solid rgba(255,255,255,0.16)",
              borderRadius: 32,
              boxShadow: "0 42px 120px rgba(0,0,0,0.45)",
              display: "flex",
              flexDirection: "column",
              height: 470,
              marginTop: 28,
              overflow: "hidden",
              padding: 18,
              transform: "rotate(-2.8deg)",
              width: 566
            }}
          >
            <div
              style={{
                alignItems: "center",
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 16
              }}
            >
              <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
                <div style={{ background: "#ff6b6b", borderRadius: 99, height: 10, width: 10 }} />
                <div style={{ background: "#ffd166", borderRadius: 99, height: 10, width: 10 }} />
                <div style={{ background: "#6ee7b7", borderRadius: 99, height: 10, width: 10 }} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {navItems.map((item, index) => (
                  <div
                    key={item}
                    style={{
                      background: index === 1 ? "rgba(169,192,255,0.18)" : "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 11,
                      color: index === 1 ? "#dfe6ff" : "#9aa3b2",
                      display: "flex",
                      fontSize: 14,
                      fontWeight: 700,
                      padding: "7px 11px"
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 14, height: 250 }}>
              <div
                style={{
                  background: "#0b0d11",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 22,
                  color: "#b5bdca",
                  display: "flex",
                  flexDirection: "column",
                  fontFamily: "Menlo, Consolas, monospace",
                  fontSize: 15,
                  gap: 12,
                  height: "100%",
                  justifyContent: "center",
                  padding: 22,
                  width: 204
                }}
              >
                <div style={{ color: "#a9c0ff", display: "flex" }}>{"<Scene"}</div>
                <div style={{ color: "#e7ebf4", display: "flex", paddingLeft: 18 }}>duration={"{6}"}</div>
                <div style={{ color: "#e7ebf4", display: "flex", paddingLeft: 18 }}>theme="dark"</div>
                <div style={{ color: "#a9c0ff", display: "flex" }}>{">"}</div>
                <div style={{ color: "#ffffff", display: "flex" }}>{"  <Title />"}</div>
                <div style={{ color: "#ffffff", display: "flex" }}>{"  <Chart />"}</div>
                <div style={{ color: "#a9c0ff", display: "flex" }}>{"</Scene>"}</div>
              </div>

              <div
                style={{
                  background: "linear-gradient(180deg, #121621, #080a0f)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: 22,
                  display: "flex",
                  flex: 1,
                  flexDirection: "column",
                  overflow: "hidden",
                  padding: 24
                }}
              >
                <div style={{ color: "#f7f9ff", display: "flex", fontSize: 27, fontWeight: 850, letterSpacing: -1 }}>
                  Growth memo
                </div>
                <div style={{ color: "#8b94a5", display: "flex", fontSize: 15, marginTop: 7 }}>
                  Story, timing, export path
                </div>

                <div style={{ alignItems: "flex-end", display: "flex", flex: 1, gap: 10, marginTop: 22 }}>
                  {sceneBars.map((height, index) => (
                    <div
                      key={height}
                      style={{
                        background:
                          index === sceneBars.length - 1
                            ? "linear-gradient(180deg, #dfe6ff, #7f97ff)"
                            : "linear-gradient(180deg, rgba(169,192,255,0.52), rgba(169,192,255,0.08))",
                        borderRadius: 8,
                        display: "flex",
                        height,
                        width: 18
                      }}
                    />
                  ))}
                  <div
                    style={{
                      background: "linear-gradient(180deg, #f7f9ff, #7f97ff)",
                      borderRadius: 99,
                      boxShadow: "0 0 28px rgba(169,192,255,0.62)",
                      display: "flex",
                      height: 20,
                      marginBottom: 125,
                      width: 20
                    }}
                  />
                </div>
              </div>
            </div>

            <div
              style={{
                background: "rgba(7,9,13,0.78)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 22,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                marginTop: 14,
                padding: "18px 20px"
              }}
            >
              {timelineRows.map(([label, width, color], index) => (
                <div key={label} style={{ alignItems: "center", display: "flex", gap: 14 }}>
                  <div style={{ color: "#8b94a5", display: "flex", fontSize: 13, width: 48 }}>{label}</div>
                  <div
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      borderRadius: 99,
                      display: "flex",
                      flex: 1,
                      height: 12,
                      overflow: "hidden"
                    }}
                  >
                    <div
                      style={{
                        background: color,
                        borderRadius: 99,
                        display: "flex",
                        height: "100%",
                        marginLeft: index * 28,
                        opacity: index === 0 ? 0.88 : 0.72,
                        width
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              bottom: 34,
              display: "flex",
              gap: 10,
              position: "absolute",
              right: 22,
              transform: "rotate(-2.8deg)"
            }}
          >
            {outputTags.map((tag, index) => (
              <div
                key={tag}
                style={{
                  background: index === 0 ? "rgba(169,192,255,0.16)" : "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 14,
                  color: index === 0 ? "#dfe6ff" : "#c7ccd8",
                  display: "flex",
                  fontSize: 18,
                  fontWeight: 800,
                  padding: "10px 16px"
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size
  );
}
