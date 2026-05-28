"use client";

import { getThemeById } from "../../theme";

type CompareItem = {
  id: string;
  name: string;
  category: string;
  platform?: string | null;
  marketValue?: string | number | null;
};

type Snapshot = {
  id: string;
  source: string;
  marketValue: string | number;
  confidence?: number | null;
  recordedAt: string;
};

type CompareMode = "performance" | "absolute";

export default function CompareMetrics({
  itemA,
  itemB,
  snapshotsA,
  snapshotsB,
  mode,
  locale,
  theme
}: {
  itemA: CompareItem;
  itemB: CompareItem;
  snapshotsA: Snapshot[];
  snapshotsB: Snapshot[];
  mode: CompareMode;
  locale: "en" | "es";
  theme: ReturnType<typeof getThemeById>;
}) {
  const metricsA = buildMetrics(snapshotsA);
  const metricsB = buildMetrics(snapshotsB);

  const performanceDiff =
    metricsA.growthPercent != null && metricsB.growthPercent != null
      ? metricsA.growthPercent - metricsB.growthPercent
      : null;

  const valueSpread =
    metricsA.latestValue != null && metricsB.latestValue != null
      ? metricsA.latestValue - metricsB.latestValue
      : null;

  const winner =
    metricsA.growthPercent != null && metricsB.growthPercent != null
      ? metricsA.growthPercent >= metricsB.growthPercent
        ? itemA.name
        : itemB.name
      : null;

  const stabilityWinner =
    metricsA.volatility <= metricsB.volatility ? itemA.name : itemB.name;

  const text = {
    current: locale === "es" ? "Valor actual" : "Current value",
    growth: locale === "es" ? "Rendimiento" : "Performance",
    delta: locale === "es" ? "Cambio" : "Change",
    volatility: locale === "es" ? "Volatilidad" : "Volatility",
    dataPoints: locale === "es" ? "Snapshots" : "Snapshots",
    winner: locale === "es" ? "Mejor rendimiento" : "Best performer",
    stability: locale === "es" ? "Más estable" : "Most stable",
    spread: locale === "es" ? "Spread actual" : "Current spread",
    outperform:
      locale === "es" ? "Diferencia rendimiento" : "Performance gap",
    mode:
      mode === "performance"
        ? locale === "es"
          ? "Comparación normalizada"
          : "Normalized comparison"
        : locale === "es"
          ? "Comparación por valor absoluto"
          : "Absolute value comparison",
    noWinner: locale === "es" ? "Sin ganador claro" : "No clear winner",
    low: locale === "es" ? "Baja" : "Low",
    medium: locale === "es" ? "Media" : "Medium",
    high: locale === "es" ? "Alta" : "High",
    explanation:
      mode === "performance"
        ? locale === "es"
          ? "Ambos objetos empiezan en 100%, así puedes comparar cuál ha evolucionado mejor aunque tengan precios distintos."
          : "Both items start at 100%, so you can compare which one performed better even if prices differ."
        : locale === "es"
          ? "Muestra el valor de mercado real en euros para cada objeto."
          : "Shows the real market value in euros for each item."
  };

  return (
    <div
      style={{
        marginTop: 14,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 12
      }}
    >
      <ItemMetricCard
        item={itemA}
        accent="#0B84D8"
        metrics={metricsA}
        text={text}
        theme={theme}
      />

      <ItemMetricCard
        item={itemB}
        accent={theme.colors.gold}
        metrics={metricsB}
        text={text}
        theme={theme}
      />

      <div
        style={{
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radius.lg,
          background:
            "linear-gradient(135deg, rgba(15,23,42,0.04) 0%, rgba(200,164,77,0.10) 100%)",
          padding: 16,
          minWidth: 0
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: theme.colors.textMuted,
            fontWeight: 900,
            marginBottom: 8
          }}
        >
          {text.mode}
        </div>

        <div
          style={{
            fontSize: 13,
            color: theme.colors.textMuted,
            lineHeight: 1.6,
            marginBottom: 14
          }}
        >
          {text.explanation}
        </div>

        <div
          style={{
            display: "grid",
            gap: 10
          }}
        >
          <InsightMetric
            label={text.winner}
            value={winner ?? text.noWinner}
            theme={theme}
          />

          <InsightMetric
            label={text.outperform}
            value={
              performanceDiff != null
                ? `${performanceDiff >= 0 ? "+" : ""}${performanceDiff.toFixed(1)} pts`
                : "—"
            }
            accent={
              performanceDiff != null
                ? performanceDiff > 0
                  ? theme.colors.success
                  : performanceDiff < 0
                    ? theme.colors.danger
                    : theme.colors.text
                : undefined
            }
            theme={theme}
          />

          <InsightMetric
            label={text.spread}
            value={
              valueSpread != null
                ? `${valueSpread >= 0 ? "+" : ""}${valueSpread.toFixed(2)} €`
                : "—"
            }
            theme={theme}
          />

          <InsightMetric
            label={text.stability}
            value={stabilityWinner}
            theme={theme}
          />
        </div>
      </div>
    </div>
  );
}

function ItemMetricCard({
  item,
  accent,
  metrics,
  text,
  theme
}: {
  item: CompareItem;
  accent: string;
  metrics: ReturnType<typeof buildMetrics>;
  text: {
    current: string;
    growth: string;
    delta: string;
    volatility: string;
    dataPoints: string;
    low: string;
    medium: string;
    high: string;
  };
  theme: ReturnType<typeof getThemeById>;
}) {
  const volatilityLabel =
    metrics.volatilityLevel === "low"
      ? text.low
      : metrics.volatilityLevel === "medium"
        ? text.medium
        : text.high;

  return (
    <div
      style={{
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.lg,
        background: theme.colors.surfaceAlt,
        padding: 16,
        minWidth: 0
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: 14,
          minWidth: 0
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            background: accent,
            flexShrink: 0
          }}
        />
        <div
          style={{
            fontWeight: 900,
            color: theme.colors.text,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          {item.name}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 10
        }}
      >
        <SmallMetric
          label={text.current}
          value={
            metrics.latestValue != null
              ? `${metrics.latestValue.toFixed(2)} €`
              : "—"
          }
          theme={theme}
        />
        <SmallMetric
          label={text.growth}
          value={
            metrics.growthPercent != null
              ? `${metrics.growthPercent >= 0 ? "+" : ""}${metrics.growthPercent.toFixed(1)}%`
              : "—"
          }
          accent={
            metrics.growthPercent != null
              ? metrics.growthPercent > 0
                ? theme.colors.success
                : metrics.growthPercent < 0
                  ? theme.colors.danger
                  : theme.colors.text
              : undefined
          }
          theme={theme}
        />
        <SmallMetric
          label={text.delta}
          value={
            metrics.delta != null
              ? `${metrics.delta >= 0 ? "+" : ""}${metrics.delta.toFixed(2)} €`
              : "—"
          }
          accent={
            metrics.delta != null
              ? metrics.delta > 0
                ? theme.colors.success
                : metrics.delta < 0
                  ? theme.colors.danger
                  : theme.colors.text
              : undefined
          }
          theme={theme}
        />
        <SmallMetric
          label={text.volatility}
          value={`${volatilityLabel} · ${metrics.volatility.toFixed(1)}%`}
          theme={theme}
        />
        <SmallMetric
          label={text.dataPoints}
          value={String(metrics.points)}
          theme={theme}
        />
      </div>
    </div>
  );
}

function SmallMetric({
  label,
  value,
  accent,
  theme
}: {
  label: string;
  value: string;
  accent?: string;
  theme: ReturnType<typeof getThemeById>;
}) {
  return (
    <div
      style={{
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.md,
        background: theme.colors.surface,
        padding: "10px 12px",
        minWidth: 0
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: theme.colors.textMuted,
          fontWeight: 800,
          marginBottom: 5
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: accent ?? theme.colors.text,
          fontWeight: 900,
          fontSize: 14,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }}
      >
        {value}
      </div>
    </div>
  );
}

function InsightMetric({
  label,
  value,
  accent,
  theme
}: {
  label: string;
  value: string;
  accent?: string;
  theme: ReturnType<typeof getThemeById>;
}) {
  return (
    <div
      style={{
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.md,
        background: theme.colors.surface,
        padding: 12,
        minWidth: 0
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: theme.colors.textMuted,
          fontWeight: 900,
          marginBottom: 5
        }}
      >
        {label}
      </div>
      <div
        style={{
          color: accent ?? theme.colors.text,
          fontWeight: 900,
          fontSize: 15,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }}
      >
        {value}
      </div>
    </div>
  );
}

function buildMetrics(snapshots: Snapshot[]) {
  const values = snapshots
    .map((snapshot) => Number(snapshot.marketValue))
    .filter((value) => Number.isFinite(value));

  const firstValue = values[0] ?? null;
  const latestValue = values.at(-1) ?? null;

  const delta =
    firstValue != null && latestValue != null ? latestValue - firstValue : null;

  const growthPercent =
    firstValue && delta != null ? (delta / firstValue) * 100 : null;

  const volatility = calculateVolatility(values);
  const volatilityLevel = getVolatilityLevel(volatility);

  return {
    firstValue,
    latestValue,
    delta,
    growthPercent,
    points: values.length,
    volatility,
    volatilityLevel
  };
}

function calculateVolatility(values: number[]) {
  if (values.length < 2) return 0;

  const returns: number[] = [];

  for (let i = 1; i < values.length; i += 1) {
    const previous = values[i - 1];
    const current = values[i];

    if (previous > 0) {
      returns.push(((current - previous) / previous) * 100);
    }
  }

  if (returns.length === 0) return 0;

  const average =
    returns.reduce((acc, value) => acc + value, 0) / returns.length;

  const variance =
    returns.reduce((acc, value) => acc + Math.pow(value - average, 2), 0) /
    returns.length;

  return Math.sqrt(variance);
}

function getVolatilityLevel(value: number): "low" | "medium" | "high" {
  if (value < 3) return "low";
  if (value < 10) return "medium";
  return "high";
}