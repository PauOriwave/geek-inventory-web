import { theme } from "../theme";

type Row = {
  category: string;
  units: number;
  value: number;
  items: number;
};

const API = process.env.NEXT_PUBLIC_API_URL!;

async function getByCategory(): Promise<Row[]> {
  const res = await fetch(`${API}/stats/by-category`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error("Failed to fetch by-category stats");
  }

  return res.json();
}

export default async function CategoryBars() {
  const rows = await getByCategory();
  const maxValue = Math.max(...rows.map((r) => r.value), 1);

  return (
    <section
      style={{
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.lg,
        padding: 14,
        background: theme.colors.surface,
        boxShadow: theme.shadow.card
      }}
    >
      <div
        style={{
          fontWeight: 800,
          marginBottom: 12,
          color: theme.colors.text
        }}
      >
        Category breakdown
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.map((r) => {
          const percent = (r.value / maxValue) * 100;

          return (
            <a
              key={r.category}
              href={`/items?category=${encodeURIComponent(r.category)}&page=1&pageSize=25`}
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "grid",
                gridTemplateColumns: "90px 1fr auto",
                gap: 10,
                alignItems: "center"
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: theme.colors.textMuted,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
              >
                {r.category}
              </div>

              <div
                style={{
                  height: 10,
                  borderRadius: 999,
                  background: "#F3F4F6",
                  overflow: "hidden"
                }}
              >
                <div
                  style={{
                    width: `${Math.max(percent, 6)}%`,
                    height: "100%",
                    background: theme.colors.gold,
                    borderRadius: 999
                  }}
                />
              </div>

              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: theme.colors.text
                }}
              >
                {r.value.toFixed(0)}€
              </div>
            </a>
          );
        })}

        {rows.length === 0 && (
          <div style={{ color: theme.colors.textMuted }}>No data yet.</div>
        )}
      </div>
    </section>
  );
}