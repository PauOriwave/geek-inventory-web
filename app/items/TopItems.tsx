import { cookies } from "next/headers";
import { theme } from "../theme";

type TopItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  estimatedPrice: number;
  totalValue: number;
};

const API = process.env.NEXT_PUBLIC_API_URL!;

async function getTopItems(cookieHeader: string): Promise<TopItem[]> {
  const res = await fetch(`${API}/stats/top-items?limit=10`, {
    cache: "no-store",
    headers: {
      cookie: cookieHeader
    }
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
        gap: 10,
        alignItems: "center",
        textDecoration: "none",
        color: "inherit",
        padding: "8px 6px",
        borderRadius: theme.radius.sm
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: theme.colors.textMuted
        }}
      >
        {idx + 1}
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: theme.colors.text,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}
          title={it.name}
        >
          {it.name}
        </div>

        <div
          style={{
            fontSize: 12,
            color: theme.colors.textMuted,
            marginTop: 2
          }}
        >
          {it.category} · {it.quantity} × {it.estimatedPrice.toFixed(2)}€
        </div>
      </div>

      <div
        style={{
          fontSize: 13,
          fontWeight: 800,
          color: theme.colors.text
        }}
      >
        {it.totalValue.toFixed(2)}€
      </div>
    </a>
  );
}

export default async function TopItems() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const items = await getTopItems(cookieHeader);

  const firstFive = items.slice(0, 5);
  const rest = items.slice(5);

  return (
    <section
      style={{
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.xl,
        padding: 14,
        width: 320,
        background: theme.colors.surface,
        boxShadow: theme.shadow.card
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          borderBottom: `1px solid ${theme.colors.border}`,
          paddingBottom: 10,
          marginBottom: 8
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 15, color: theme.colors.text }}>
          Top items
        </div>

        <div style={{ fontSize: 12, color: theme.colors.textMuted }}>
          by value
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {firstFive.map((it, idx) => (
          <TopItemRow key={it.id} it={it} idx={idx} />
        ))}

        {rest.length > 0 && (
          <details style={{ marginTop: 6 }}>
            <summary
              style={{
                cursor: "pointer",
                color: theme.colors.link,
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
                gap: 4
              }}
            >
              {rest.map((it, idx) => (
                <TopItemRow key={it.id} it={it} idx={idx + 5} />
              ))}
            </div>
          </details>
        )}

        {items.length === 0 && (
          <div style={{ color: theme.colors.textMuted }}>No items yet.</div>
        )}
      </div>
    </section>
  );
}