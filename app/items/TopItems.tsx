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

async function getTopItems(
  cookieHeader: string,
  category?: string
): Promise<TopItem[]> {
  const qs = new URLSearchParams();
  qs.set("limit", "10");

  if (category) {
    qs.set("category", category);
  }

  const res = await fetch(`${API}/stats/top-items?${qs.toString()}`, {
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

export default async function TopItems({
  category
}: {
  category?: string;
}) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const items = await getTopItems(cookieHeader, category);

  return (
    <section
      style={{
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.xl,
        padding: 14,
        background: theme.colors.surface,
        boxShadow: theme.shadow.card
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline"
        }}
      >
        <div style={{ fontWeight: 800 }}>
          {category ? `Top ${capitalize(category)} items` : "Top 10 items"}
        </div>

        <div style={{ fontSize: 12, color: theme.colors.textMuted }}>
          by value
        </div>
      </div>

      <div
        style={{
          marginTop: 10,
          display: "flex",
          flexDirection: "column",
          gap: 8
        }}
      >
        {items.slice(0, 5).map((it, idx) => (
          <a
            key={it.id}
            href={`/items/${it.id}`}
            style={{
              textDecoration: "none",
              color: theme.colors.text
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "24px 1fr auto",
                gap: 8,
                alignItems: "center",
                padding: "6px 8px",
                borderRadius: 8
              }}
            >
              <div style={{ fontSize: 12, color: theme.colors.textMuted }}>
                {idx + 1}
              </div>

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

                <div style={{ fontSize: 12, color: theme.colors.textMuted }}>
                  {it.quantity} × {it.estimatedPrice.toFixed(2)}€
                </div>
              </div>

              <div style={{ fontWeight: 800 }}>
                {it.totalValue.toFixed(2)}€
              </div>
            </div>
          </a>
        ))}

        {items.length === 0 && (
          <div style={{ color: theme.colors.textMuted }}>
            No items in this category.
          </div>
        )}
      </div>
    </section>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}