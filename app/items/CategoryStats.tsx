type Row = {
  category: string;
  units: number;
  value: number;
  items: number;
};

const API = process.env.NEXT_PUBLIC_API_URL!;

async function getByCategory(): Promise<Row[]> {
  const res = await fetch(`${API}/stats/by-category`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch by-category stats");
  return res.json();
}

export default async function CategoryStats() {
  const rows = await getByCategory();

  return (
    <section style={{ marginTop: 16 }}>
      <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 10 }}>
        Value by Category
      </h2>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {rows.map((r) => (
          <a
            key={r.category}
            href={`/items?category=${encodeURIComponent(r.category)}&page=1&pageSize=25`}
            style={{
              textDecoration: "none",
              color: "inherit",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 12,
              minWidth: 180,
              display: "block"
            }}
          >
            <div style={{ fontSize: 12, color: "#6b7280" }}>{r.category}</div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>
              {r.value.toFixed(2)} €
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
              Units: {r.units} · Items: {r.items}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}