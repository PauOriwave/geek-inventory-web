"use client";

import { getThemeById } from "../../theme";

type MarketOverview = {
  summary?: {
    trackedItems: number;
    baseTotalValue: number;
    marketTotalValue: number;
    totalGap: number;
    totalGapPercent: number | null;
  };

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

  const scoreBreakdown = calculateMarketScore(data);
  const marketScore = scoreBreakdown.score;
  const scoreTone = getScoreTone(marketScore);

  const text = {
    title: "Market Intelligence",

    subtitle:
      locale === "es"
        ? "Insights automáticos sobre tu colección"
        : "Automatic insights about your collection",

    scoreTitle: locale === "es" ? "Collection Power" : "Collection Power",

    scoreSubtitle:
      locale === "es"
        ? "Resumen global de cómo se mueve tu colección"
        : "Overall snapshot of how your collection is moving",

    scoreStrong:
      locale === "es"
        ? "Colección muy fuerte"
        : "Very strong collection",

    scoreHealthy:
      locale === "es"
        ? "Colección saludable"
        : "Healthy collection",

    scoreNeutral:
      locale === "es"
        ? "Colección estable"
        : "Stable collection",

    scoreWeak:
      locale === "es"
        ? "Colección enfriándose"
        : "Collection cooling down",

    scoreDescription:
      locale === "es"
        ? "El score mezcla tendencia del mercado, objetos raros, revalorizaciones y riesgo."
        : "The score combines market trends, hidden gems, appreciation and risk.",

    scoreFactors:
      locale === "es"
        ? "Qué impulsa tu score"
        : "What drives your score",

    dataDepth:
      locale === "es"
        ? "Actividad de colección"
        : "Collection activity",

    dataDepthDescription:
      locale === "es"
        ? "Cuantos más objetos y snapshots tienes, más preciso es el análisis."
        : "More tracked items and snapshots improve analysis quality.",

    gapStrength:
      locale === "es"
        ? "Potencial oculto"
        : "Hidden potential",

    gapStrengthDescription:
      locale === "es"
        ? "Objetos cuyo valor real parece superior al valor base."
        : "Items whose real market value appears higher than expected.",

    opportunity:
      locale === "es"
        ? "Objetos revalorizándose"
        : "Items gaining value",

    opportunityDescription:
      locale === "es"
        ? "Piezas que están aumentando de valor recientemente."
        : "Pieces that are increasing in market value recently.",

    momentum:
      locale === "es"
        ? "Tendencia del mercado"
        : "Market trend",

    momentumDescription:
      locale === "es"
        ? "La velocidad a la que tu colección gana interés."
        : "How quickly your collection gains interest and value.",

    riskPenalty:
      locale === "es"
        ? "Objetos perdiendo interés"
        : "Items losing hype",

    riskPenaltyDescription:
      locale === "es"
        ? "Piezas con bajadas recientes o señales de enfriamiento."
        : "Items showing recent drops or cooling signals.",

    topRiser:
      locale === "es"
        ? "Objeto más caliente"
        : "Hottest Item",

    topDropper:
      locale === "es"
        ? "Objeto enfriándose"
        : "Cooling Down",

    hiddenOpportunity:
      locale === "es"
        ? "Gema oculta"
        : "Hidden Gem",

    risky:
      locale === "es"
        ? "Posible bajada"
        : "Possible Drop",

    noData:
      locale === "es"
        ? "No hay suficiente información todavía."
        : "Not enough market data yet.",

    marketAbove:
      locale === "es"
        ? "El mercado lo valora más alto que tu precio base."
        : "The market values it higher than your base estimate.",

    marketBelow:
      locale === "es"
        ? "El mercado muestra señales de enfriamiento."
        : "The market is showing cooling signals."
  };

  const scoreLabel =
    marketScore >= 80
      ? text.scoreStrong
      : marketScore >= 65
        ? text.scoreHealthy
        : marketScore >= 45
          ? text.scoreNeutral
          : text.scoreWeak;

  const cards = [
    {
      emoji: "🔥",
      title: text.topRiser,
      accent: "#22C55E",
      item: topRiser
        ? {
            name: topRiser.name,
            value: `${topRiser.delta >= 0 ? "+" : ""}${topRiser.delta.toFixed(
              2
            )} €`,
            description:
              locale === "es"
                ? "La pieza con mejor subida reciente."
                : "The best recent market performer."
          }
        : null
    },

    {
      emoji: "🧊",
      title: text.topDropper,
      accent: "#F43F5E",
      item: topDropper
        ? {
            name: topDropper.name,
            value: `${topDropper.delta.toFixed(2)} €`,
            description:
              locale === "es"
                ? "Objeto perdiendo fuerza en el mercado."
                : "Item currently losing momentum."
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
            value: `+${
              hiddenOpportunity.gapPercent != null
                ? hiddenOpportunity.gapPercent.toFixed(1)
                : "0.0"
            }%`,
            description: text.marketAbove
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
            value: `${
              riskyItem.gapPercent != null
                ? riskyItem.gapPercent.toFixed(1)
                : "0.0"
            }%`,
            description: text.marketBelow
          }
        : null
    }
  ];

  const factorRows = [
    {
      label: text.dataDepth,
      description: text.dataDepthDescription,
      value: scoreBreakdown.dataDepthScore,
      max: 25,
      color: "#0B84D8"
    },
    {
      label: text.gapStrength,
      description: text.gapStrengthDescription,
      value: scoreBreakdown.gapScore,
      max: 30,
      color: theme.colors.gold
    },
    {
      label: text.opportunity,
      description: text.opportunityDescription,
      value: scoreBreakdown.opportunityScore,
      max: 20,
      color: theme.colors.success
    },
    {
      label: text.momentum,
      description: text.momentumDescription,
      value: scoreBreakdown.momentumScore,
      max: 25,
      color: "#8B5CF6"
    },
    {
      label: text.riskPenalty,
      description: text.riskPenaltyDescription,
      value: scoreBreakdown.riskPenalty,
      max: 20,
      color: theme.colors.danger,
      penalty: true
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
          gridTemplateColumns: "minmax(280px, 0.95fr) minmax(0, 2fr)",
          gap: 14
        }}
      >
        <div
          style={{
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.radius.lg,
            background:
              scoreTone === "strong"
                ? "linear-gradient(135deg, rgba(34,197,94,0.16) 0%, rgba(255,255,255,0) 75%)"
                : scoreTone === "healthy"
                  ? "linear-gradient(135deg, rgba(200,164,77,0.18) 0%, rgba(255,255,255,0) 75%)"
                  : scoreTone === "neutral"
                    ? "linear-gradient(135deg, rgba(148,163,184,0.18) 0%, rgba(255,255,255,0) 75%)"
                    : "linear-gradient(135deg, rgba(244,63,94,0.14) 0%, rgba(255,255,255,0) 75%)",
            padding: 18,
            minHeight: 220,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 900,
                color: theme.colors.textMuted,
                marginBottom: 8
              }}
            >
              {text.scoreTitle}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 8,
                marginBottom: 10
              }}
            >
              <div
                style={{
                  fontSize: 54,
                  lineHeight: 1,
                  fontWeight: 950,
                  color:
                    scoreTone === "strong"
                      ? theme.colors.success
                      : scoreTone === "weak"
                        ? theme.colors.danger
                        : theme.colors.text
                }}
              >
                {marketScore}
              </div>

              <div
                style={{
                  paddingBottom: 7,
                  color: theme.colors.textMuted,
                  fontWeight: 900
                }}
              >
                / 100
              </div>
            </div>

            <div
              style={{
                fontWeight: 900,
                color: theme.colors.text,
                fontSize: 16
              }}
            >
              {scoreLabel}
            </div>

            <div
              style={{
                marginTop: 8,
                fontSize: 13,
                color: theme.colors.textMuted,
                lineHeight: 1.6
              }}
            >
              {text.scoreSubtitle}
            </div>
          </div>

          <div
            style={{
              marginTop: 16
            }}
          >
            <div
              style={{
                width: "100%",
                height: 10,
                borderRadius: 999,
                background: theme.colors.surface,
                border: `1px solid ${theme.colors.border}`,
                overflow: "hidden"
              }}
            >
              <div
                style={{
                  width: `${marketScore}%`,
                  height: "100%",
                  borderRadius: 999,
                  background:
                    scoreTone === "strong"
                      ? theme.colors.success
                      : scoreTone === "healthy"
                        ? theme.colors.gold
                        : scoreTone === "neutral"
                          ? theme.colors.textMuted
                          : theme.colors.danger
                }}
              />
            </div>

            <div
              style={{
                marginTop: 10,
                fontSize: 12,
                color: theme.colors.textMuted,
                lineHeight: 1.5
              }}
            >
              {text.scoreDescription}
            </div>
          </div>

          <div
            style={{
              marginTop: 18,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radius.md,
              background: theme.colors.surface,
              padding: 12
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 900,
                color: theme.colors.text,
                marginBottom: 10
              }}
            >
              {text.scoreFactors}
            </div>

            <div
              style={{
                display: "grid",
                gap: 12
              }}
            >
              {factorRows.map((factor) => (
                <ScoreFactorRow
                  key={factor.label}
                  label={factor.label}
                  description={factor.description}
                  value={factor.value}
                  max={factor.max}
                  color={factor.color}
                  penalty={factor.penalty}
                  theme={theme}
                />
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
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
                  <div style={{ fontSize: 24 }}>{card.emoji}</div>

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
      </div>
    </section>
  );
}

function ScoreFactorRow({
  label,
  description,
  value,
  max,
  color,
  penalty,
  theme
}: {
  label: string;
  description: string;
  value: number;
  max: number;
  color: string;
  penalty?: boolean;
  theme: ReturnType<typeof getThemeById>;
}) {
  const width = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
          alignItems: "center",
          marginBottom: 5
        }}
      >
        <span
          style={{
            color: theme.colors.text,
            fontSize: 12,
            fontWeight: 900
          }}
        >
          {label}
        </span>

        <span
          style={{
            color: penalty ? theme.colors.danger : theme.colors.text,
            fontSize: 11,
            fontWeight: 900
          }}
        >
          {penalty ? "-" : "+"}
          {Math.round(value)}
        </span>
      </div>

      <div
        style={{
          color: theme.colors.textMuted,
          fontSize: 11,
          lineHeight: 1.5,
          marginBottom: 7
        }}
      >
        {description}
      </div>

      <div
        style={{
          height: 7,
          borderRadius: 999,
          background: theme.colors.surfaceAlt,
          border: `1px solid ${theme.colors.border}`,
          overflow: "hidden"
        }}
      >
        <div
          style={{
            width: `${width}%`,
            height: "100%",
            borderRadius: 999,
            background: color,
            opacity: penalty ? 0.7 : 1
          }}
        />
      </div>
    </div>
  );
}

function calculateMarketScore(data: MarketOverview) {
  const trackedItems = data.summary?.trackedItems ?? 0;
  const totalGapPercent = data.summary?.totalGapPercent ?? 0;

  const positiveMomentum = data.rising.reduce((acc, item) => {
    return acc + Math.max(0, item.delta);
  }, 0);

  const negativeMomentum = data.dropping.reduce((acc, item) => {
    return acc + Math.abs(Math.min(0, item.delta));
  }, 0);

  const positiveGaps = data.biggestGaps.filter((item) => item.gap > 0).length;
  const negativeGaps = data.biggestGaps.filter((item) => item.gap < 0).length;

  const dataDepthScore = Math.min(25, trackedItems * 2);
  const gapScore = clamp(25 + totalGapPercent, 0, 30);
  const opportunityScore = Math.min(20, positiveGaps * 4);
  const riskPenalty = Math.min(20, negativeGaps * 4);

  const momentumBase = positiveMomentum + negativeMomentum;

  const momentumScore =
    momentumBase > 0
      ? clamp((positiveMomentum / momentumBase) * 25, 0, 25)
      : 10;

  const rawScore =
    dataDepthScore + gapScore + opportunityScore + momentumScore - riskPenalty;

  return {
    score: Math.round(clamp(rawScore, 0, 100)),
    dataDepthScore,
    gapScore,
    opportunityScore,
    momentumScore,
    riskPenalty
  };
}

function getScoreTone(score: number): "strong" | "healthy" | "neutral" | "weak" {
  if (score >= 80) return "strong";
  if (score >= 65) return "healthy";
  if (score >= 45) return "neutral";
  return "weak";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}