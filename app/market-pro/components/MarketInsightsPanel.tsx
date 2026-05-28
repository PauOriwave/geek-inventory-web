"use client";

import { getThemeById } from "../../theme";

type MarketOverview = {
  rising: Array<{
    id: string;
    name: string;
    category: string;
    firstValue: number;
    latestValue: number;
    delta: number;
  }>;
  dropping: Array<{
    id: string;
    name: string;
    category: string;
    firstValue: number;
    latestValue: number;
    delta: number;
  }>;
  biggestGaps: Array<{
    id: string;
    name: string;
    category: string;
    estimatedPrice: number;
    marketValue: number;
    gap: number;
    gapPercent: number | null;
  }>;
};

export default function MarketInsightsPanel({
  data,
  locale,
  theme
}: {
  data: MarketOverview;
  locale: "en" | "es";
  theme: ReturnType<typeof getThemeById>;
}) {
  const topRiser = data.rising[0];
  const topDropper = data.dropping[0];

  const hiddenOpportunity = [...data.biggestGaps]
    .filter((item) => item.gap > 0)
    .sort((a, b) => b.gap - a.gap)[0];

  const riskyItem = [...data.biggestGaps]
    .filter((item) => item.gap < 0)
    .sort((a, b) => a.gap - b.gap)[0];

  const text = {
    title:
      locale === "es"
        ? "Market Intelligence"
        : "Market Intelligence",

    subtitle:
      locale === "es"
        ? "Insights automáticos sobre tu colección"
        : "Automatic insights about your collection",

    topRiser:
      locale === "es"
        ? "Mejor rendimiento"
        : "Strongest Performer",

    topDropper:
      locale === "es"
        ? "Mayor caída"
        : "Biggest Drop",

    hiddenOpportunity:
      locale === "es"
        ? "Oportunidad oculta"
        : "Hidden Opportunity",

    risky:
      locale === "es"
        ? "Posible sobrevaloración"
        : "Potential Overvaluation",

    noData:
      locale === "es"
        ? "No hay suficiente información todavía."
        : "Not enough market data yet.",

    performance:
      locale === "es"
        ? "rendimiento"
        : "performance",

    marketAbove:
      locale === "es"
        ? "mercado por encima de tu valoración base"
        : "market above your base estimation",

    marketBelow:
      locale === "es"
        ? "mercado por debajo de tu valoración base"
        : "market below your base estimation"
  };

  const cards = [
    {
      emoji: "🚀",
      title: text.topRiser,
      accent: "#22C55E",
      item: topRiser
        ? {
            name: topRiser.name,
            value: `+${topRiser.delta.toFixed(2)} €`,
            description:
              locale === "es"
                ? `El objeto con mejor rendimiento reciente.`
                : `Your best recent market performer.`
          }
        : null
    },

    {
      emoji: "📉",
      title: text.topDropper,
      accent: "#F43F5E",
      item: topDropper
        ? {
            name: topDropper.name,
            value: `${topDropper.delta.toFixed(2)} €`,
            description:
              locale === "es"
                ? `La mayor caída detectada en tu colección.`
                : `Largest decline detected in your collection.`
          }
        : null
    },

    {
      emoji: "💎",
      title: text.hiddenOpportunity,
      accent: theme.colors.gold,
      item: hiddenOpportunity
        ? {
            name: hiddenOpportunity.name,
            value: `+${hiddenOpportunity.gapPercent?.toFixed(1) ?? "0"}%`,
            description:
              locale === "es"
                ? `${text.marketAbove}.`
                : `${text.marketAbove}.`
          }
        : null
    },

    {
      emoji: "⚠️",
      title: text.risky,
      accent: "#F97316",
      item: riskyItem
        ? {
            name: riskyItem.name,
            value: `${riskyItem.gapPercent?.toFixed(1) ?? "0"}%`,
            description:
              locale === "es"
                ? `${text.marketBelow}.`
                : `${text.marketBelow}.`
          }
        : null
    }
  ];

  return (
    <section
      style={{
        marginBottom: 18,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.xl,
        background: theme.colors.surface,
        boxShadow: theme.shadow.card,
        overflow: "hidden"
      }}
    >
      <div
        style={{
          padding: "18px 20px",
          borderBottom: `1px solid ${theme.colors.border}`,
          background: theme.colors.surfaceAlt
        }}
      >
        <div
          style={{
            fontWeight: 900,
            fontSize: 22,
            color: theme.colors.text
          }}
        >
          {text.title}
        </div>

        <div
          style={{
            marginTop: 6,
            fontSize: 13,
            color: theme.colors.textMuted
          }}
        >
          {text.subtitle}
        </div>
      </div>

      <div
        style={{
          padding: 18,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 14
        }}
      >
        {cards.map((card) => (
          <div
            key={card.title}
            style={{
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radius.lg,
              background: theme.colors.surfaceAlt,
              padding: 16,
              minHeight: 180,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 14
                }}
              >
                <div style={{ fontSize: 24 }}>
                  {card.emoji}
                </div>

                <div
                  style={{
                    fontWeight: 900,
                    color: theme.colors.text,
                    fontSize: 15
                  }}
                >
                  {card.title}
                </div>
              </div>

              {card.item ? (
                <>
                  <div
                    style={{
                      fontWeight: 900,
                      fontSize: 20,
                      color: theme.colors.text,
                      lineHeight: 1.2
                    }}
                  >
                    {card.item.name}
                  </div>

                  <div
                    style={{
                      marginTop: 10,
                      color: card.accent,
                      fontWeight: 900,
                      fontSize: 24
                    }}
                  >
                    {card.item.value}
                  </div>

                  <div
                    style={{
                      marginTop: 12,
                      fontSize: 13,
                      color: theme.colors.textMuted,
                      lineHeight: 1.6
                    }}
                  >
                    {card.item.description}
                  </div>
                </>
              ) : (
                <div
                  style={{
                    color: theme.colors.textMuted,
                    fontSize: 13
                  }}
                >
                  {text.noData}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}