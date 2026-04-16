import { cookies } from "next/headers";
import { getThemeById, AppThemeId } from "../theme";
import { getCategoryLabel } from "./categoryLabels";

type HistoryPoint = {
  date: string;
  total: number;
};

const API = process.env.NEXT_PUBLIC_API_URL!;

async function getCollectionHistory(
  cookieHeader: string,
  category?: string
): Promise<HistoryPoint[]> {
  try {
    const qs = category ? `?category=${encodeURIComponent(category)}` : "";

    const res = await fetch(`${API}/stats/collection-history${qs}`, {
      cache: "no-store",
      headers: {
        cookie: cookieHeader
      }
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function CollectionValueChart({
  category,
  locale = "en"
}: {
  category?: string;
  locale?: "en" | "es";
}) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const themeId =
    (cookieStore.get("ui_theme")?.value as AppThemeId | undefined) ?? "classic";
  const theme = getThemeById(themeId);

  const points = await getCollectionHistory(cookieHeader, category);

  const title = category
    ? locale === "es"
      ? `Evolución de ${getCategoryLabel(category, locale)}`
      : `${getCategoryLabel(category, locale)} trend`
    : locale === "es"
      ? "Evolución del valor de la colección"
      : "Collection value evolution";

  const subtitle = category
    ? locale === "es"
      ? "Histórico filtrado por categoría"
      : "History filtered by category"
    : locale === "es"
      ? "Histórico global de snapshots"
      : "Global snapshot history";

  if (points.length === 0) {
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
      points={points}
      title={title}
      subtitle={subtitle}
      locale={locale}
      theme={theme}
    />
  );
}

function CollectionChartCard({
  points,
  title,
  subtitle,
  locale,
  theme
}: {
  points: HistoryPoint[];
  title: string;
  subtitle: string;
  locale: "en" | "es";
  theme: ReturnType<typeof getThemeById>;
}) {
  const width = 1040;
  const height = 380;
  const paddingLeft = 56;
  const paddingRight = 24;
  const paddingTop = 24;
  const paddingBottom = 48;

  const values = points.map((p) => p.total);
  const min = Math.min(...values);
  const max = Math.max(...values);

  const hasSinglePoint = points.length === 1;
  const paddedMin = hasSinglePoint
    ? Math.max(0, min * 0.92)
    : Math.max(0, min * 0.94);
  const paddedMax = hasSinglePoint ? max * 1.08 || max + 1 : max * 1.04;
  const range = Math.max(1, paddedMax - paddedMin);

  const first = points[0].total;
  const latest = points[points.length - 1].total;
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

  const usableWidth = width - paddingLeft - paddingRight;
  const usableHeight = height - paddingTop - paddingBottom;

  const toX = (index: number) => {
    if (points.length === 1) return paddingLeft + usableWidth / 2;
    return paddingLeft + (index * usableWidth) / (points.length - 1);
  };

  const toY = (value: number) => {
    return paddingTop + (1 - (value - paddedMin) / range) * usableHeight;
  };

  const coords = points.map((point, index) => ({
    x: toX(index),
    y: toY(point.total),
    value: point.total,
    date: point.date
  }));

  const linePath = hasSinglePoint ? "" : buildSmoothPath(coords);
  const areaPath = hasSinglePoint
    ? ""
    : `${linePath} L ${coords[coords.length - 1].x} ${height - paddingBottom} L ${coords[0].x} ${height - paddingBottom} Z`;

  const yTicks = buildNiceTicks(paddedMin, paddedMax, 4);
  const markerIndexes = getMarkerIndexes(points.length);

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

      {hasSinglePoint && (
        <div
          style={{
            marginBottom: 14,
            padding: "10px 12px",
            borderRadius: 14,
            background: theme.colors.surfaceAlt,
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.textMuted,
            fontSize: 13,
            lineHeight: 1.6
          }}
        >
          {locale === "es"
            ? "Este es tu punto inicial de histórico. A medida que importes más datos o ejecutes nuevas valoraciones, aquí empezará a dibujarse la evolución real."
            : "This is your initial history point. As you import more data or run new valuations, the real evolution will start to appear here."}
        </div>
      )}

      <div
        style={{
          borderRadius: 24,
          overflow: "hidden",
          border: `1px solid ${theme.colors.border}`,
          background: `linear-gradient(180deg, ${theme.colors.surface} 0%, ${theme.colors.surfaceAlt} 100%)`
        }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{
            width: "100%",
            height: "auto",
            display: "block"
          }}
        >
          <defs>
            <linearGradient id="collectionAreaFillV3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.colors.gold} stopOpacity="0.30" />
              <stop offset="55%" stopColor={theme.colors.gold} stopOpacity="0.10" />
              <stop offset="100%" stopColor={theme.colors.gold} stopOpacity="0.02" />
            </linearGradient>

            <filter id="softGlowV3">
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

          {!hasSinglePoint && (
            <>
              <path d={areaPath} fill="url(#collectionAreaFillV3)" stroke="none" />

              <path
                d={linePath}
                fill="none"
                stroke={theme.colors.gold}
                strokeOpacity="0.18"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#softGlowV3)"
              />

              <path
                d={linePath}
                fill="none"
                stroke={theme.colors.gold}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {hasSinglePoint && (
            <>
              <line
                x1={paddingLeft}
                y1={toY(points[0].total)}
                x2={width - paddingRight}
                y2={toY(points[0].total)}
                stroke={theme.colors.gold}
                strokeWidth="3"
                strokeDasharray="8 8"
                opacity={0.8}
              />
              <circle
                cx={coords[0].x}
                cy={coords[0].y}
                r="7"
                fill={theme.colors.gold}
              />
              <circle
                cx={coords[0].x}
                cy={coords[0].y}
                r="16"
                fill={theme.colors.gold}
                opacity="0.14"
              />
            </>
          )}

          {!hasSinglePoint &&
            markerIndexes.map((index) => {
              const point = coords[index];
              const isLast = index === coords.length - 1;

              return (
                <g key={`marker-${index}`}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={isLast ? "5.5" : "3.5"}
                    fill={isLast ? theme.colors.black : theme.colors.surface}
                    stroke={theme.colors.gold}
                    strokeWidth="2.5"
                  />
                  <circle cx={point.x} cy={point.y} r="14" fill="transparent">
                    <title>{`${formatChartDate(point.date, locale)} — ${point.value.toFixed(2)} €`}</title>
                  </circle>
                </g>
              );
            })}

          <text
            x={paddingLeft}
            y={height - 14}
            fontSize="11"
            fill={theme.colors.textMuted}
          >
            {formatChartDate(points[0].date, locale)}
          </text>

          <text
            x={width / 2}
            y={height - 14}
            fontSize="11"
            textAnchor="middle"
            fill={theme.colors.textMuted}
          >
            {locale === "es"
              ? `${points.length} snapshots`
              : `${points.length} snapshots`}
          </text>

          <text
            x={width - paddingRight}
            y={height - 14}
            fontSize="11"
            textAnchor="end"
            fill={theme.colors.textMuted}
          >
            {formatChartDate(points[points.length - 1].date, locale)}
          </text>
        </svg>
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