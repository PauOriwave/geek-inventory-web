import PublicSiteShell from "./components/PublicSiteShell";
import { theme, availableThemes } from "./theme";

export default function HomePage() {
  const featuredThemes = availableThemes.slice(0, 4);

  return (
    <PublicSiteShell>
      <section
        style={{
          background:
            "linear-gradient(135deg, rgba(23,23,23,1) 0%, rgba(37,37,37,1) 55%, rgba(200,164,77,0.92) 140%)",
          color: "white"
        }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "38px 24px 72px 24px"
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.1fr) minmax(320px, 0.9fr)",
              gap: 28,
              alignItems: "center"
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 12px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.16)",
                  color: "rgba(255,255,255,0.82)",
                  fontSize: 12,
                  marginBottom: 16
                }}
              >
                Premium tracking for collectors
              </div>

              <h1
                style={{
                  fontSize: 54,
                  lineHeight: 1.04,
                  margin: 0,
                  fontWeight: 900,
                  maxWidth: 760
                }}
              >
                Track your collection.
                <br />
                Understand its value.
                <br />
                Watch it evolve.
              </h1>

              <p
                style={{
                  marginTop: 18,
                  marginBottom: 0,
                  maxWidth: 700,
                  fontSize: 18,
                  lineHeight: 1.65,
                  color: "rgba(255,255,255,0.78)"
                }}
              >
                DrakoryVault helps collectors organize games, books, TCG,
                figures and more, with valuations, historical snapshots,
                category trends and a premium dashboard built for real
                collection tracking.
              </p>

              <div
                style={{
                  marginTop: 26,
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap"
                }}
              >
                <a href="/register" style={heroPrimary}>
                  Create account
                </a>
                <a href="/pricing" style={heroSecondary}>
                  See pricing
                </a>
              </div>

              <div
                style={{
                  marginTop: 22,
                  display: "flex",
                  gap: 20,
                  flexWrap: "wrap",
                  color: "rgba(255,255,255,0.76)",
                  fontSize: 13
                }}
              >
                <span>Multi-user</span>
                <span>CSV import/export</span>
                <span>Valuation history</span>
                <span>Category trends</span>
              </div>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 28,
                padding: 18,
                boxShadow: "0 18px 40px rgba(0,0,0,0.22)"
              }}
            >
              <div
                style={{
                  background: "#FFFDF8",
                  borderRadius: 22,
                  padding: 18,
                  color: "#171717"
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: 10
                  }}
                >
                  <PreviewStat label="Items" value="248" />
                  <PreviewStat label="Collection" value="12.4k€" />
                  <PreviewStat label="Trend" value="+8.2%" />
                </div>

                <div
                  style={{
                    marginTop: 14,
                    padding: 14,
                    borderRadius: 18,
                    border: `1px solid ${theme.colors.border}`,
                    background: theme.colors.surfaceAlt
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      color: theme.colors.textMuted,
                      marginBottom: 10
                    }}
                  >
                    Collection value trend
                  </div>

                  <svg
                    viewBox="0 0 420 150"
                    style={{ width: "100%", height: "auto", display: "block" }}
                  >
                    <polyline
                      fill="none"
                      stroke={theme.colors.gold}
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points="16,122 82,110 148,104 214,88 280,78 346,56 404,34"
                    />
                    {[16, 82, 148, 214, 280, 346, 404].map((x, i) => {
                      const ys = [122, 110, 104, 88, 78, 56, 34];
                      return (
                        <circle
                          key={`${x}-${i}`}
                          cx={x}
                          cy={ys[i]}
                          r="4"
                          fill="#171717"
                        />
                      );
                    })}
                  </svg>

                  <div
                    style={{
                      marginTop: 10,
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12,
                      color: theme.colors.textMuted
                    }}
                  >
                    <span>First snapshot</span>
                    <span>Latest valuation</span>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 14,
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 10
                  }}
                >
                  <MiniPanel
                    title="Rising categories"
                    lines={[
                      "Videogames  +42.50€",
                      "Figures  +18.00€",
                      "Books  +7.20€"
                    ]}
                  />
                  <MiniPanel
                    title="Top movers"
                    lines={[
                      "Pokémon Azul  +12.00€",
                      "Chrono Trigger  +9.50€",
                      "Berserk Vol. 1  +4.10€"
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "54px 24px 24px 24px"
        }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: 800,
            margin: "0 auto 28px auto"
          }}
        >
          <div
            style={{
              color: theme.colors.link,
              fontWeight: 800,
              fontSize: 13,
              marginBottom: 10
            }}
          >
            Why DrakoryVault
          </div>

          <h2
            style={{
              margin: 0,
              fontSize: 36,
              lineHeight: 1.14
            }}
          >
            Built for collectors, not just spreadsheets
          </h2>

          <p
            style={{
              marginTop: 14,
              color: theme.colors.textMuted,
              fontSize: 16,
              lineHeight: 1.7
            }}
          >
            Track what you own, monitor market value, explore category trends
            and build a collection dashboard that actually feels premium.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 14
          }}
        >
          <FeatureCard
            title="Inventory that respects collectors"
            text="Store items with condition, platform, completeness, region, notes and category-aware organization."
          />
          <FeatureCard
            title="Valuations and history"
            text="Create valuation snapshots, compare price vs market value and see how items evolve over time."
          />
          <FeatureCard
            title="Category intelligence"
            text="Understand which parts of your collection are rising, dropping or driving total value."
          />
          <FeatureCard
            title="CSV import and export"
            text="Start fast, move data easily and keep your collection portable without vendor lock-in."
          />
          <FeatureCard
            title="Theme system ready"
            text="Premium and loyalty-based themes are built into the product direction from day one."
          />
          <FeatureCard
            title="Dashboard with real signal"
            text="See top items, movers, collection trend and value by category in one premium workspace."
          />
        </div>
      </section>

      <section
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "30px 24px 24px 24px"
        }}
      >
        <div
          style={{
            background: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: 28,
            padding: 24,
            boxShadow: theme.shadow.card
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 20,
              flexWrap: "wrap"
            }}
          >
            <div style={{ maxWidth: 760 }}>
              <div
                style={{
                  color: theme.colors.link,
                  fontWeight: 800,
                  fontSize: 13,
                  marginBottom: 8
                }}
              >
                Loyalty themes
              </div>

              <h3
                style={{
                  margin: 0,
                  fontSize: 30
                }}
              >
                Stay subscribed, unlock new aesthetics
              </h3>

              <p
                style={{
                  marginTop: 12,
                  marginBottom: 0,
                  color: theme.colors.textMuted,
                  lineHeight: 1.7
                }}
              >
                DrakoryVault is designed to support premium themes and loyalty
                unlocks. That means the theme system is not a cosmetic afterthought:
                it is part of the product architecture from the start.
              </p>
            </div>

            <a href="/pricing" style={secondaryCtaLight}>
              Explore plans
            </a>
          </div>

          <div
            style={{
              marginTop: 18,
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: 12
            }}
          >
            {featuredThemes.map((item) => (
              <div
                key={item.id}
                style={{
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: 20,
                  padding: 14,
                  background: theme.colors.surfaceAlt
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 8,
                    alignItems: "center"
                  }}
                >
                  <div style={{ fontWeight: 800 }}>{item.label}</div>
                  <span
                    style={{
                      fontSize: 11,
                      borderRadius: 999,
                      padding: "4px 8px",
                      background: item.premium ? "#171717" : "#F3F4F6",
                      color: item.premium ? "white" : theme.colors.textMuted
                    }}
                  >
                    {item.premium
                      ? `${item.loyaltyMonthsRequired}m+`
                      : "default"}
                  </span>
                </div>

                <div
                  style={{
                    marginTop: 8,
                    fontSize: 13,
                    color: theme.colors.textMuted,
                    minHeight: 36
                  }}
                >
                  {item.description}
                </div>

                <div
                  style={{
                    marginTop: 12,
                    display: "flex",
                    gap: 6
                  }}
                >
                  <Swatch color={item.colors.bg} />
                  <Swatch color={item.colors.surface} />
                  <Swatch color={item.colors.gold} />
                  <Swatch color={item.colors.black} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "30px 24px 72px 24px"
        }}
      >
        <div
          style={{
            background: theme.colors.black,
            color: "white",
            borderRadius: 28,
            padding: 28,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
            boxShadow: theme.shadow.card
          }}
        >
          <div style={{ maxWidth: 740 }}>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.72)",
                marginBottom: 8,
                fontWeight: 800
              }}
            >
              Ready to start?
            </div>

            <h3
              style={{
                margin: 0,
                fontSize: 32,
                lineHeight: 1.15
              }}
            >
              Build your collection vault and start tracking value properly.
            </h3>
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap"
            }}
          >
            <a href="/register" style={footerPrimary}>
              Start free
            </a>
            <a href="/pricing" style={footerSecondary}>
              Pricing
            </a>
          </div>
        </div>
      </section>
    </PublicSiteShell>
  );
}

function PreviewStat({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        border: `1px solid ${theme.colors.border}`,
        borderRadius: 16,
        padding: 12,
        background: theme.colors.surfaceAlt
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: theme.colors.textMuted,
          marginBottom: 6
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 800
        }}
      >
        {value}
      </div>
    </div>
  );
}

function MiniPanel({
  title,
  lines
}: {
  title: string;
  lines: string[];
}) {
  return (
    <div
      style={{
        border: `1px solid ${theme.colors.border}`,
        borderRadius: 16,
        padding: 12,
        background: "#FFFFFF"
      }}
    >
      <div
        style={{
          fontWeight: 800,
          fontSize: 13,
          marginBottom: 8
        }}
      >
        {title}
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {lines.map((line) => (
          <div
            key={line}
            style={{
              fontSize: 13,
              color: theme.colors.textMuted
            }}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  text
}: {
  title: string;
  text: string;
}) {
  return (
    <div
      style={{
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: 22,
        padding: 18,
        boxShadow: theme.shadow.soft
      }}
    >
      <div
        style={{
          fontWeight: 800,
          fontSize: 17,
          marginBottom: 10
        }}
      >
        {title}
      </div>

      <div
        style={{
          color: theme.colors.textMuted,
          lineHeight: 1.7,
          fontSize: 14
        }}
      >
        {text}
      </div>
    </div>
  );
}

function Swatch({ color }: { color: string }) {
  return (
    <span
      style={{
        width: 20,
        height: 20,
        borderRadius: 999,
        display: "inline-block",
        background: color,
        border: "1px solid rgba(0,0,0,0.08)"
      }}
    />
  );
}

const heroPrimary: React.CSSProperties = {
  textDecoration: "none",
  background: theme.colors.gold,
  color: theme.colors.black,
  padding: "12px 18px",
  borderRadius: 999,
  fontWeight: 800
};

const heroSecondary: React.CSSProperties = {
  textDecoration: "none",
  border: "1px solid rgba(255,255,255,0.18)",
  color: "white",
  padding: "12px 18px",
  borderRadius: 999,
  fontWeight: 800
};

const secondaryCtaLight: React.CSSProperties = {
  textDecoration: "none",
  border: `1px solid ${theme.colors.border}`,
  color: theme.colors.text,
  padding: "11px 16px",
  borderRadius: 999,
  fontWeight: 800,
  background: theme.colors.surfaceAlt
};

const footerPrimary: React.CSSProperties = {
  textDecoration: "none",
  background: theme.colors.gold,
  color: theme.colors.black,
  padding: "12px 18px",
  borderRadius: 999,
  fontWeight: 800
};

const footerSecondary: React.CSSProperties = {
  textDecoration: "none",
  border: "1px solid rgba(255,255,255,0.16)",
  color: "white",
  padding: "12px 18px",
  borderRadius: 999,
  fontWeight: 800
};