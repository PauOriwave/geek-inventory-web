import { cookies } from "next/headers";
import { theme } from "../theme";

type Row = {
  category: string;
  units: number;
  value: number;
  items: number;
  trend: "rising" | "dropping" | "stable";
  trendDelta: number;
};

const API = process.env.NEXT_PUBLIC_API_URL!;

async function getByCategory(cookieHeader: string): Promise<Row[]> {
  const res = await fetch(`${API}/stats/by-category`, {
    cache: "no-store",
    headers: {
      cookie: cookieHeader
    }
  });

  if (!res.ok) {
    throw new Error("Failed to fetch by-category stats");
  }

  return res.json();
}

export default async function CategoryStats() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const rows = await getByCategory(cookieHeader);

  return (
    <section style={{ marginTop: 14 }}>
      <h2
        style={{
          fontSize: 15,
          fontWeight: 800,
          marginBottom: 10,
          color: theme.colors.text
        }}
      >
        Value by category
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 10
        }}
      >
        {rows.map((r) => (
          <a
            key={r.category}
            href={`/items?category=${encodeURIComponent(r.category)}&page=1&pageSize=25`}
            style={{
              textDecoration: "none",
              color: "inherit",
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radius.md,
              padding: 12,
              background: theme.colors.surface,
              boxShadow: theme.shadow.soft,
              display: "block"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
                alignItems: "center",
                marginBottom: 6
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: theme.colors.textMuted
                }}
              >
                {r.category}
              </div>

              <TrendBadge trend={r.trend} delta={r.trendDelta} />
            </div>

            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: theme.colors.text
              }}
            >
              {r.value.toFixed(2)} €
            </div>

            <div
              style={{
                fontSize: 12,
                color: theme.colors.textMuted,
                marginTop: 6
              }}
            >
              Units: {r.units} · Items: {r.items}
            </div>
          </a>
        ))}

        {rows.length === 0 && (
          <div style={{ color: theme.colors.textMuted }}>No data yet.</div>
        )}
      </div>
    </section>
  );
}

function TrendBadge({
  trend,
  delta
}: {
  trend: "rising" | "dropping" | "stable";
  delta: number;
}) {
  const positive = trend === "rising";
  const negative = trend === "dropping";

  const bg = positive ? "#ECFDF3" : negative ? "#FEF3F2" : "#F9FAFB";
  const color = positive
    ? "#027A48"
    : negative
      ? "#B42318"
      : theme.colors.textMuted;

  const label =
    trend === "rising"
      ? "Rising"
      : trend === "dropping"
        ? "Dropping"
        : "Stable";

  const formattedDelta =
    delta === 0 ? "0.00€" : `${delta > 0 ? "+" : ""}${delta.toFixed(2)}€`;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 8px",
        borderRadius: 999,
        border: `1px solid ${theme.colors.border}`,
        background: bg,
        color,
        fontSize: 12,
        fontWeight: 700,
        whiteSpace: "nowrap"
      }}
    >
      <span>{label}</span>
      <span>{formattedDelta}</span>
    </span>
  );
}