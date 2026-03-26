import { cookies } from "next/headers";
import { theme } from "../theme";

type HistoryPoint = {
  date: string;
  total: number;
};

const API = process.env.NEXT_PUBLIC_API_URL!;

async function getCollectionHistory(
  cookieHeader: string
): Promise<HistoryPoint[]> {
  const res = await fetch(`${API}/stats/collection-history`, {
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

export default async function CollectionValueChart() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const points = await getCollectionHistory(cookieHeader);

  return (
    <section
      style={{
        marginTop: 14,
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.xl,
        padding: 16,
        boxShadow: theme.shadow.card
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 12
        }}
      >
        <div
          style={{
            fontWeight: 800,
            fontSize: 15,
            color: theme.colors.text
          }}
        >
          Collection value trend
        </div>

        <div
          style={{
            fontSize: 12,
            color: theme.colors.textMuted
          }}
        >
          snapshots history
        </div>
      </div>

      {points.length === 0 ? (
        <div style={{ color: theme.colors.textMuted }}>
          No valuation history yet. Use “Valuate” on your items to build the chart.
        </div>
      ) : (
        <MiniCollectionChart points={points} />
      )}
    </section>
  );
}

function MiniCollectionChart({ points }: { points: HistoryPoint[] }) {
  const width = 760;
  const height = 220;
  const padding = 28;

  const values = points.map((p) => p.total);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const toX = (index: number) => {
    if (points.length === 1) return width / 2;
    return (
      padding + (index * (width - padding * 2)) / (points.length - 1)
    );
  };

  const toY = (value: number) => {
    return height - padding - ((value - min) / range) * (height - padding * 2);
  };

  const polylinePoints = points
    .map((point, index) => `${toX(index)},${toY(point.total)}`)
    .join(" ");

  const first = points[0].total;
  const latest = points[points.length - 1].total;
  const delta = latest - first;
  const positive = delta > 0;

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{
          width: "100%",
          height: "auto",
          display: "block"
        }}
      >
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#E5E7EB"
          strokeWidth="1"
        />

        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#E5E7EB"
          strokeWidth="1"
        />

        <polyline
          fill="none"
          stroke={theme.colors.gold}
          strokeWidth="3"
          points={polylinePoints}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((point, index) => (
          <circle
            key={`${point.date}-${index}`}
            cx={toX(index)}
            cy={toY(point.total)}
            r="4"
            fill={theme.colors.black}
          />
        ))}

        <text x={padding} y={16} fontSize="12" fill="#6B7280">
          Max: {max.toFixed(2)} €
        </text>

        <text x={padding} y={height - 6} fontSize="12" fill="#6B7280">
          Min: {min.toFixed(2)} €
        </text>

        <text
          x={width - padding}
          y={18}
          textAnchor="end"
          fontSize="12"
          fill="#111827"
          fontWeight="700"
        >
          Current: {latest.toFixed(2)} €
        </text>
      </svg>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          marginTop: 10,
          flexWrap: "wrap"
        }}
      >
        <StatPill label="First" value={`${first.toFixed(2)} €`} />
        <StatPill label="Latest" value={`${latest.toFixed(2)} €`} />
        <StatPill
          label="Change"
          value={`${positive ? "+" : ""}${delta.toFixed(2)} €`}
          positive={positive}
          negative={delta < 0}
        />
        <StatPill label="Points" value={String(points.length)} />
      </div>

      <div
        style={{
          marginTop: 10,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          color: theme.colors.textMuted
        }}
      >
        <span>{points[0].date}</span>
        <span>{points[points.length - 1].date}</span>
      </div>
    </div>
  );
}

function StatPill({
  label,
  value,
  positive = false,
  negative = false
}: {
  label: string;
  value: string;
  positive?: boolean;
  negative?: boolean;
}) {
  const bg = positive ? "#ECFDF3" : negative ? "#FEF3F2" : "#F9FAFB";
  const color = positive
    ? "#027A48"
    : negative
      ? "#B42318"
      : theme.colors.text;

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