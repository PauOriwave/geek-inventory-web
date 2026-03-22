import { cookies } from "next/headers";
import { theme } from "../theme";

type Row = {
  category: string;
  units: number;
  value: number;
  items: number;
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
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
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
                fontSize: 12,
                color: theme.colors.textMuted,
                marginBottom: 6
              }}
            >
              {r.category}
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