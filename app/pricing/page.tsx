import { cookies } from "next/headers";
import { getThemeById, AppThemeId } from "../theme";
import { getLocale } from "../i18n";

type Me = {
  id: string;
  email?: string;
  plan?: string;
};

const API = process.env.NEXT_PUBLIC_API_URL!;

async function getMe(cookie: string): Promise<Me | null> {
  try {
    const res = await fetch(`${API}/auth/me`, {
      cache: "no-store",
      headers: { cookie }
    });

    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function normalizePlan(plan?: string | null) {
  const value = (plan ?? "free").toLowerCase().trim();

  if (value === "premium") return "premium";
  if (
    value === "market_pro" ||
    value === "market-pro" ||
    value === "marketpro"
  ) {
    return "market_pro";
  }

  return "free";
}

export default async function PricingPage({
  searchParams
}: {
  searchParams?:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
}) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const sp =
    searchParams instanceof Promise ? await searchParams : searchParams ?? {};

  const locale = getLocale(sp);

  const themeId =
    (cookieStore.get("ui_theme")?.value as AppThemeId | undefined) ?? "classic";
  const theme = getThemeById(themeId);

  const me = await getMe(cookieHeader);
  const currentPlan = normalizePlan(me?.plan);

  const langEnHref = `/pricing?lang=en`;
  const langEsHref = `/pricing?lang=es`;

  const text = {
    collection: locale === "es" ? "Colección" : "Collection",
    profile: locale === "es" ? "Perfil" : "Profile",
    wishlist: "Wishlist",
    activeSection: locale === "es" ? "Planes" : "Pricing",

    title:
      locale === "es"
        ? "Elige cómo quieres usar DrakoryVault"
        : "Choose how you want to use DrakoryVault",

    subtitle:
      locale === "es"
        ? "Empieza organizando tu colección, escala a herramientas avanzadas y desbloquea una capa market para decisiones más inteligentes."
        : "Start by organizing your collection, scale to advanced tools, and unlock a market layer for smarter decisions.",

    sectionTitle:
      locale === "es" ? "Planes disponibles" : "Available plans",

    sectionSub:
      locale === "es"
        ? "Tres niveles para tres formas distintas de vivir la colección."
        : "Three tiers for three different ways to live your collection.",

    currentPlan:
      locale === "es" ? "Tu plan actual" : "Your current plan",

    free: locale === "es" ? "Starter Collector" : "Starter Collector",
    collector: "Collector",
    marketPro: "Market Pro",

    perMonth: locale === "es" ? "/mes" : "/month",

    freeDesc:
      locale === "es"
        ? "Para empezar tu colección y probar la app."
        : "To start your collection and try the app.",

    collectorDesc:
      locale === "es"
        ? "Para quien quiere dominar y valorar su colección."
        : "For people who want to manage and value their collection seriously.",

    marketDesc:
      locale === "es"
        ? "Para usuarios avanzados que quieren señales, oportunidades y visión de mercado."
        : "For advanced users who want signals, opportunities and market visibility.",

    current:
      locale === "es" ? "Plan actual" : "Current plan",
    startFree:
      locale === "es" ? "Seguir en Starter" : "Stay on Starter",
    upgradeCollector:
      locale === "es" ? "Pasar a Collector" : "Upgrade to Collector",
    upgradeMarket:
      locale === "es" ? "Pasar a Market Pro" : "Upgrade to Market Pro",
    included: locale === "es" ? "Incluido en tu plan" : "Included in your plan",
    downgrade:
      locale === "es" ? "Plan inferior" : "Lower tier",

    compare:
      locale === "es" ? "Comparativa rápida" : "Quick comparison",

    bestFor:
      locale === "es" ? "Ideal para" : "Best for",

    freeBest:
      locale === "es"
        ? "Usuarios que empiezan y quieren ordenar su colección."
        : "People getting started who want to organize their collection.",

    collectorBest:
      locale === "es"
        ? "Coleccionistas serios que quieren profundidad, valoración y control."
        : "Serious collectors who want depth, valuation and control.",

    marketBest:
      locale === "es"
        ? "Usuarios avanzados que quieren convertir wishlist en una capa de decisión."
        : "Advanced users who want to turn wishlist into a decision layer.",

    freeFeatures:
      locale === "es"
        ? [
            "Hasta 25 items",
            "Hasta 10 items en wishlist",
            "Valoración manual individual",
            "Perfil y logros básicos",
            "Themes básicos",
            "Wishlist con objetivo y oferta"
          ]
        : [
            "Up to 25 items",
            "Up to 10 wishlist items",
            "Manual individual valuation",
            "Basic profile and achievements",
            "Basic themes",
            "Wishlist with target and offer"
          ],

    collectorFeatures:
      locale === "es"
        ? [
            "Items ilimitados",
            "Wishlist ilimitada",
            "Valuate all",
            "Mejores estadísticas",
            "Themes por fidelización",
            "Wishlist más potente"
          ]
        : [
            "Unlimited items",
            "Unlimited wishlist",
            "Valuate all",
            "Better collection stats",
            "Loyalty themes",
            "Stronger wishlist experience"
          ],

    marketFeatures:
      locale === "es"
        ? [
            "Todo lo de Collector",
            "Market Watch",
            "Señales de oportunidad",
            "Priorización por target",
            "Lectura market más avanzada",
            "Base para alertas futuras"
          ]
        : [
            "Everything in Collector",
            "Market Watch",
            "Opportunity signals",
            "Target-based prioritization",
            "More advanced market view",
            "Foundation for future alerts"
          ],

    feature: locale === "es" ? "Feature" : "Feature",
    starter: locale === "es" ? "Starter" : "Starter",
    yes: locale === "es" ? "Sí" : "Yes",
    no: locale === "es" ? "No" : "No",
    unlimited: locale === "es" ? "Ilimitado" : "Unlimited",

    summaryTitle:
      locale === "es"
        ? "La lógica detrás de los planes"
        : "The logic behind the plans",

    summaryText:
      locale === "es"
        ? "Free te deja empezar. Collector te da control real sobre tu colección. Market Pro añade la capa premium para quienes quieren usar la wishlist como radar de compra."
        : "Free gets you started. Collector gives you real control over your collection. Market Pro adds the premium layer for users who want to use wishlist as a buying radar.",

    heroTag:
      locale === "es"
        ? "Escala desde organización hasta inteligencia de mercado"
        : "Scale from organization to market intelligence",

    marketProCallout:
      locale === "es"
        ? "Market Pro está pensado como tu capa premium de decisión: movers, gaps y señales para comprar mejor."
        : "Market Pro is designed as your premium decision layer: movers, gaps and signals to buy smarter.",

    seeMarketPro:
      locale === "es" ? "Ver teaser Market Pro" : "See Market Pro teaser"
  };

  const plans = [
    {
      key: "free",
      name: text.free,
      price: "0€",
      desc: text.freeDesc,
      bestFor: text.freeBest,
      cta: text.startFree,
      highlight: false,
      features: text.freeFeatures
    },
    {
      key: "premium",
      name: text.collector,
      price: "4.99€",
      desc: text.collectorDesc,
      bestFor: text.collectorBest,
      cta: text.upgradeCollector,
      highlight: true,
      features: text.collectorFeatures
    },
    {
      key: "market_pro",
      name: text.marketPro,
      price: "9.99€",
      desc: text.marketDesc,
      bestFor: text.marketBest,
      cta: text.upgradeMarket,
      highlight: false,
      features: text.marketFeatures
    }
  ] as const;

  const comparisonRows = [
    {
      name: locale === "es" ? "Items en colección" : "Collection items",
      free: "25",
      collector: text.unlimited,
      market: text.unlimited
    },
    {
      name: locale === "es" ? "Wishlist" : "Wishlist",
      free: "10",
      collector: text.unlimited,
      market: text.unlimited
    },
    {
      name: locale === "es" ? "Valuate all" : "Valuate all",
      free: text.no,
      collector: text.yes,
      market: text.yes
    },
    {
      name: locale === "es" ? "Themes loyalty" : "Loyalty themes",
      free: text.no,
      collector: text.yes,
      market: text.yes
    },
    {
      name: "Market Watch",
      free: text.no,
      collector: text.no,
      market: text.yes
    },
    {
      name: locale === "es" ? "Señales de mercado" : "Market signals",
      free: text.no,
      collector: text.no,
      market: text.yes
    }
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: theme.colors.bg,
        color: theme.colors.text,
        padding: 24,
        fontFamily: "system-ui"
      }}
    >
      <style>{`
        .pricing-shell {
          max-width: 1180px;
          margin: 0 auto;
        }

        .pricing-topbar {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 10px;
        }

        .pricing-nav {
          display: flex;
          gap: 10px;
          margin-bottom: 18px;
          flex-wrap: wrap;
        }

        .pricing-hero {
          background: ${theme.colors.black};
          color: white;
          border-radius: ${theme.radius.xl}px;
          padding: 22px 24px;
          margin-bottom: 20px;
          box-shadow: ${theme.shadow.card};
        }

        .pricing-hero-inner {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: center;
          flex-wrap: wrap;
        }

        .pricing-plans-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
        }

        .pricing-compare-wrap {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .pricing-compare-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 680px;
        }

        @media (min-width: 768px) {
          .pricing-plans-grid {
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          }
        }

        @media (max-width: 767px) {
          .pricing-shell {
            max-width: 100%;
          }

          .pricing-topbar {
            justify-content: flex-start;
          }

          .pricing-hero {
            padding: 16px;
            border-radius: ${theme.radius.lg}px;
          }
        }
      `}</style>

      <div className="pricing-shell">
        <div className="pricing-topbar">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 10px",
              borderRadius: 999,
              background: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`
            }}
          >
            <a
              href={langEnHref}
              style={{
                textDecoration: "none",
                fontWeight: 800,
                fontSize: 13,
                color:
                  locale === "en"
                    ? theme.colors.text
                    : theme.colors.textMuted
              }}
            >
              EN
            </a>

            <span style={{ color: theme.colors.textMuted }}>/</span>

            <a
              href={langEsHref}
              style={{
                textDecoration: "none",
                fontWeight: 800,
                fontSize: 13,
                color:
                  locale === "es"
                    ? theme.colors.text
                    : theme.colors.textMuted
              }}
            >
              ES
            </a>
          </div>
        </div>

        <div className="pricing-nav">
          <a href={`/items?lang=${locale}`} style={navLink(theme)}>
            {text.collection}
          </a>

          <a href={`/profile?lang=${locale}`} style={navLink(theme)}>
            {text.profile}
          </a>

          <a href={`/wishlist?lang=${locale}`} style={navLink(theme)}>
            {text.wishlist}
          </a>

          <span
            style={{
              borderRadius: 999,
              padding: "10px 14px",
              background: theme.colors.black,
              color: "white",
              fontWeight: 800,
              border: `1px solid ${theme.colors.black}`
            }}
          >
            {text.activeSection}
          </span>
        </div>

        <section className="pricing-hero">
          <div className="pricing-hero-inner">
            <div style={{ maxWidth: 820 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "rgba(212,175,55,0.14)",
                  color: theme.colors.gold,
                  fontWeight: 900,
                  fontSize: 12,
                  marginBottom: 12
                }}
              >
                {text.heroTag}
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: 34,
                  lineHeight: 1.08,
                  fontWeight: 900
                }}
              >
                {text.title}
              </h1>

              <p
                style={{
                  marginTop: 10,
                  marginBottom: 0,
                  color: "rgba(255,255,255,0.78)",
                  lineHeight: 1.65,
                  fontSize: 15
                }}
              >
                {text.subtitle}
              </p>

              <div
                style={{
                  marginTop: 14,
                  color: "rgba(255,255,255,0.82)",
                  lineHeight: 1.65,
                  fontSize: 14,
                  maxWidth: 760
                }}
              >
                {text.marketProCallout}
              </div>

              <div style={{ marginTop: 16 }}>
                <a
                  href={`/market-pro?lang=${locale}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    textDecoration: "none",
                    borderRadius: 999,
                    padding: "10px 14px",
                    background: "rgba(255,255,255,0.08)",
                    color: "white",
                    fontWeight: 900,
                    border: "1px solid rgba(255,255,255,0.12)"
                  }}
                >
                  {text.seeMarketPro}
                </a>
              </div>
            </div>

            <div
              style={{
                padding: "10px 14px",
                borderRadius: 999,
                background: theme.colors.gold,
                color: theme.colors.black,
                fontWeight: 900,
                fontSize: 13
              }}
            >
              {text.currentPlan}: {formatPlan(currentPlan, locale)}
            </div>
          </div>
        </section>

        <section style={{ marginBottom: 20 }}>
          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                fontWeight: 900,
                fontSize: 18,
                color: theme.colors.text
              }}
            >
              {text.sectionTitle}
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: 14,
                color: theme.colors.textMuted
              }}
            >
              {text.sectionSub}
            </div>
          </div>

          <div className="pricing-plans-grid">
            {plans.map((plan) => {
              const isCurrent =
                (currentPlan === "free" && plan.key === "free") ||
                (currentPlan === "premium" && plan.key === "premium") ||
                (currentPlan === "market_pro" && plan.key === "market_pro");

              const isLowerTierThanCurrent =
                (currentPlan === "premium" && plan.key === "free") ||
                (currentPlan === "market_pro" &&
                  (plan.key === "free" || plan.key === "premium"));

              const ctaLabel = isCurrent
                ? text.current
                : isLowerTierThanCurrent
                  ? text.included
                  : plan.cta;

              const ctaHref = isCurrent
                ? `/profile?lang=${locale}`
                : plan.key === "market_pro"
                  ? `/market-pro?lang=${locale}`
                  : `/profile?lang=${locale}`;

              return (
                <article
                  key={plan.key}
                  style={{
                    position: "relative",
                    borderRadius: theme.radius.xl,
                    padding: 22,
                    border: `1px solid ${
                      plan.highlight
                        ? theme.colors.gold
                        : plan.key === "market_pro"
                          ? "rgba(212,175,55,0.34)"
                          : theme.colors.border
                    }`,
                    background: plan.highlight
                      ? theme.colors.black
                      : plan.key === "market_pro"
                        ? "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(250,250,250,1) 100%)"
                        : theme.colors.surface,
                    color: plan.highlight ? "white" : theme.colors.text,
                    boxShadow: theme.shadow.card,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: 460,
                    overflow: "hidden"
                  }}
                >
                  {plan.highlight && (
                    <div
                      style={{
                        position: "absolute",
                        top: 14,
                        right: 14,
                        padding: "5px 9px",
                        borderRadius: 999,
                        background: "rgba(212,175,55,0.18)",
                        color: theme.colors.gold,
                        fontSize: 11,
                        fontWeight: 900,
                        border: "1px solid rgba(212,175,55,0.22)"
                      }}
                    >
                      POPULAR
                    </div>
                  )}

                  {plan.key === "market_pro" && (
                    <div
                      style={{
                        position: "absolute",
                        top: -36,
                        right: -26,
                        width: 120,
                        height: 120,
                        borderRadius: 999,
                        background: "rgba(212,175,55,0.10)"
                      }}
                    />
                  )}

                  <div style={{ position: "relative" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 10,
                        alignItems: "center",
                        flexWrap: "wrap",
                        marginBottom: 10
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 900,
                          opacity: 0.82
                        }}
                      >
                        {plan.name}
                      </div>

                      {isCurrent ? (
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: 999,
                            background: plan.highlight
                              ? "rgba(255,255,255,0.12)"
                              : theme.colors.surfaceAlt,
                            color: plan.highlight ? "white" : theme.colors.text,
                            fontSize: 11,
                            fontWeight: 900,
                            border: `1px solid ${
                              plan.highlight
                                ? "rgba(255,255,255,0.15)"
                                : theme.colors.border
                            }`
                          }}
                        >
                          {text.current}
                        </span>
                      ) : isLowerTierThanCurrent ? (
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: 999,
                            background: theme.colors.surfaceAlt,
                            color: theme.colors.textMuted,
                            fontSize: 11,
                            fontWeight: 900,
                            border: `1px solid ${theme.colors.border}`
                          }}
                        >
                          {text.downgrade}
                        </span>
                      ) : null}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 4,
                        marginBottom: 8,
                        flexWrap: "wrap"
                      }}
                    >
                      <div
                        style={{
                          fontSize: 34,
                          fontWeight: 900,
                          wordBreak: "break-word"
                        }}
                      >
                        {plan.price}
                      </div>

                      {plan.price !== "0€" && (
                        <div
                          style={{
                            fontSize: 14,
                            opacity: 0.72
                          }}
                        >
                          {text.perMonth}
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        fontSize: 14,
                        lineHeight: 1.65,
                        opacity: 0.84,
                        marginBottom: 14
                      }}
                    >
                      {plan.desc}
                    </div>

                    <div
                      style={{
                        marginBottom: 14,
                        padding: "12px 14px",
                        borderRadius: theme.radius.lg,
                        background: plan.highlight
                          ? "rgba(255,255,255,0.08)"
                          : theme.colors.surfaceAlt,
                        border: `1px solid ${
                          plan.highlight
                            ? "rgba(255,255,255,0.10)"
                            : theme.colors.border
                        }`
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          opacity: 0.74,
                          marginBottom: 6
                        }}
                      >
                        {text.bestFor}
                      </div>

                      <div
                        style={{
                          fontSize: 13,
                          lineHeight: 1.6
                        }}
                      >
                        {plan.bestFor}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gap: 8
                      }}
                    >
                      {plan.features.map((feature) => (
                        <div
                          key={feature}
                          style={{
                            fontSize: 14,
                            lineHeight: 1.5,
                            display: "flex",
                            gap: 8,
                            alignItems: "flex-start"
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 900,
                              color:
                                plan.highlight || plan.key === "market_pro"
                                  ? theme.colors.gold
                                  : theme.colors.text
                            }}
                          >
                            •
                          </span>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <a
                    href={ctaHref}
                    style={{
                      marginTop: 20,
                      textDecoration: "none",
                      borderRadius: 999,
                      padding: "12px 16px",
                      textAlign: "center",
                      fontWeight: 900,
                      background: isCurrent
                        ? theme.colors.surfaceAlt
                        : plan.highlight
                          ? "white"
                          : plan.key === "market_pro"
                            ? theme.colors.gold
                            : theme.colors.black,
                      color: isCurrent
                        ? theme.colors.text
                        : plan.highlight
                          ? "black"
                          : plan.key === "market_pro"
                            ? theme.colors.black
                            : "white",
                      border: isCurrent
                        ? `1px solid ${theme.colors.border}`
                        : "none",
                      pointerEvents: isLowerTierThanCurrent ? "none" : "auto",
                      opacity: isLowerTierThanCurrent ? 0.6 : 1
                    }}
                  >
                    {ctaLabel}
                  </a>
                </article>
              );
            })}
          </div>
        </section>

        <section
          style={{
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.radius.xl,
            background: theme.colors.surface,
            boxShadow: theme.shadow.card,
            overflow: "hidden",
            marginBottom: 20
          }}
        >
          <div
            style={{
              padding: "16px 18px",
              borderBottom: `1px solid ${theme.colors.border}`,
              background: theme.colors.surfaceAlt
            }}
          >
            <div
              style={{
                fontWeight: 900,
                fontSize: 16
              }}
            >
              {text.compare}
            </div>
          </div>

          <div className="pricing-compare-wrap">
            <table className="pricing-compare-table">
              <thead>
                <tr>
                  <PricingTh theme={theme}>{text.feature}</PricingTh>
                  <PricingTh theme={theme}>{text.starter}</PricingTh>
                  <PricingTh theme={theme}>Collector</PricingTh>
                  <PricingTh theme={theme}>Market Pro</PricingTh>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.name}>
                    <PricingTd theme={theme}>{row.name}</PricingTd>
                    <PricingTd theme={theme}>{row.free}</PricingTd>
                    <PricingTd theme={theme}>{row.collector}</PricingTd>
                    <PricingTd theme={theme}>{row.market}</PricingTd>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section
          style={{
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.radius.xl,
            background: theme.colors.surface,
            boxShadow: theme.shadow.soft,
            padding: 18
          }}
        >
          <div
            style={{
              fontWeight: 900,
              fontSize: 16,
              marginBottom: 8
            }}
          >
            {text.summaryTitle}
          </div>

          <div
            style={{
              color: theme.colors.textMuted,
              lineHeight: 1.7,
              fontSize: 14
            }}
          >
            {text.summaryText}
          </div>
        </section>
      </div>
    </main>
  );
}

function navLink(theme: ReturnType<typeof getThemeById>): React.CSSProperties {
  return {
    textDecoration: "none",
    borderRadius: 999,
    padding: "10px 14px",
    background: theme.colors.surface,
    color: theme.colors.text,
    fontWeight: 800,
    border: `1px solid ${theme.colors.border}`
  };
}

function PricingTh({
  children,
  theme
}: {
  children: React.ReactNode;
  theme: ReturnType<typeof getThemeById>;
}) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: 14,
        fontSize: 12,
        color: theme.colors.textMuted,
        borderBottom: `1px solid ${theme.colors.border}`,
        background: theme.colors.surfaceAlt,
        whiteSpace: "nowrap"
      }}
    >
      {children}
    </th>
  );
}

function PricingTd({
  children,
  theme
}: {
  children: React.ReactNode;
  theme: ReturnType<typeof getThemeById>;
}) {
  return (
    <td
      style={{
        padding: 14,
        borderBottom: `1px solid ${theme.colors.border}`,
        color: theme.colors.text,
        fontSize: 14,
        whiteSpace: "nowrap"
      }}
    >
      {children}
    </td>
  );
}

function formatPlan(plan: string, locale: "en" | "es") {
  if (plan === "premium") return "Collector";
  if (plan === "market_pro") return "Market Pro";
  return locale === "es" ? "Starter Collector" : "Starter Collector";
}