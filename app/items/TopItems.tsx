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

function TopItemRow({
  it,
  idx
}: {
  it: TopItem;
  idx: number;
}) {
  return (
    <a
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
  );
}

export default async function TopItems() {
  const items = await getTopItems();

  const firstFive = items.slice(0, 5);
  const rest = items.slice(5);

  return (
    <section
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 12,
        width: 320,
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
        <div style={{ fontWeight: 800 }}>Top items</div>
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
        {firstFive.map((it, idx) => (
          <TopItemRow key={it.id} it={it} idx={idx} />
        ))}

        {rest.length > 0 && (
          <details style={{ marginTop: 4 }}>
            <summary
              style={{
                cursor: "pointer",
                color: "#2563eb",
                fontSize: 13,
                userSelect: "none"
              }}
            >
              Show {rest.length} more
            </summary>

            <div
              style={{
                marginTop: 8,
                display: "flex",
                flexDirection: "column",
                gap: 8
              }}
            >
              {rest.map((it, idx) => (
                <TopItemRow key={it.id} it={it} idx={idx + 5} />
              ))}
            </div>
          </details>
        )}

        {items.length === 0 && (
          <div style={{ color: "#6b7280" }}>No items yet.</div>
        )}
      </div>
    </section>
  );
}