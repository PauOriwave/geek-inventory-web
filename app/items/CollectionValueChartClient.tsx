"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getThemeById } from "../theme";

type HistoryPoint = {
  date: string;
  total: number;
};

type CollectionHistoryResponse = {
  base: HistoryPoint[];
  market: HistoryPoint[];
};

type ChartRange = "7d" | "30d" | "90d" | "all";
type ChartSeries = "all" | "base" | "market";

type ChartPoint = HistoryPoint & {
  x: number;
  y: number;
};

type HoverPoint = {
  x: number;
  date: string;
  market?: ChartPoint;
  base?: ChartPoint;
};

export default function CollectionValueChartClient({
  initialHistory,
  initialRange,
  initialSeries,
  title,
  subtitle,
  locale,
  theme,
  category,
  apiBaseUrl
}: {
  initialHistory: CollectionHistoryResponse;
  initialRange: ChartRange;
  initialSeries: ChartSeries;
  title: string;
  subtitle: string;
  locale: "en" | "es";
  theme: ReturnType<typeof getThemeById>;
  category?: string;
  apiBaseUrl: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [range, setRange] = useState<ChartRange>(initialRange);
  const [series, setSeries] = useState<ChartSeries>(initialSeries);
  const [history, setHistory] = useState(initialHistory);

  useEffect(() => {
    let cancelled = false;

    async function fetchHistory() {
      try {
        const params = new URLSearchParams();

        if (category) params.set("category", category);
        params.set("range", range);

        const res = await fetch(
          `${apiBaseUrl}/stats/collection-history?${params.toString()}`,
          { credentials: "include" }
        );

        if (!res.ok) return;

        const data = await res.json();

        if (!cancelled) {
          setHistory({
            base: Array.isArray(data?.base) ? data.base : [],
            market: Array.isArray(data?.market) ? data.market : []
          });
        }
      } catch {
        // Keep current history.
      }
    }

    fetchHistory();

    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl, category, range]);

  function syncChartStateToUrl(nextRange: ChartRange, nextSeries: ChartSeries) {
    const params = new URLSearchParams(searchParams.toString());

    params.set("chartRange", nextRange);
    params.set("chartSeries", nextSeries);

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const visibleBase = series === "all" || series === "base";
  const visibleMarket = series === "all" || series === "market";

  const data = useMemo(() => {
    const preferred =
      visibleMarket && history.market.length > 0 ? history.market : history.base;

    const first = preferred[0]?.total ?? null;
    const latest = preferred.at(-1)?.total ?? null;
    const delta = first != null && latest != null ? latest - first : null;
    const percent = first && delta != null ? (delta / first) * 100 : null;

    return {
      latestBase: history.base.at(-1)?.total ?? null,
      latestMarket: history.market.at(-1)?.total ?? null,
      delta,
      percent,
      hasData: history.base.length > 0 || history.market.length > 0
    };
  }, [history, visibleMarket]);

  const text = {
    zoom: "Zoom",
    all: locale === "es" ? "Todo" : "All",
    base: locale === "es" ? "Base manual" : "Manual",
    market: locale === "es" ? "Mercado" : "Market",
    latestMarket: locale === "es" ? "Mercado actual" : "Latest market",
    latestBase: locale === "es" ? "Base actual" : "Latest base",
    change: locale === "es" ? `Cambio (${range})` : `Change (${range})`,
    noData:
      locale === "es"
        ? "No hay historial suficiente todavía."
        : "Not enough history yet.",
    footer:
      locale === "es"
        ? "Valores en EUR. Datos guardados desde el backend."
        : "Values in EUR. Data stored from the backend.",
    compare:
      locale === "es"
        ? "Comparar con otros objetos →"
        : "Compare vs Other Items →"
  };

  return (
    <section
      style={{
        marginTop: 14,
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.xl,
        boxShadow: theme.shadow.card,
        overflow: "hidden"
      }}
    >
      <div
        style={{
          padding: "22px 24px 18px",
          display: "flex",
          justifyContent: "space-between",
          gap: 18,
          flexWrap: "wrap"
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 28,
              lineHeight: 1.1,
              color: theme.colors.text
            }}
          >
            {title}
          </h2>

          <p
            style={{
              margin: "8px 0 0",
              fontSize: 15,
              color: theme.colors.textMuted
            }}
          >
            {subtitle}
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <MetricBox
            label={text.latestMarket}
            value={
              data.latestMarket != null
                ? `${data.latestMarket.toFixed(2)} €`
                : "—"
            }
            theme={theme}
          />
          <MetricBox
            label={text.change}
            value={
              data.delta != null
                ? `${data.delta > 0 ? "+" : ""}${data.delta.toFixed(2)} €`
                : "—"
            }
            subvalue={
              data.percent != null
                ? `${data.percent > 0 ? "+" : ""}${data.percent.toFixed(1)}%`
                : undefined
            }
            tone={
              data.delta != null && data.delta > 0
                ? "up"
                : data.delta != null && data.delta < 0
                  ? "down"
                  : "flat"
            }
            theme={theme}
          />
          <MetricBox
            label={text.latestBase}
            value={
              data.latestBase != null ? `${data.latestBase.toFixed(2)} €` : "—"
            }
            theme={theme}
          />
        </div>
      </div>

      <div
        style={{
          margin: "0 24px 24px",
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radius.lg,
          background: theme.colors.surface,
          overflow: "hidden"
        }}
      >
        <div
          style={{
            padding: "16px 18px",
            borderBottom: `1px solid ${theme.colors.border}`,
            display: "flex",
            justifyContent: "space-between",
            gap: 14,
            flexWrap: "wrap"
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              flexWrap: "wrap"
            }}
          >
            <span style={{ color: theme.colors.textMuted, fontSize: 14 }}>
              {text.zoom}
            </span>

            {(["7d", "30d", "90d", "all"] as ChartRange[]).map((nextRange) => (
              <button
                key={nextRange}
                type="button"
                onClick={() => {
                  setRange(nextRange);
                  syncChartStateToUrl(nextRange, series);
                }}
                style={{
                  border: `1px solid ${
                    range === nextRange ? theme.colors.gold : theme.colors.border
                  }`,
                  background:
                    range === nextRange
                      ? "rgba(200,164,77,0.16)"
                      : theme.colors.surfaceAlt,
                  color: theme.colors.text,
                  borderRadius: 8,
                  padding: "7px 11px",
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: "pointer"
                }}
              >
                {nextRange === "7d"
                  ? "7d"
                  : nextRange === "30d"
                    ? "30d"
                    : nextRange === "90d"
                      ? "90d"
                      : text.all}
              </button>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap"
            }}
          >
            {(["market", "base", "all"] as ChartSeries[]).map((nextSeries) => (
              <button
                key={nextSeries}
                type="button"
                onClick={() => {
                  setSeries(nextSeries);
                  syncChartStateToUrl(range, nextSeries);
                }}
                style={{
                  border: `1px solid ${
                    series === nextSeries ? "#60A5FA" : theme.colors.border
                  }`,
                  background:
                    series === nextSeries
                      ? "rgba(59,130,246,0.10)"
                      : theme.colors.surfaceAlt,
                  color: theme.colors.text,
                  borderRadius: 10,
                  padding: "9px 13px",
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: "pointer"
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: 22,
                    height: 3,
                    borderRadius: 999,
                    background:
                      nextSeries === "market"
                        ? "#0B84D8"
                        : nextSeries === "base"
                          ? "#6B7280"
                          : theme.colors.gold,
                    marginRight: 8,
                    verticalAlign: "middle"
                  }}
                />
                {nextSeries === "market"
                  ? text.market
                  : nextSeries === "base"
                    ? text.base
                    : text.all}
              </button>
            ))}
          </div>
        </div>

        {data.hasData ? (
          <CollectionChartSvg
            base={history.base}
            market={history.market}
            visibleBase={visibleBase}
            visibleMarket={visibleMarket}
            theme={theme}
            locale={locale}
          />
        ) : (
          <div
            style={{
              height: 390,
              display: "grid",
              placeItems: "center",
              color: theme.colors.textMuted,
              fontSize: 14
            }}
          >
            {text.noData}
          </div>
        )}

        <div
          style={{
            padding: "16px 18px",
            borderTop: `1px solid ${theme.colors.border}`,
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            color: theme.colors.textMuted,
            fontSize: 13
          }}
        >
          <span>ⓘ {text.footer}</span>
          <a
            href={`/market-pro?lang=${locale}`}
            style={{
              color: "#001DBF",
              textDecoration: "none",
              fontWeight: 800
            }}
          >
            {text.compare}
          </a>
        </div>
      </div>
    </section>
  );
}

function CollectionChartSvg({
  base,
  market,
  visibleBase,
  visibleMarket,
  theme,
  locale
}: {
  base: HistoryPoint[];
  market: HistoryPoint[];
  visibleBase: boolean;
  visibleMarket: boolean;
  theme: ReturnType<typeof getThemeById>;
  locale: "en" | "es";
}) {
  const [hover, setHover] = useState<HoverPoint | null>(null);

  const width = 1000;
  const height = 390;
  const paddingLeft = 36;
  const paddingRight = 72;
  const paddingTop = 38;
  const paddingBottom = 54;

  const visibleValues = [
    ...(visibleBase ? base.map((point) => point.total) : []),
    ...(visibleMarket ? market.map((point) => point.total) : [])
  ].filter(Number.isFinite);

  const maxRaw = Math.max(...visibleValues, 1);
  const minRaw = Math.min(...visibleValues, 0);
  const max = Math.ceil(maxRaw / 100) * 100 || 100;
  const min = Math.min(0, Math.floor(minRaw / 100) * 100);
  const range = max - min || 1;

  function toCoordinates(points: HistoryPoint[]): ChartPoint[] {
    return points
      .filter((point) => Number.isFinite(point.total))
      .map((point, index, arr) => {
        const x =
          arr.length === 1
            ? width / 2
            : paddingLeft +
              (index / (arr.length - 1)) *
                (width - paddingLeft - paddingRight);

        const y =
          paddingTop +
          ((max - point.total) / range) *
            (height - paddingTop - paddingBottom);

        return { ...point, x, y };
      });
  }

  const basePoints = toCoordinates(base);
  const marketPoints = toCoordinates(market);

  const basePath = buildSmoothPath(basePoints);
  const marketPath = buildSmoothPath(marketPoints);

  const firstDate = market[0]?.date ?? base[0]?.date ?? "";
  const lastDate = market.at(-1)?.date ?? base.at(-1)?.date ?? "";
  const latestMarket = marketPoints.at(-1);

  const hoverTargets = buildHoverTargets({
    basePoints,
    marketPoints,
    visibleBase,
    visibleMarket
  });

  function handlePointerMove(event: React.PointerEvent<SVGSVGElement>) {
    if (hoverTargets.length === 0) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const relativeX = ((event.clientX - rect.left) / rect.width) * width;

    const nearest = hoverTargets.reduce((best, current) =>
      Math.abs(current.x - relativeX) < Math.abs(best.x - relativeX)
        ? current
        : best
    );

    setHover(nearest);
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Collection value chart"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setHover(null)}
      style={{
        display: "block",
        width: "100%",
        height: "auto",
        background: theme.colors.surface,
        cursor: "crosshair",
        touchAction: "none"
      }}
    >
      {[0, 0.5, 1].map((step) => {
        const value = max - step * range;
        const y = paddingTop + step * (height - paddingTop - paddingBottom);

        return (
          <g key={step}>
            <line
              x1={paddingLeft}
              x2={width - paddingRight}
              y1={y}
              y2={y}
              stroke={theme.colors.border}
              strokeDasharray={step === 1 ? "0" : "5 7"}
              strokeOpacity="0.9"
            />
            <text
              x={width - 12}
              y={y + 5}
              fill={theme.colors.text}
              fontSize="14"
              textAnchor="end"
            >
              {formatMoney(value)}
            </text>
          </g>
        );
      })}

      <line
        x1={paddingLeft}
        x2={width - paddingRight}
        y1={height - paddingBottom}
        y2={height - paddingBottom}
        stroke={theme.colors.text}
        strokeWidth="1.2"
      />

      {visibleBase && basePath && (
        <path
          d={basePath}
          fill="none"
          stroke="#6B7280"
          strokeWidth="2.4"
          strokeDasharray="7 7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.85"
        />
      )}

      {visibleMarket && marketPath && (
        <path
          d={marketPath}
          fill="none"
          stroke="#0B84D8"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="drop-shadow(0 3px 4px rgba(11,132,216,0.20))"
        />
      )}

      {visibleMarket && latestMarket && !hover && (
        <>
          <circle
            cx={latestMarket.x}
            cy={latestMarket.y}
            r="5.5"
            fill="#0B84D8"
            stroke="white"
            strokeWidth="3"
          />
          <text
            x={width - 12}
            y={latestMarket.y + 5}
            fill="#0F2F5F"
            fontSize="15"
            textAnchor="end"
            fontWeight="800"
          >
            {formatMoney(latestMarket.total)}
          </text>
        </>
      )}

      {hover && (
        <HoverLayer
          hover={hover}
          height={height}
          paddingTop={paddingTop}
          paddingBottom={paddingBottom}
          width={width}
          theme={theme}
          locale={locale}
          visibleBase={visibleBase}
          visibleMarket={visibleMarket}
        />
      )}

      {buildDateTicks(firstDate, lastDate, locale).map((tick, index, arr) => {
        const x =
          paddingLeft +
          (index / Math.max(1, arr.length - 1)) *
            (width - paddingLeft - paddingRight);

        return (
          <g key={`${tick}-${index}`}>
            <line
              x1={x}
              x2={x}
              y1={height - paddingBottom}
              y2={height - paddingBottom + 9}
              stroke={theme.colors.text}
              strokeWidth="1"
            />
            <text
              x={x}
              y={height - 18}
              fill={theme.colors.text}
              fontSize="13"
              textAnchor="middle"
            >
              {tick}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function HoverLayer({
  hover,
  height,
  paddingTop,
  paddingBottom,
  width,
  theme,
  locale,
  visibleBase,
  visibleMarket
}: {
  hover: HoverPoint;
  height: number;
  paddingTop: number;
  paddingBottom: number;
  width: number;
  theme: ReturnType<typeof getThemeById>;
  locale: "en" | "es";
  visibleBase: boolean;
  visibleMarket: boolean;
}) {
  const tooltipWidth = 190;
  const tooltipHeight =
    visibleBase && visibleMarket && hover.base && hover.market ? 112 : 86;

  const tooltipX =
    hover.x + tooltipWidth + 24 > width ? hover.x - tooltipWidth - 18 : hover.x + 18;

  const tooltipY = Math.max(
    16,
    Math.min(
      height - tooltipHeight - 16,
      Math.min(hover.market?.y ?? Infinity, hover.base?.y ?? Infinity) - 38
    )
  );

  return (
    <g>
      <line
        x1={hover.x}
        x2={hover.x}
        y1={paddingTop}
        y2={height - paddingBottom}
        stroke="#94A3B8"
        strokeWidth="1.2"
        strokeDasharray="5 6"
      />

      {visibleMarket && hover.market && (
        <circle
          cx={hover.market.x}
          cy={hover.market.y}
          r="6"
          fill="#0B84D8"
          stroke="white"
          strokeWidth="3"
        />
      )}

      {visibleBase && hover.base && (
        <circle
          cx={hover.base.x}
          cy={hover.base.y}
          r="5"
          fill="#6B7280"
          stroke="white"
          strokeWidth="3"
        />
      )}

      <rect
        x={tooltipX}
        y={tooltipY}
        width={tooltipWidth}
        height={tooltipHeight}
        rx="14"
        fill={theme.colors.black}
        opacity="0.96"
      />

      <text
        x={tooltipX + 14}
        y={tooltipY + 24}
        fill="white"
        fontSize="13"
        fontWeight="900"
      >
        {formatTooltipDate(hover.date, locale)}
      </text>

      {visibleMarket && hover.market && (
        <>
          <circle cx={tooltipX + 16} cy={tooltipY + 50} r="4" fill="#0B84D8" />
          <text x={tooltipX + 28} y={tooltipY + 55} fill="white" fontSize="13">
            {locale === "es" ? "Mercado" : "Market"}
          </text>
          <text
            x={tooltipX + tooltipWidth - 14}
            y={tooltipY + 55}
            fill="white"
            fontSize="13"
            fontWeight="900"
            textAnchor="end"
          >
            {hover.market.total.toFixed(2)} €
          </text>
        </>
      )}

      {visibleBase && hover.base && (
        <>
          <circle
            cx={tooltipX + 16}
            cy={tooltipY + (visibleMarket && hover.market ? 78 : 50)}
            r="4"
            fill="#6B7280"
          />
          <text
            x={tooltipX + 28}
            y={tooltipY + (visibleMarket && hover.market ? 83 : 55)}
            fill="white"
            fontSize="13"
          >
            {locale === "es" ? "Base" : "Base"}
          </text>
          <text
            x={tooltipX + tooltipWidth - 14}
            y={tooltipY + (visibleMarket && hover.market ? 83 : 55)}
            fill="white"
            fontSize="13"
            fontWeight="900"
            textAnchor="end"
          >
            {hover.base.total.toFixed(2)} €
          </text>
        </>
      )}
    </g>
  );
}

function buildHoverTargets({
  basePoints,
  marketPoints,
  visibleBase,
  visibleMarket
}: {
  basePoints: ChartPoint[];
  marketPoints: ChartPoint[];
  visibleBase: boolean;
  visibleMarket: boolean;
}): HoverPoint[] {
  const source = visibleMarket && marketPoints.length > 0 ? marketPoints : basePoints;

  return source.map((point, index) => ({
    x: point.x,
    date: point.date,
    market: visibleMarket ? marketPoints[index] : undefined,
    base: visibleBase ? basePoints[index] : undefined
  }));
}

function MetricBox({
  label,
  value,
  subvalue,
  tone = "flat",
  theme
}: {
  label: string;
  value: string;
  subvalue?: string;
  tone?: "up" | "down" | "flat";
  theme: ReturnType<typeof getThemeById>;
}) {
  const color =
    tone === "up"
      ? theme.colors.success
      : tone === "down"
        ? theme.colors.danger
        : theme.colors.text;

  return (
    <div
      style={{
        minWidth: 140,
        border: `1px solid ${theme.colors.border}`,
        background: theme.colors.surfaceAlt,
        borderRadius: theme.radius.md,
        padding: "13px 16px",
        textAlign: "center"
      }}
    >
      <div style={{ fontSize: 13, color: theme.colors.textMuted }}>
        {label}
      </div>
      <div
        style={{
          marginTop: 6,
          color,
          fontSize: 22,
          lineHeight: 1,
          fontWeight: 900
        }}
      >
        {value}
      </div>
      {subvalue && (
        <div
          style={{
            marginTop: 5,
            color,
            fontSize: 13,
            fontWeight: 800
          }}
        >
          {subvalue}
        </div>
      )}
    </div>
  );
}

function buildSmoothPath(points: { x: number; y: number }[]) {
  if (points.length < 2) return "";

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i += 1) {
    const current = points[i];
    const next = points[i + 1];
    const midX = (current.x + next.x) / 2;

    path += ` C ${midX} ${current.y}, ${midX} ${next.y}, ${next.x} ${next.y}`;
  }

  return path;
}

function buildDateTicks(
  firstDate: string,
  lastDate: string,
  locale: "en" | "es"
) {
  if (!firstDate || !lastDate) return [];

  const start = new Date(firstDate);
  const end = new Date(lastDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];

  const ticks: string[] = [];
  const count = 7;

  for (let i = 0; i < count; i += 1) {
    const date = new Date(
      start.getTime() + ((end.getTime() - start.getTime()) * i) / (count - 1)
    );

    ticks.push(
      new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-GB", {
        month: "short",
        year: "numeric"
      }).format(date)
    );
  }

  return ticks;
}

function formatMoney(value: number) {
  return `${Math.round(value)}€`;
}

function formatTooltipDate(value: string, locale: "en" | "es") {
  return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}