import { cookies } from "next/headers";
import { theme } from "../../theme";

type Snapshot = {
  id: string;
  source: string;
  marketValue: string | number;
  confidence?: number | null;
  recordedAt: string;
};

const API = process.env.NEXT_PUBLIC_API_URL!;

async function getSnapshots(
  id: string,
  cookieHeader: string
): Promise<Snapshot[]> {
  const res = await fetch(`${API}/items/${id}/snapshots`, {
    cache: "no-store",
    headers: {
      cookie: cookieHeader
    }
  });

  if (!res.ok) {
    throw new Error("Failed to fetch item snapshots");
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export default async function ItemSnapshotsPanel({
  id,
  locale = "en"
}: {
  id: string;
  locale?: "en" | "es";
}) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const snapshots = await getSnapshots(id, cookieHeader);
  const sortedSnapshots = [...snapshots].sort(
    (a, b) =>
      new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );

  const latestSnapshot = sortedSnapshots.at(-1);
  const firstSnapshot = sortedSnapshots[0];

  const latestValue =
    latestSnapshot?.marketValue != null ? Number(latestSnapshot.marketValue) : null;
  const firstValue =
    firstSnapshot?.marketValue != null ? Number(firstSnapshot.marketValue) : null;

  const delta =
    latestValue != null && firstValue != null ? latestValue - firstValue : null;

  const text = {
    title: locale === "es" ? "Historial de valoraciones" : "Valuation history",
    subtitle:
      locale === "es"
        ? "Evolución real del valor guardada desde el backend"
        : "Real value evolution stored by the backend",
    noData:
      locale === "es"
        ? "Todavía no hay snapshots para este objeto."
        : "There are no snapshots for this item yet.",
    source: locale === "es" ? "Fuente" : "Source",
    value: locale === "es" ? "Valor" : "Value",
    confidence: locale === "es" ? "Confianza" : "Confidence",
    date: locale === "es" ? "Fecha" : "Date",
    latest: locale === "es" ? "Último valor" : "Latest value",
    change: locale === "es" ? "Cambio histórico" : "Historical change",
    points: locale === "es" ? "puntos" : "points"
  };

  return (
    <section
      style={{
        marginTop: 18,
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
          gap: 14,
          alignItems: "flex-start",
          flexWrap: "wrap",
          marginBottom: 16
        }}
      >
        <div>
          <div
            style={{
              fontWeight: 900,
              fontSize: 17,
              color: theme.colors.text
            }}
          >
            {text.title}
          </div>

          <div
            style={{
              marginTop: 4,
              fontSize: 12,
              color: theme.colors.textMuted
            }}
          >
            {text.subtitle}
          </div>
        </div>

        {sortedSnapshots.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              justifyContent: "flex-end"
            }}
          >
            <MetricPill
              label={text.latest}
              value={latestValue != null ? `${latestValue.toFixed(2)} €` : "—"}
            />
            <MetricPill
              label={text.change}
              value={
                delta != null ? `${delta > 0 ? "+" : ""}${delta.toFixed(2)} €` : "—"
              }
              tone={delta != null && delta > 0 ? "up" : delta != null && delta < 0 ? "down" : "flat"}
            />
            <MetricPill
              label={text.points}
              value={String(sortedSnapshots.length)}
            />
          </div>
        )}
      </div>

      {sortedSnapshots.length === 0 ? (
        <div
          style={{
            border: `1px dashed ${theme.colors.border}`,
            borderRadius: theme.radius.lg,
            padding: 20,
            background: theme.colors.surfaceAlt,
            color: theme.colors.textMuted,
            textAlign: "center"
          }}
        >
          {text.noData}
        </div>
      ) : (
        <>
          <div
            style={{
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radius.xl,
              background:
                "linear-gradient(180deg, rgba(200,164,77,0.10) 0%, rgba(255,255,255,0) 100%)",
              padding: 14,
              marginBottom: 14,
              overflow: "hidden"
            }}
          >
            <ItemValueChart snapshots={sortedSnapshots} height={260} />
          </div>

          <div
            style={{
              display: "grid",
              gap: 10
            }}
          >
            {[...sortedSnapshots].reverse().map((snapshot, index) => {
              const value = Number(snapshot.marketValue);
              const confidence =
                typeof snapshot.confidence === "number"
                  ? snapshot.confidence
                  : null;

              return (
                <div
                  key={snapshot.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "56px 1fr auto",
                    gap: 12,
                    alignItems: "center",
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: theme.radius.lg,
                    padding: 12,
                    background:
                      index === 0 ? theme.colors.surfaceAlt : theme.colors.surface
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 999,
                      background: theme.colors.gold,
                      color: theme.colors.black,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                      fontSize: 12
                    }}
                  >
                    #{sortedSnapshots.length - index}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                        alignItems: "center"
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          color: theme.colors.textMuted
                        }}
                      >
                        {text.source}:
                      </span>

                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 8px",
                          borderRadius: 999,
                          background: theme.colors.surfaceAlt,
                          border: `1px solid ${theme.colors.border}`,
                          fontSize: 12,
                          fontWeight: 800,
                          color: theme.colors.text
                        }}
                      >
                        {snapshot.source}
                      </span>

                      {confidence !== null && (
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 8px",
                            borderRadius: 999,
                            background: theme.colors.surface,
                            border: `1px solid ${theme.colors.border}`,
                            fontSize: 12,
                            fontWeight: 700,
                            color: theme.colors.textMuted
                          }}
                        >
                          {text.confidence}: {formatConfidence(confidence)}
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 12,
                        color: theme.colors.textMuted
                      }}
                    >
                      {text.date}: {formatDate(snapshot.recordedAt, locale)}
                    </div>
                  </div>

                  <div
                    style={{
                      fontWeight: 900,
                      fontSize: 18,
                      color: theme.colors.text,
                      whiteSpace: "nowrap"
                    }}
                  >
                    {Number.isFinite(value) ? `${value.toFixed(2)} €` : "—"}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}

function ItemValueChart({
  snapshots,
  height
}: {
  snapshots: Snapshot[];
  height: number;
}) {
  const points = snapshots
    .map((snapshot) => ({
      value: Number(snapshot.marketValue),
      date: snapshot.recordedAt
    }))
    .filter((point) => Number.isFinite(point.value));

  if (points.length === 0) {
    return (
      <div
        style={{
          minHeight: height,
          display: "grid",
          placeItems: "center",
          color: theme.colors.textMuted,
          fontSize: 13
        }}
      >
        —
      </div>
    );
  }

  const width = 900;
  const paddingX = 34;
  const paddingY = 24;
  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const coordinates = points.map((point, index) => {
    const x =
      points.length === 1
        ? width / 2
        : paddingX + (index / (points.length - 1)) * (width - paddingX * 2);

    const y =
      paddingY +
      ((max - point.value) / range) * (height - paddingY * 2);

    return { ...point, x, y };
  });

  const linePath =
    coordinates.length === 1
      ? ""
      : coordinates
          .map((point, index) =>
            index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`
          )
          .join(" ");

  const areaPath =
    coordinates.length > 1
      ? `${linePath} L ${coordinates[coordinates.length - 1].x} ${height - paddingY} L ${coordinates[0].x} ${height - paddingY} Z`
      : "";

  const latest = coordinates[coordinates.length - 1];
  const first = coordinates[0];
  const positive = latest.value >= first.value;
  const stroke = positive ? theme.colors.success : theme.colors.danger;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Item valuation chart"
      style={{
        display: "block",
        width: "100%",
        height,
        overflow: "visible"
      }}
    >
      <defs>
        <linearGradient id="itemChartArea" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.24" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {[0, 1, 2, 3].map((line) => {
        const y = paddingY + (line / 3) * (height - paddingY * 2);
        return (
          <line
            key={line}
            x1={paddingX}
            x2={width - paddingX}
            y1={y}
            y2={y}
            stroke={theme.colors.border}
            strokeDasharray="5 7"
            strokeOpacity="0.8"
          />
        );
      })}

      {areaPath && <path d={areaPath} fill="url(#itemChartArea)" />}

      {linePath && (
        <path
          d={linePath}
          fill="none"
          stroke={stroke}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {coordinates.map((point, index) => (
        <g key={`${point.date}-${index}`}>
          <circle
            cx={point.x}
            cy={point.y}
            r={index === coordinates.length - 1 ? 6 : 4}
            fill={theme.colors.surface}
            stroke={stroke}
            strokeWidth="3"
          />
          {index === coordinates.length - 1 && (
            <text
              x={Math.max(72, point.x - 54)}
              y={Math.max(18, point.y - 14)}
              fill={theme.colors.text}
              fontSize="13"
              fontWeight="800"
            >
              {point.value.toFixed(2)} €
            </text>
          )}
        </g>
      ))}

      <text
        x={paddingX}
        y={height - 4}
        fill={theme.colors.textMuted}
        fontSize="12"
        fontWeight="700"
      >
        {formatShortDate(points[0].date)}
      </text>

      <text
        x={width - paddingX}
        y={height - 4}
        fill={theme.colors.textMuted}
        fontSize="12"
        fontWeight="700"
        textAnchor="end"
      >
        {formatShortDate(points[points.length - 1].date)}
      </text>
    </svg>
  );
}

function MetricPill({
  label,
  value,
  tone = "flat"
}: {
  label: string;
  value: string;
  tone?: "up" | "down" | "flat";
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
        border: `1px solid ${theme.colors.border}`,
        background: theme.colors.surfaceAlt,
        borderRadius: 999,
        padding: "8px 12px"
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: theme.colors.textMuted,
          fontWeight: 800
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 2,
          fontSize: 14,
          color,
          fontWeight: 900
        }}
      >
        {value}
      </div>
    </div>
  );
}

function formatDate(value: string, locale: "en" | "es") {
  return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short"
  }).format(new Date(value));
}

function formatConfidence(value: number) {
  if (value <= 1) {
    return `${Math.round(value * 100)}%`;
  }

  return `${Math.round(value)}%`;
}