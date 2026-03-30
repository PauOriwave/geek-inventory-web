import PublicSiteShell from "../components/PublicSiteShell";
import { availableThemes, theme } from "../theme";

export default function PricingPage() {
  const premiumThemes = availableThemes.filter((item) => item.premium);

  return (
    <PublicSiteShell compact>
      <section
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "34px 24px 28px 24px"
        }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: 760,
            margin: "0 auto"
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "6px 12px",
              borderRadius: 999,
              background: theme.colors.surfaceAlt,
              border: `1px solid ${theme.colors.border}`,
              color: theme.colors.link,
              fontWeight: 800,
              fontSize: 12,
              marginBottom: 14
            }}
          >
            Pricing
          </div>

          <h1
            style={{
              fontSize: 42,
              lineHeight: 1.08,
              margin: 0,
              fontWeight: 900
            }}
          >
            Start free. Upgrade when you want deeper insights.
          </h1>

          <p
            style={{
              marginTop: 16,
              color: theme.colors.textMuted,
              fontSize: 17,
              lineHeight: 1.7
            }}
          >
            DrakoryVault is built to be useful from day one, with premium plans
            unlocking valuation history, advanced insights, loyalty themes and
            future automation.
          </p>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "0 24px 18px 24px"
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 18
          }}
        >
          <PlanCard
            title="Free"
            price="0€"
            subtitle="For starting your vault"
            features={[
              "Up to 100 items",
              "Basic dashboard",
              "CSV import/export",
              "Manual valuation",
              "Default theme",
              "Core collection management"
            ]}
            cta="Start free"
            href="/register"
          />

          <PlanCard
            title="Pro"
            price="4.99€ / month"
            subtitle="For active collectors"
            highlight
            features={[
              "Unlimited items",
              "Advanced dashboard",
              "Valuation history",
              "Top movers and category trends",
              "Collection value evolution",
              "Premium themes and loyalty unlock path",
              "Future automatic valuations"
            ]}
            cta="Choose Pro"
            href="/register"
          />

          <PlanCard
            title="Collector"
            price="9.99€ / month"
            subtitle="For power users and early adopters"
            features={[
              "Everything in Pro",
              "Priority feature access",
              "Deeper future valuation sources",
              "Premium cosmetics and supporter identity",
              "Higher future automation limits",
              "Long-term loyalty rewards"
            ]}
            cta="Become Collector"
            href="/register"
          />
        </div>
      </section>

      <section
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "16px 24px 18px 24px"
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
              gap: 18,
              alignItems: "flex-start",
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
                Loyalty aesthetics
              </div>

              <h2
                style={{
                  margin: 0,
                  fontSize: 30
                }}
              >
                Themes are part of the product, not an afterthought
              </h2>

              <p
                style={{
                  marginTop: 12,
                  marginBottom: 0,
                  color: theme.colors.textMuted,
                  lineHeight: 1.7
                }}
              >
                DrakoryVault is built with a multi-theme architecture so premium
                plans and long-term supporters can unlock different visual styles
                across the whole app.
              </p>
            </div>

            <a href="/register" style={secondaryCta}>
              Create account
            </a>
          </div>

          <div
            style={{
              marginTop: 18,
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 12
            }}
          >
            {premiumThemes.map((item) => (
              <div
                key={item.id}
                style={{
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: 22,
                  padding: 16,
                  background: theme.colors.surfaceAlt
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    alignItems: "center"
                  }}
                >
                  <div style={{ fontWeight: 800 }}>{item.label}</div>

                  <span
                    style={{
                      fontSize: 11,
                      borderRadius: 999,
                      padding: "4px 8px",
                      background: theme.colors.black,
                      color: "white"
                    }}
                  >
                    {item.loyaltyMonthsRequired}m+
                  </span>
                </div>

                <div
                  style={{
                    marginTop: 8,
                    color: theme.colors.textMuted,
                    fontSize: 13,
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
          maxWidth: 1180,
          margin: "0 auto",
          padding: "16px 24px 72px 24px"
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: 18
          }}
        >
          <div
            style={{
              background: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: 24,
              padding: 20,
              boxShadow: theme.shadow.soft
            }}
          >
            <div
              style={{
                fontWeight: 800,
                fontSize: 18,
                marginBottom: 10
              }}
            >
              What is already included in the product direction
            </div>

            <div
              style={{
                display: "grid",
                gap: 10,
                color: theme.colors.textMuted,
                lineHeight: 1.7,
                fontSize: 14
              }}
            >
              <div>• Collection inventory with category-aware structure</div>
              <div>• CSV import and export workflows</div>
              <div>• Market value snapshots and historical charts</div>
              <div>• Category trends and top movers</div>
              <div>• Theme system architecture ready for premium unlocks</div>
              <div>• Future roadmap for achievements, loyalty rewards and better valuation providers</div>
            </div>
          </div>

          <div
            style={{
              background: theme.colors.black,
              color: "white",
              borderRadius: 24,
              padding: 20,
              boxShadow: theme.shadow.card
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.72)",
                marginBottom: 8,
                fontWeight: 800
              }}
            >
              Get started
            </div>

            <h3
              style={{
                margin: 0,
                fontSize: 28,
                lineHeight: 1.15
              }}
            >
              Build your vault now and grow into Pro when you need more depth.
            </h3>

            <div
              style={{
                marginTop: 18,
                display: "flex",
                gap: 10,
                flexWrap: "wrap"
              }}
            >
              <a href="/register" style={primaryCta}>
                Start free
              </a>
              <a href="/login" style={ghostCta}>
                Login
              </a>
            </div>
          </div>
        </div>
      </section>
    </PublicSiteShell>
  );
}

function PlanCard({
  title,
  price,
  subtitle,
  features,
  cta,
  href,
  highlight = false
}: {
  title: string;
  price: string;
  subtitle: string;
  features: string[];
  cta: string;
  href: string;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        border: highlight
          ? `2px solid ${theme.colors.gold}`
          : `1px solid ${theme.colors.border}`,
        borderRadius: 26,
        padding: 22,
        background: theme.colors.surface,
        boxShadow: highlight ? theme.shadow.card : theme.shadow.soft,
        position: "relative"
      }}
    >
      {highlight && (
        <div
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            fontSize: 11,
            fontWeight: 800,
            borderRadius: 999,
            padding: "5px 8px",
            background: theme.colors.gold,
            color: theme.colors.black
          }}
        >
          Most balanced
        </div>
      )}

      <div
        style={{
          fontSize: 22,
          fontWeight: 900
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: 6,
          color: theme.colors.textMuted,
          fontSize: 14
        }}
      >
        {subtitle}
      </div>

      <div
        style={{
          marginTop: 18,
          fontSize: 34,
          fontWeight: 900
        }}
      >
        {price}
      </div>

      <div
        style={{
          marginTop: 18,
          display: "grid",
          gap: 10,
          color: theme.colors.textMuted,
          fontSize: 14,
          lineHeight: 1.6
        }}
      >
        {features.map((feature) => (
          <div key={feature}>• {feature}</div>
        ))}
      </div>

      <a
        href={href}
        style={{
          display: "inline-block",
          marginTop: 22,
          textDecoration: "none",
          background: highlight ? theme.colors.gold : theme.colors.black,
          color: highlight ? theme.colors.black : "white",
          padding: "12px 16px",
          borderRadius: 999,
          fontWeight: 800
        }}
      >
        {cta}
      </a>
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

const secondaryCta: React.CSSProperties = {
  textDecoration: "none",
  border: `1px solid ${theme.colors.border}`,
  color: theme.colors.text,
  padding: "11px 16px",
  borderRadius: 999,
  fontWeight: 800,
  background: theme.colors.surfaceAlt
};

const primaryCta: React.CSSProperties = {
  textDecoration: "none",
  background: theme.colors.gold,
  color: theme.colors.black,
  padding: "12px 18px",
  borderRadius: 999,
  fontWeight: 800
};

const ghostCta: React.CSSProperties = {
  textDecoration: "none",
  border: "1px solid rgba(255,255,255,0.16)",
  color: "white",
  padding: "12px 18px",
  borderRadius: 999,
  fontWeight: 800
};