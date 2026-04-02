import { cookies } from "next/headers";
import { theme } from "../theme";
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
  const qs = category ? `?category=${encodeURIComponent(category)}` : "";

  const res = await fetch(`${API}/stats/collection-history${qs}`, {
    cache: "no-store",
    headers: {
      cookie: cookieHeader
    }
  });

  if (!res.ok) {
    throw new Error("Failed to fetch collection history");
  }

  return res.json();
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
          padding: 18,
          boxShadow: theme.shadow.card
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "baseline",
            marginBottom: 8
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 800,
                fontSize: 16,
                color: theme.colors.text
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: 12,
                color: theme.colors.textMuted,
                marginTop: 4
              }}
            >
              {subtitle}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            border: `1px dashed ${theme.colors.border}`,
            borderRadius: theme.radius.lg,
            padding: 24,
            textAlign: "center",
            background: theme.colors.surfaceAlt,
            color: theme.colors.textMuted
          }}
        >
          {locale === "es"
            ? "Todavía no hay suficientes snapshots para mostrar la evolución. Valora tus objetos para empezar a construir el histórico."
            : "There are not enough snapshots yet to show evolution. Valuate your items to start building history."}
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
    />
  );
}

function CollectionChartCard({
  points,
  title,
  subtitle,
  locale
}: {
  points: HistoryPoint[];
  title: string;
  subtitle: string;
  locale: "en" | "es";
}) {
  const width = 880;
  const height = 280;
  const paddingX = 26;
  const paddingTop = 28;
  const paddingBottom = 38;

  const values = points.map((p) => p.total);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const first = points[0].total;
  const latest = points[points.length - 1].total;
  const delta = latest - first;
  const percent = first > 0 ? (delta / first) * 100 : 0;

  const positive = delta > 0;
  const negative = delta < 0;

  const toX = (index: number) => {
    if (points.length === 1) return width / 2;
    return (
      paddingX +
      (index * (width - paddingX * 2)) / Math.max(1, points.length - 1)
    );
  };

  const toY = (value: number) => {
    const usableHeight = height - paddingTop - paddingBottom;
    return paddingTop + (1 - (value - min) / range) * usableHeight;
  };

  const linePoints = points
    .map((point, index) => `${toX(index)},${toY(point.total)}`)
    .join(" ");

  const areaPoints = [
    `${toX(0)},${height - paddingBottom}`,
    ...points.map((point, index) => `${toX(index)},${toY(point.total)}`),
    `${toX(points.length - 1)},${height - paddingBottom}`
  ].join(" ");

  const trendColor = positive
    ? "#027A48"
    : negative
      ? "#B42318"
      : theme.colors.textMuted;

  const trendBg = positive ? "#ECFDF3" : negative ? "#FEF3F2" : "#F9FAFB";

  const yTicks = buildYTicks(min, max);

  return (
    <section
      style={{
        marginTop: 14,
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.xl,
        padding: 18,
        boxShadow: theme.shadow.card
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap"
        }}
      >
        <div>
          <div
            style={{
              fontWeight: 800,
              fontSize: 16,
              color: theme.colors.text
            }}
          >
            {title}
          </div>

          <div
            style={{
              fontSize: 12,
              color: theme.colors.textMuted,
              marginTop: 4
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
            alignItems: "center",
            justifyContent: "flex-end"
          }}
        >
          <MetricPill
            label={locale === "es" ? "Inicial" : "Initial"}
            value={`${first.toFixed(2)} €`}
          />
          <MetricPill
            label={locale === "es" ? "Actual" : "Current"}
            value={`${latest.toFixed(2)} €`}
          />
          <MetricPill
            label={locale === "es" ? "Cambio" : "Change"}
            value={`${positive ? "+" : ""}${delta.toFixed(2)} €`}
            bg={trendBg}
            color={trendColor}
          />
          <MetricPill
            label={locale === "es" ? "Variación" : "Variation"}
            value={`${percent >= 0 ? "+" : ""}${percent.toFixed(1)}%`}
            bg={trendBg}
            color={trendColor}
          />
        </div>
      </div>

      <div
        style={{
          marginTop: 16,
          borderRadius: theme.radius.lg,
          overflow: "hidden",
          border: `1px solid ${theme.colors.border}`,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(249,250,251,1) 100%)"
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
          {yTicks.map((tick) => {
            const y = toY(tick);
            return (
              <g key={tick}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#E5E7EB"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX}
                  y={y - 6}
                  fontSize="11"
                  fill="#6B7280"
                >
                  {tick.toFixed(0)} €
                </text>
              </g>
            );
          })}

          <polyline
            fill="rgba(200,164,77,0.16)"
            stroke="none"
            points={areaPoints}
          />

          <polyline
            fill="none"
            stroke={theme.colors.gold}
            strokeWidth="4"
            points={linePoints}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((point, index) => {
            const x = toX(index);
            const y = toY(point.total);

            return (
              <g key={`${point.date}-${index}`}>
                <circle
                  cx={x}
                  cy={y}
                  r="5"
                  fill={theme.colors.black}
                />
                <circle
                  cx={x}
                  cy={y}
                  r="10"
                  fill="transparent"
                >
                  <title>{`${point.date} — ${point.total.toFixed(2)} €`}</title>
                </circle>
              </g>
            );
          })}

          <line
            x1={paddingX}
            y1={height - paddingBottom}
            x2={width - paddingX}
            y2={height - paddingBottom}
            stroke="#D1D5DB"
          />
        </svg>
      </div>

      <div
        style={{
          marginTop: 10,
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          color: theme.colors.textMuted,
          fontSize: 12,
          flexWrap: "wrap"
        }}
      >
        <span>{formatChartDate(points[0].date, locale)}</span>
        <span>
          {locale === "es" ? "Snapshots" : "Snapshots"}: {points.length}
        </span>
        <span>{formatChartDate(points[points.length - 1].date, locale)}</span>
      </div>
    </section>
  );
}

function MetricPill({
  label,
  value,
  bg = theme.colors.surfaceAlt,
  color = theme.colors.text
}: {
  label: string;
  value: string;
  bg?: string;
  color?: string;
}) {
  return (
    <div
      style={{
        padding: "8px 10px",
        borderRadius: 999,
        border: `1px solid ${theme.colors.border}`,
        background: bg,
        fontSize: 12
      }}
    >
      <span style={{ color: theme.colors.textMuted }}>{label}: </span>
      <span style={{ fontWeight: 800, color }}>{value}</span>
    </div>
  );
}

function buildYTicks(min: number, max: number) {
  if (min === max) {
    return [min];
  }

  const steps = 4;
  const ticks: number[] = [];

  for (let i = 0; i <= steps; i++) {
    ticks.push(min + ((max - min) * i) / steps);
  }

  return ticks;
}

function formatChartDate(value: string, locale: "en" | "es") {
  const date = new Date(value);
  return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}