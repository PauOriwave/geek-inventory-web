type TopItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  estimatedPrice: number;
  totalValue: number;
};

const API = process.env.NEXT_PUBLIC_API_URL!;

async function getTopItems(): Promise<TopItem[]> {
  const res = await fetch(`${API}/stats/top-items?limit=10`, {
    cache: "no-store"
  });

  if (!res.ok) {
    throw new Error("Failed to fetch top items");
  }

  return res.json();
}

export default async function TopItems() {
  const items = await getTopItems();

  return (
    <section
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 12,
        width: 360,
        background: "white"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline"
        }}
      >
        <div style={{ fontWeight: 800 }}>Top 10 items</div>
        <div style={{ fontSize: 12, color: "#6b7280" }}>by value</div>
      </div>

      <div
        style={{
          marginTop: 10,
          display: "flex",
          flexDirection: "column",
          gap: 8
        }}
      >
        {items.map((it, idx) => (
          <a
            key={it.id}
            href={`/items/${it.id}`}
            style={{
              display: "grid",
              gridTemplateColumns: "24px 1fr auto",
              gap: 8,
              alignItems: "center",
              textDecoration: "none",
              color: "inherit",
              padding: "6px 4px",
              borderRadius: 8
            }}
          >
            <div style={{ color: "#6b7280", fontSize: 12 }}>{idx + 1}</div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
                title={it.name}
              >
                {it.name}
              </div>

              <div style={{ fontSize: 12, color: "#6b7280" }}>
                {it.category} · {it.quantity} × {it.estimatedPrice.toFixed(2)}€
              </div>
            </div>

            <div style={{ fontWeight: 800 }}>{it.totalValue.toFixed(2)}€</div>
          </a>
        ))}

        {items.length === 0 && (
          <div style={{ color: "#6b7280" }}>No items yet.</div>
        )}
      </div>
    </section>
  );
}