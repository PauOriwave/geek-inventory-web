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
  const currentPlan = me?.plan ?? "free";

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
      locale === "es" ? "Empezar gratis" : "Start free",
    upgradeCollector:
      locale === "es" ? "Pasar a Collector" : "Upgrade to Collector",
    upgradeMarket:
      locale === "es" ? "Pasar a Market Pro" : "Upgrade to Market Pro",

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
        : "Free gets you started. Collector gives you real control over your collection. Market Pro adds the premium layer for users who want to use wishlist as a buying radar."
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
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 10
          }}
        >
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

        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 18,
            flexWrap: "wrap"
          }}
        >
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

        <section
          style={{
            background: theme.colors.black,
            color: "white",
            borderRadius: theme.radius.xl,
            padding: "20px 22px",
            marginBottom: 20,
            boxShadow: theme.shadow.card
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              alignItems: "center",
              flexWrap: "wrap"
            }}
          >
            <div style={{ maxWidth: 820 }}>
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
          <div
            style={{
              marginBottom: 14
            }}
          >
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

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 18
            }}
          >
            {plans.map((plan) => {
              const isCurrent =
                (currentPlan === "free" && plan.key === "free") ||
                (currentPlan === "premium" && plan.key === "premium") ||
                (currentPlan === "market_pro" && plan.key === "market_pro");

              return (
                <article
                  key={plan.key}
                  style={{
                    borderRadius: theme.radius.xl,
                    padding: 22,
                    border: `1px solid ${
                      plan.highlight ? theme.colors.gold : theme.colors.border
                    }`,
                    background: plan.highlight
                      ? theme.colors.black
                      : theme.colors.surface,
                    color: plan.highlight ? "white" : theme.colors.text,
                    boxShadow: theme.shadow.card,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: 420
                  }}
                >
                  <div>
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
                          opacity: 0.78
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
                      ) : null}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 4,
                        marginBottom: 8
                      }}
                    >
                      <div
                        style={{
                          fontSize: 34,
                          fontWeight: 900
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
                        opacity: 0.82,
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
                              color: plan.highlight
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
                    href={`/profile?lang=${locale}`}
                    style={{
                      marginTop: 20,
                      textDecoration: "none",
                      borderRadius: 999,
                      padding: "12px 16px",
                      textAlign: "center",
                      fontWeight: 900,
                      background: plan.highlight
                        ? "white"
                        : theme.colors.black,
                      color: plan.highlight ? "black" : "white"
                    }}
                  >
                    {isCurrent ? text.current : plan.cta}
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

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse"
              }}
            >
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
        background: theme.colors.surfaceAlt
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
        fontSize: 14
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