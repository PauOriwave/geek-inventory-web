"use client";

import { useEffect, useMemo, useState } from "react";
import { getThemeById } from "../theme";

type HistoryPoint = {
  date: string;
  total: number;
};

type CollectionHistoryResponse = {
  base: HistoryPoint[];
  market: HistoryPoint[];
};

type HoverState = {
  index: number;
  x: number;
};

type ChartRange = "7d" | "30d" | "90d" | "all";
type ChartSeries = "all" | "base" | "market";

export default function CollectionValueChartClient({
  initialHistory,
  title,
  subtitle,
  locale,
  theme,
  category,
  apiBaseUrl
}: {
  initialHistory: CollectionHistoryResponse;
  title: string;
  subtitle: string;
  locale: "en" | "es";
  theme: ReturnType<typeof getThemeById>;
  category?: string;
  apiBaseUrl: string;
}) {
  const [range, setRange] = useState<ChartRange>("all");
  const [series, setSeries] = useState<ChartSeries>("all");
  const [history, setHistory] = useState<CollectionHistoryResponse>(initialHistory);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      if (range === "all") {
        setHistory(initialHistory);
        return;
      }

      try {
        setLoading(true);

        const params = new URLSearchParams();
        if (category) {
          params.set("category", category);
        }
        params.set("range", range);

        const res = await fetch(
          `${apiBaseUrl}/stats/collection-history?${params.toString()}`,
          {
            credentials: "include"
          }
        );

        if (!res.ok) {
          return;
        }

        const data = await res.json();

        if (!cancelled) {
          setHistory({
            base: Array.isArray(data?.base) ? data.base : [],
            market: Array.isArray(data?.market) ? data.market : []
          });
        }
      } catch {
        // noop
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl, category, initialHistory, range]);

  if (history.base.length === 0 && history.market.length === 0) {
    return (
      <section
        style={{
          marginTop: 14,
          background: theme.colors.surface,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radius.xl,
          padding: 20,
          boxShadow: theme.shadow.card
        }}
      >
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              fontWeight: 900,
              fontSize: 18,
              color: theme.colors.text
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 13,
              color: theme.colors.textMuted,
              marginTop: 6
            }}
          >
            {subtitle}
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            border: `1px dashed ${theme.colors.border}`,
            borderRadius: theme.radius.lg,
            padding: 28,
            textAlign: "center",
            background: theme.colors.surfaceAlt,
            color: theme.colors.textMuted,
            lineHeight: 1.7,
            fontSize: 14
          }}
        >
          {locale === "es"
            ? "Todavía no hay snapshots para mostrar la evolución. Añade objetos con precio, importa tu CSV o valora tu colección para empezar a construir el histórico."
            : "There are no snapshots yet to show the evolution. Add priced items, import your CSV or valuate your collection to start building the history."}
        </div>
      </section>
    );
  }

  return (
    <CollectionChartCard
      history={history}
      title={title}
      subtitle={subtitle}
      locale={locale}
      theme={theme}
      range={range}
      onRangeChange={setRange}
      series={series}
      onSeriesChange={setSeries}
      loading={loading}
    />
  );
}

function CollectionChartCard({
  history,
  title,
  subtitle,
  locale,
  theme,
  range,
  onRangeChange,
  series,
  onSeriesChange,
  loading
}: {
  history: CollectionHistoryResponse;
  title: string;
  subtitle: string;
  locale: "en" | "es";
  theme: ReturnType<typeof getThemeById>;
  range: ChartRange;
  onRangeChange: (value: ChartRange) => void;
  series: ChartSeries;
  onSeriesChange: (value: ChartSeries) => void;
  loading: boolean;
}) {
  const width = 1040;
  const height = 400;
  const paddingLeft = 56;
  const paddingRight = 24;
  const paddingTop = 24;
  const paddingBottom = 52;

  const showBase = series === "all" || series === "base";
  const showMarket = series === "all" || series === "market";

  const allPoints = useMemo(
    () =>
      [...history.base, ...history.market].sort((a, b) =>
        a.date.localeCompare(b.date)
      ),
    [history]
  );

  const basePoints = showBase ? history.base : [];
  const marketPoints = showMarket ? history.market : [];
  const visibleSeries = marketPoints.length > 0 ? marketPoints : basePoints;

  const first = visibleSeries[0]?.total ?? 0;
  const latest = visibleSeries[visibleSeries.length - 1]?.total ?? 0;
  const delta = latest - first;
  const percent = first > 0 ? (delta / first) * 100 : 0;

  const positive = delta > 0;
  const negative = delta < 0;

  const trendColor = positive
    ? theme.colors.success
    : negative
      ? theme.colors.danger
      : theme.colors.textMuted;

  const trendSurface = positive
    ? "rgba(2,122,72,0.10)"
    : negative
      ? "rgba(180,35,24,0.10)"
      : theme.colors.surfaceAlt;

  const values = [
    ...basePoints.map((p) => p.total),
    ...marketPoints.map((p) => p.total)
  ];

  const min = values.length > 0 ? Math.min(...values) : 0;
  const max = values.length > 0 ? Math.max(...values) : 1;

  const hasSinglePoint = values.length === 1;
  const paddedMin = hasSinglePoint
    ? Math.max(0, min * 0.92)
    : Math.max(0, min * 0.94);
  const paddedMax = hasSinglePoint ? max * 1.08 || max + 1 : max * 1.04;
  const rangeValue = Math.max(1, paddedMax - paddedMin);

  const datePool = [...new Set([...basePoints, ...marketPoints].map((p) => p.date))].sort();
  const earliestDate = datePool[0] ?? new Date().toISOString();
  const latestDate = datePool[datePool.length - 1] ?? earliestDate;

  const baseByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const point of basePoints) map.set(point.date, point.total);
    return map;
  }, [basePoints]);

  const marketByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const point of marketPoints) map.set(point.date, point.total);
    return map;
  }, [marketPoints]);

  const usableWidth = width - paddingLeft - paddingRight;
  const usableHeight = height - paddingTop - paddingBottom;

  const toXByDate = (date: string) => {
    if (datePool.length === 1) return paddingLeft + usableWidth / 2;
    const index = datePool.indexOf(date);
    return paddingLeft + (index * usableWidth) / (datePool.length - 1);
  };

  const toY = (value: number) => {
    return paddingTop + (1 - (value - paddedMin) / rangeValue) * usableHeight;
  };

  const baseCoords = basePoints.map((point) => ({
    x: toXByDate(point.date),
    y: toY(point.total),
    value: point.total,
    date: point.date
  }));

  const marketCoords = marketPoints.map((point) => ({
    x: toXByDate(point.date),
    y: toY(point.total),
    value: point.total,
    date: point.date
  }));

  const basePath =
    baseCoords.length >= 2 ? buildSmoothPath(baseCoords) : "";
  const marketPath =
    marketCoords.length >= 2 ? buildSmoothPath(marketCoords) : "";

  const marketAreaPath =
    marketCoords.length >= 2
      ? buildAreaPath(marketCoords, height - paddingBottom)
      : "";

  const yTicks = buildNiceTicks(paddedMin, paddedMax, 4);
  const baseMarkerIndexes = getMarkerIndexes(baseCoords.length);
  const marketMarkerIndexes = getMarkerIndexes(marketCoords.length);

  const [hover, setHover] = useState<HoverState | null>(null);

  const hoverData = hover
    ? (() => {
        const date = datePool[hover.index];
        const baseValue = baseByDate.get(date) ?? null;
        const marketValue = marketByDate.get(date) ?? null;
        const seriesDelta =
          baseValue != null && marketValue != null
            ? marketValue - baseValue
            : null;

        return {
          date,
          baseValue,
          marketValue,
          seriesDelta
        };
      })()
    : null;

  return (
    <section
      style={{
        marginTop: 14,
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.xl,
        padding: 20,
        boxShadow: theme.shadow.card
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 18,
          alignItems: "flex-start",
          flexWrap: "wrap",
          marginBottom: 18
        }}
      >
        <div style={{ maxWidth: 560 }}>
          <div
            style={{
              fontWeight: 900,
              fontSize: 20,
              lineHeight: 1.1,
              color: theme.colors.text
            }}
          >
            {title}
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 13,
              color: theme.colors.textMuted,
              lineHeight: 1.6
            }}
          >
            {subtitle}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            justifyContent: "flex-end"
          }}
        >
          <SummaryChip
            label={locale === "es" ? "Inicial" : "Initial"}
            value={`${first.toFixed(2)} €`}
            theme={theme}
          />
          <SummaryChip
            label={locale === "es" ? "Actual" : "Current"}
            value={`${latest.toFixed(2)} €`}
            theme={theme}
          />
          <SummaryChip
            label={locale === "es" ? "Cambio" : "Change"}
            value={`${positive ? "+" : ""}${delta.toFixed(2)} €`}
            theme={theme}
            accentColor={trendColor}
            accentBg={trendSurface}
          />
          <SummaryChip
            label={locale === "es" ? "Variación" : "Variation"}
            value={`${percent >= 0 ? "+" : ""}${percent.toFixed(1)}%`}
            theme={theme}
            accentColor={trendColor}
            accentBg={trendSurface}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 14
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap"
          }}
        >
          <LegendPill
            label={locale === "es" ? "Base manual/importada" : "Manual/import baseline"}
            color="#94A3B8"
            dashed
            theme={theme}
          />
          <LegendPill
            label={locale === "es" ? "Valoración de mercado" : "Market valuation"}
            color={theme.colors.gold}
            theme={theme}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center"
          }}
        >
          <ToggleGroup>
            <ToggleButton
              active={series === "all"}
              onClick={() => onSeriesChange("all")}
              label={locale === "es" ? "Todo" : "All"}
              theme={theme}
            />
            <ToggleButton
              active={series === "base"}
              onClick={() => onSeriesChange("base")}
              label={locale === "es" ? "Base" : "Base"}
              theme={theme}
            />
            <ToggleButton
              active={series === "market"}
              onClick={() => onSeriesChange("market")}
              label={locale === "es" ? "Mercado" : "Market"}
              theme={theme}
            />
          </ToggleGroup>

          <ToggleGroup>
            <ToggleButton
              active={range === "7d"}
              onClick={() => onRangeChange("7d")}
              label="7D"
              theme={theme}
            />
            <ToggleButton
              active={range === "30d"}
              onClick={() => onRangeChange("30d")}
              label="30D"
              theme={theme}
            />
            <ToggleButton
              active={range === "90d"}
              onClick={() => onRangeChange("90d")}
              label="90D"
              theme={theme}
            />
            <ToggleButton
              active={range === "all"}
              onClick={() => onRangeChange("all")}
              label="All"
              theme={theme}
            />
          </ToggleGroup>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          borderRadius: 24,
          overflow: "hidden",
          border: `1px solid ${theme.colors.border}`,
          background: `linear-gradient(180deg, ${theme.colors.surface} 0%, ${theme.colors.surfaceAlt} 100%)`
        }}
      >
        {loading && (
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              zIndex: 3,
              padding: "6px 10px",
              borderRadius: 999,
              background: "rgba(15,23,42,0.78)",
              color: "white",
              fontSize: 12,
              fontWeight: 800
            }}
          >
            {locale === "es" ? "Cargando..." : "Loading..."}
          </div>
        )}

        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{
            width: "100%",
            height: "auto",
            display: "block"
          }}
          onMouseMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const clientX = event.clientX - rect.left;
            const svgX = (clientX / rect.width) * width;
            const clampedX = Math.max(
              paddingLeft,
              Math.min(width - paddingRight, svgX)
            );

            let nearestIndex = 0;
            let nearestDistance = Number.POSITIVE_INFINITY;

            for (let i = 0; i < datePool.length; i++) {
              const x = toXByDate(datePool[i]);
              const distance = Math.abs(x - clampedX);

              if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestIndex = i;
              }
            }

            setHover({
              index: nearestIndex,
              x: toXByDate(datePool[nearestIndex])
            });
          }}
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="marketAreaFillV7" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.colors.gold} stopOpacity="0.26" />
              <stop offset="55%" stopColor={theme.colors.gold} stopOpacity="0.09" />
              <stop offset="100%" stopColor={theme.colors.gold} stopOpacity="0.02" />
            </linearGradient>

            <filter id="marketGlowV7">
              <feGaussianBlur stdDeviation="5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {yTicks.map((tick, index) => {
            const y = toY(tick);

            return (
              <g key={`${tick}-${index}`}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke={theme.colors.border}
                  strokeDasharray="4 8"
                />
                <text
                  x={paddingLeft}
                  y={y - 8}
                  fontSize="11"
                  fill={theme.colors.textMuted}
                >
                  {formatEuroCompact(tick)}
                </text>
              </g>
            );
          })}

          <line
            x1={paddingLeft}
            y1={height - paddingBottom}
            x2={width - paddingRight}
            y2={height - paddingBottom}
            stroke={theme.colors.border}
          />

          {showMarket && marketAreaPath && (
            <path d={marketAreaPath} fill="url(#marketAreaFillV7)" stroke="none" />
          )}

          {showBase && basePath && (
            <path
              d={basePath}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="3"
              strokeDasharray="7 8"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.95}
            />
          )}

          {showMarket && marketPath && (
            <>
              <path
                d={marketPath}
                fill="none"
                stroke={theme.colors.gold}
                strokeOpacity="0.16"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#marketGlowV7)"
              />
              <path
                d={marketPath}
                fill="none"
                stroke={theme.colors.gold}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {showBase && baseCoords.length === 1 && (
            <>
              <line
                x1={paddingLeft}
                y1={baseCoords[0].y}
                x2={width - paddingRight}
                y2={baseCoords[0].y}
                stroke="#94A3B8"
                strokeWidth="3"
                strokeDasharray="8 8"
                opacity={0.9}
              />
              <circle cx={baseCoords[0].x} cy={baseCoords[0].y} r="6" fill="#94A3B8" />
            </>
          )}

          {showMarket && marketCoords.length === 1 && (
            <>
              <line
                x1={paddingLeft}
                y1={marketCoords[0].y}
                x2={width - paddingRight}
                y2={marketCoords[0].y}
                stroke={theme.colors.gold}
                strokeWidth="3"
                strokeDasharray="8 8"
                opacity={0.9}
              />
              <circle cx={marketCoords[0].x} cy={marketCoords[0].y} r="7" fill={theme.colors.gold} />
              <circle
                cx={marketCoords[0].x}
                cy={marketCoords[0].y}
                r="16"
                fill={theme.colors.gold}
                opacity="0.12"
              />
            </>
          )}

          {showBase && baseCoords.length > 1 &&
            baseMarkerIndexes.map((index) => {
              const point = baseCoords[index];

              return (
                <g key={`base-marker-${index}`}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="3"
                    fill={theme.colors.surface}
                    stroke="#94A3B8"
                    strokeWidth="2"
                  />
                </g>
              );
            })}

          {showMarket && marketCoords.length > 1 &&
            marketMarkerIndexes.map((index) => {
              const point = marketCoords[index];
              const isLast = index === marketCoords.length - 1;

              return (
                <g key={`market-marker-${index}`}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={isLast ? "5.5" : "4"}
                    fill={isLast ? theme.colors.black : theme.colors.surface}
                    stroke={theme.colors.gold}
                    strokeWidth="2.5"
                  />
                </g>
              );
            })}

          {hover && hoverData && (
            <>
              <line
                x1={hover.x}
                y1={paddingTop}
                x2={hover.x}
                y2={height - paddingBottom}
                stroke={theme.colors.textMuted}
                strokeOpacity="0.35"
                strokeDasharray="5 6"
              />

              {showBase && hoverData.baseValue != null && (
                <circle
                  cx={hover.x}
                  cy={toY(hoverData.baseValue)}
                  r="5"
                  fill={theme.colors.surface}
                  stroke="#94A3B8"
                  strokeWidth="2.5"
                />
              )}

              {showMarket && hoverData.marketValue != null && (
                <circle
                  cx={hover.x}
                  cy={toY(hoverData.marketValue)}
                  r="6"
                  fill={theme.colors.surface}
                  stroke={theme.colors.gold}
                  strokeWidth="2.5"
                />
              )}
            </>
          )}

          <text
            x={paddingLeft}
            y={height - 14}
            fontSize="11"
            fill={theme.colors.textMuted}
          >
            {formatChartDate(earliestDate, locale)}
          </text>

          <text
            x={width / 2}
            y={height - 14}
            fontSize="11"
            textAnchor="middle"
            fill={theme.colors.textMuted}
          >
            {locale === "es"
              ? `Base: ${history.base.length} · Mercado: ${history.market.length}`
              : `Base: ${history.base.length} · Market: ${history.market.length}`}
          </text>

          <text
            x={width - paddingRight}
            y={height - 14}
            fontSize="11"
            textAnchor="end"
            fill={theme.colors.textMuted}
          >
            {formatChartDate(latestDate, locale)}
          </text>
        </svg>

        {hover && hoverData && (
          <div
            style={{
              position: "absolute",
              top: 18,
              left: `calc(${((hover.x / width) * 100).toFixed(3)}% + 8px)`,
              transform:
                hover.x > width * 0.72 ? "translateX(-100%)" : "translateX(0)",
              pointerEvents: "none",
              zIndex: 2,
              minWidth: 190,
              maxWidth: 230,
              padding: "12px 14px",
              borderRadius: 16,
              background: "rgba(15,23,42,0.94)",
              color: "white",
              boxShadow: "0 10px 30px rgba(2,6,23,0.28)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(8px)"
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                marginBottom: 10,
                color: "rgba(255,255,255,0.86)"
              }}
            >
              {formatChartDate(hoverData.date, locale)}
            </div>

            {showBase && (
              <TooltipRow
                label={locale === "es" ? "Base" : "Baseline"}
                value={
                  hoverData.baseValue != null
                    ? `${hoverData.baseValue.toFixed(2)} €`
                    : "—"
                }
                color="#94A3B8"
              />
            )}

            {showMarket && (
              <TooltipRow
                label={locale === "es" ? "Mercado" : "Market"}
                value={
                  hoverData.marketValue != null
                    ? `${hoverData.marketValue.toFixed(2)} €`
                    : "—"
                }
                color={theme.colors.gold}
              />
            )}

            {showBase && showMarket && (
              <TooltipRow
                label="Δ"
                value={
                  hoverData.seriesDelta != null
                    ? `${hoverData.seriesDelta >= 0 ? "+" : ""}${hoverData.seriesDelta.toFixed(2)} €`
                    : "—"
                }
                color={
                  hoverData.seriesDelta == null
                    ? "rgba(255,255,255,0.72)"
                    : hoverData.seriesDelta >= 0
                      ? "#4ADE80"
                      : "#FB7185"
                }
                strong
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function SummaryChip({
  label,
  value,
  theme,
  accentColor,
  accentBg
}: {
  label: string;
  value: string;
  theme: ReturnType<typeof getThemeById>;
  accentColor?: string;
  accentBg?: string;
}) {
  return (
    <div
      style={{
        padding: "10px 12px",
        borderRadius: 999,
        border: `1px solid ${theme.colors.border}`,
        background: accentBg ?? theme.colors.surfaceAlt,
        minWidth: 128
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 0.2,
          color: theme.colors.textMuted,
          marginBottom: 4,
          textTransform: "uppercase"
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 15,
          fontWeight: 900,
          color: accentColor ?? theme.colors.text,
          lineHeight: 1.1
        }}
      >
        {value}
      </div>
    </div>
  );
}

function LegendPill({
  label,
  color,
  dashed,
  theme
}: {
  label: string;
  color: string;
  dashed?: boolean;
  theme: ReturnType<typeof getThemeById>;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 10px",
        borderRadius: 999,
        border: `1px solid ${theme.colors.border}`,
        background: theme.colors.surfaceAlt,
        fontSize: 12,
        color: theme.colors.textMuted,
        fontWeight: 700
      }}
    >
      <span
        style={{
          width: 18,
          height: 0,
          borderTop: `3px ${dashed ? "dashed" : "solid"} ${color}`,
          display: "inline-block"
        }}
      />
      {label}
    </div>
  );
}

function ToggleGroup({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        gap: 6,
        padding: 4,
        borderRadius: 999,
        background: "rgba(15,23,42,0.04)",
        border: "1px solid rgba(148,163,184,0.22)"
      }}
    >
      {children}
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  label,
  theme
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  theme: ReturnType<typeof getThemeById>;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: "none",
        borderRadius: 999,
        padding: "8px 12px",
        background: active ? theme.colors.black : "transparent",
        color: active ? "white" : theme.colors.textMuted,
        fontWeight: 800,
        fontSize: 12,
        cursor: "pointer"
      }}
    >
      {label}
    </button>
  );
}

function TooltipRow({
  label,
  value,
  color,
  strong
}: {
  label: string;
  value: string;
  color: string;
  strong?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 10,
        fontSize: 13,
        marginTop: 6
      }}
    >
      <span style={{ color: "rgba(255,255,255,0.72)" }}>{label}</span>
      <span
        style={{
          color,
          fontWeight: strong ? 900 : 800
        }}
      >
        {value}
      </span>
    </div>
  );
}

function buildNiceTicks(min: number, max: number, steps = 4) {
  if (min === max) return [min];

  const ticks: number[] = [];
  for (let i = 0; i <= steps; i++) {
    ticks.push(min + ((max - min) * i) / steps);
  }
  return ticks;
}

function buildSmoothPath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const controlX = (current.x + next.x) / 2;

    d += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
  }

  return d;
}

function buildAreaPath(
  points: Array<{ x: number; y: number }>,
  bottomY: number
) {
  if (points.length < 2) return "";
  const linePath = buildSmoothPath(points);
  return `${linePath} L ${points[points.length - 1].x} ${bottomY} L ${points[0].x} ${bottomY} Z`;
}

function getMarkerIndexes(length: number) {
  if (length <= 2) {
    return Array.from({ length }, (_, i) => i);
  }

  const indexes = new Set<number>();
  indexes.add(0);
  indexes.add(length - 1);

  const desiredMarkers = Math.min(6, length);
  const step = (length - 1) / Math.max(1, desiredMarkers - 1);

  for (let i = 1; i < desiredMarkers - 1; i++) {
    indexes.add(Math.round(step * i));
  }

  return [...indexes].sort((a, b) => a - b);
}

function formatChartDate(value: string, locale: "en" | "es") {
  const date = new Date(value);

  return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

function formatEuroCompact(value: number) {
  if (value >= 1000) {
    return `${Math.round(value).toLocaleString("en-GB")} €`;
  }

  return `${Math.round(value)} €`;
}