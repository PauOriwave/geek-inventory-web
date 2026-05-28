"use client";

import { useMemo, useState } from "react";
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

type ChartPoint = {
  date: string;
  value: number;
  rawValue: number;
  x: number;
  y: number;
};

type HoverPoint = {
  x: number;
  date: string;
  a?: ChartPoint;
  b?: ChartPoint;
};

export default function CompareChart({
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
  const [hover, setHover] = useState<HoverPoint | null>(null);

  const chart = useMemo(
    () => buildChartData({ snapshotsA, snapshotsB, mode }),
    [mode, snapshotsA, snapshotsB]
  );

  const width = 1000;
  const height = 360;
  const paddingLeft = 42;
  const paddingRight = 74;
  const paddingTop = 36;
  const paddingBottom = 54;

  const values = [...chart.a, ...chart.b].map((point) => point.value);
  const maxRaw = Math.max(...values, mode === "performance" ? 120 : 1);
  const minRaw = Math.min(...values, mode === "performance" ? 80 : 0);

  const max =
    mode === "performance"
      ? Math.ceil(maxRaw / 10) * 10
      : Math.ceil(maxRaw / 100) * 100 || 100;

  const min =
    mode === "performance"
      ? Math.floor(minRaw / 10) * 10
      : Math.min(0, Math.floor(minRaw / 100) * 100);

  const range = max - min || 1;

  const aPoints = toCoordinates(chart.a);
  const bPoints = toCoordinates(chart.b);

  const pathA = buildSmoothPath(aPoints);
  const pathB = buildSmoothPath(bPoints);

  const hoverTargets = buildHoverTargets(aPoints, bPoints);
  const latestA = aPoints.at(-1);
  const latestB = bPoints.at(-1);

  function toCoordinates(points: Array<Omit<ChartPoint, "x" | "y">>) {
    return points.map((point, index, arr) => {
      const x =
        arr.length === 1
          ? width / 2
          : paddingLeft +
            (index / (arr.length - 1)) *
              (width - paddingLeft - paddingRight);

      const y =
        paddingTop +
        ((max - point.value) / range) *
          (height - paddingTop - paddingBottom);

      return { ...point, x, y };
    });
  }

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
    <div
      style={{
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.xl,
        background: theme.colors.surface,
        overflow: "hidden"
      }}
    >
      <div
        style={{
          padding: "14px 16px",
          borderBottom: `1px solid ${theme.colors.border}`,
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center"
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center"
          }}
        >
          <Legend color="#0B84D8" label={itemA.name} theme={theme} />
          <Legend color={theme.colors.gold} label={itemB.name} theme={theme} />
        </div>

        <div
          style={{
            color: theme.colors.textMuted,
            fontSize: 12,
            fontWeight: 800
          }}
        >
          {mode === "performance"
            ? locale === "es"
              ? "Ambos objetos empiezan en 100%"
              : "Both items start at 100%"
            : locale === "es"
              ? "Valor de mercado absoluto"
              : "Absolute market value"}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Market compare chart"
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
        <defs>
          <linearGradient id="compareBlueArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#0B84D8" stopOpacity="0.20" />
            <stop offset="70%" stopColor="#0B84D8" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#0B84D8" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="compareGoldArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={theme.colors.gold} stopOpacity="0.22" />
            <stop offset="70%" stopColor={theme.colors.gold} stopOpacity="0.05" />
            <stop offset="100%" stopColor={theme.colors.gold} stopOpacity="0" />
          </linearGradient>
        </defs>

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
                fontSize="13"
                textAnchor="end"
              >
                {formatAxisValue(value, mode)}
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
          strokeWidth="1.1"
        />

        {pathA && (
          <path
            d={buildAreaPath(aPoints, height, paddingBottom)}
            fill="url(#compareBlueArea)"
          />
        )}

        {pathB && (
          <path
            d={buildAreaPath(bPoints, height, paddingBottom)}
            fill="url(#compareGoldArea)"
          />
        )}

        {pathA && (
          <path
            d={pathA}
            fill="none"
            stroke="#0B84D8"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="drop-shadow(0 6px 10px rgba(11,132,216,0.20))"
          />
        )}

        {pathB && (
          <path
            d={pathB}
            fill="none"
            stroke={theme.colors.gold}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="drop-shadow(0 6px 10px rgba(200,164,77,0.20))"
          />
        )}

        {latestA && !hover && (
          <circle
            cx={latestA.x}
            cy={latestA.y}
            r="5.5"
            fill="#0B84D8"
            stroke="white"
            strokeWidth="3"
          />
        )}

        {latestB && !hover && (
          <circle
            cx={latestB.x}
            cy={latestB.y}
            r="5.5"
            fill={theme.colors.gold}
            stroke="white"
            strokeWidth="3"
          />
        )}

        {hover && (
          <HoverLayer
            hover={hover}
            width={width}
            height={height}
            paddingTop={paddingTop}
            paddingBottom={paddingBottom}
            mode={mode}
            locale={locale}
            theme={theme}
            itemAName={itemA.name}
            itemBName={itemB.name}
          />
        )}

        {buildDateTicks(chart.firstDate, chart.lastDate, locale).map(
          (tick, index, arr) => {
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
                  y2={height - paddingBottom + 8}
                  stroke={theme.colors.text}
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={height - 18}
                  fill={theme.colors.text}
                  fontSize="12"
                  textAnchor="middle"
                >
                  {tick}
                </text>
              </g>
            );
          }
        )}
      </svg>
    </div>
  );
}

function buildChartData({
  snapshotsA,
  snapshotsB,
  mode
}: {
  snapshotsA: Snapshot[];
  snapshotsB: Snapshot[];
  mode: CompareMode;
}) {
  const a = snapshotsA
    .map((snapshot) => ({
      date: snapshot.recordedAt,
      rawValue: Number(snapshot.marketValue)
    }))
    .filter((point) => Number.isFinite(point.rawValue))
    .sort((x, y) => new Date(x.date).getTime() - new Date(y.date).getTime());

  const b = snapshotsB
    .map((snapshot) => ({
      date: snapshot.recordedAt,
      rawValue: Number(snapshot.marketValue)
    }))
    .filter((point) => Number.isFinite(point.rawValue))
    .sort((x, y) => new Date(x.date).getTime() - new Date(y.date).getTime());

  const firstA = a[0]?.rawValue || 1;
  const firstB = b[0]?.rawValue || 1;

  return {
    a: a.map((point) => ({
      ...point,
      value: mode === "performance" ? (point.rawValue / firstA) * 100 : point.rawValue
    })),
    b: b.map((point) => ({
      ...point,
      value: mode === "performance" ? (point.rawValue / firstB) * 100 : point.rawValue
    })),
    firstDate: a[0]?.date ?? b[0]?.date ?? "",
    lastDate: a.at(-1)?.date ?? b.at(-1)?.date ?? ""
  };
}

function HoverLayer({
  hover,
  width,
  height,
  paddingTop,
  paddingBottom,
  mode,
  locale,
  theme,
  itemAName,
  itemBName
}: {
  hover: HoverPoint;
  width: number;
  height: number;
  paddingTop: number;
  paddingBottom: number;
  mode: CompareMode;
  locale: "en" | "es";
  theme: ReturnType<typeof getThemeById>;
  itemAName: string;
  itemBName: string;
}) {
  const tooltipWidth = 250;
  const tooltipHeight = 122;

  const tooltipX =
    hover.x + tooltipWidth + 24 > width
      ? hover.x - tooltipWidth - 18
      : hover.x + 18;

  const tooltipY = Math.max(
    16,
    Math.min(
      height - tooltipHeight - 16,
      Math.min(hover.a?.y ?? Infinity, hover.b?.y ?? Infinity) - 36
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

      {hover.a && (
        <circle
          cx={hover.a.x}
          cy={hover.a.y}
          r="6"
          fill="#0B84D8"
          stroke="white"
          strokeWidth="3"
        />
      )}

      {hover.b && (
        <circle
          cx={hover.b.x}
          cy={hover.b.y}
          r="6"
          fill={theme.colors.gold}
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

      {hover.a && (
        <>
          <circle cx={tooltipX + 16} cy={tooltipY + 52} r="4" fill="#0B84D8" />
          <text x={tooltipX + 28} y={tooltipY + 56} fill="white" fontSize="12">
            {truncateLabel(itemAName)}
          </text>
          <text
            x={tooltipX + tooltipWidth - 14}
            y={tooltipY + 56}
            fill="white"
            fontSize="12"
            fontWeight="900"
            textAnchor="end"
          >
            {formatChartValue(hover.a.value, hover.a.rawValue, mode)}
          </text>
        </>
      )}

      {hover.b && (
        <>
          <circle
            cx={tooltipX + 16}
            cy={tooltipY + 82}
            r="4"
            fill={theme.colors.gold}
          />
          <text x={tooltipX + 28} y={tooltipY + 86} fill="white" fontSize="12">
            {truncateLabel(itemBName)}
          </text>
          <text
            x={tooltipX + tooltipWidth - 14}
            y={tooltipY + 86}
            fill="white"
            fontSize="12"
            fontWeight="900"
            textAnchor="end"
          >
            {formatChartValue(hover.b.value, hover.b.rawValue, mode)}
          </text>
        </>
      )}
    </g>
  );
}

function Legend({
  color,
  label,
  theme
}: {
  color: string;
  label: string;
  theme: ReturnType<typeof getThemeById>;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        gap: 8,
        alignItems: "center",
        minWidth: 0
      }}
    >
      <span
        style={{
          width: 24,
          height: 4,
          borderRadius: 999,
          background: color,
          flexShrink: 0
        }}
      />
      <span
        style={{
          fontSize: 12,
          color: theme.colors.text,
          fontWeight: 900,
          maxWidth: 220,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }}
      >
        {label}
      </span>
    </div>
  );
}

function buildHoverTargets(aPoints: ChartPoint[], bPoints: ChartPoint[]) {
  const source = aPoints.length >= bPoints.length ? aPoints : bPoints;

  return source.map((point, index) => ({
    x: point.x,
    date: point.date,
    a: aPoints[index],
    b: bPoints[index]
  }));
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

function buildAreaPath(
  points: { x: number; y: number }[],
  height: number,
  paddingBottom: number
) {
  if (points.length < 2) return "";

  const linePath = buildSmoothPath(points);
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  return `${linePath} L ${lastPoint.x} ${height - paddingBottom} L ${
    firstPoint.x
  } ${height - paddingBottom} Z`;
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
  const count = 6;

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

function formatAxisValue(value: number, mode: CompareMode) {
  if (mode === "performance") {
    return `${Math.round(value)}%`;
  }

  return `${Math.round(value)}€`;
}

function formatChartValue(value: number, rawValue: number, mode: CompareMode) {
  if (mode === "performance") {
    return `${value.toFixed(1)}%`;
  }

  return `${rawValue.toFixed(2)} €`;
}

function formatTooltipDate(value: string, locale: "en" | "es") {
  return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

function truncateLabel(value: string) {
  return value.length > 20 ? `${value.slice(0, 20)}…` : value;
}