import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getThemeById, AppThemeId } from "../theme";

type WishlistItem = {
  id: string;
  name: string;
  category: string;
  targetPrice?: string | number | null;
  currentMarketValue?: string | number | null;
  platform?: string | null;
  region?: string | null;
  notes?: string | null;
  createdAt: string;
};

const API = process.env.NEXT_PUBLIC_API_URL!;

function formatPrice(value?: string | number | null) {
  if (value == null) return "—";
  return `${Number(value).toFixed(2)} €`;
}

export default async function WishlistPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const session = cookieStore.get("session")?.value;

  if (!session) {
    redirect("/login");
  }

  const themeId =
    (cookieStore.get("ui_theme")?.value as AppThemeId | undefined) ?? "classic";
  const theme = getThemeById(themeId);

  let items: WishlistItem[] = [];

  try {
    const res = await fetch(`${API}/wishlist`, {
      cache: "no-store",
      headers: {
        cookie: cookieHeader
      }
    });

    if (res.ok) {
      const data = await res.json();
      items = Array.isArray(data) ? data : [];
    }
  } catch {}

  return (
    <main
      style={{
        minHeight: "100vh",
        background: theme.colors.bg,
        color: theme.colors.text,
        padding: 24
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, fontWeight: 900 }}>Wishlist</h1>

        <div style={{ marginTop: 20 }}>
          {items.length === 0 ? (
            <p style={{ color: theme.colors.textMuted }}>No items yet.</p>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: theme.radius.lg,
                    padding: 14,
                    background: theme.colors.surface
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: 16 }}>
                    {item.name}
                  </div>

                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 12,
                      color: theme.colors.textMuted
                    }}
                  >
                    {item.category}
                  </div>

                  <div
                    style={{
                      marginTop: 12,
                      display: "grid",
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                      gap: 10
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 12,
                          color: theme.colors.textMuted,
                          marginBottom: 4
                        }}
                      >
                        Target price
                      </div>
                      <div style={{ fontWeight: 700 }}>
                        {formatPrice(item.targetPrice)}
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: 12,
                          color: theme.colors.textMuted,
                          marginBottom: 4
                        }}
                      >
                        Current value
                      </div>
                      <div style={{ fontWeight: 700 }}>
                        {formatPrice(item.currentMarketValue)}
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: 12,
                          color: theme.colors.textMuted,
                          marginBottom: 4
                        }}
                      >
                        Platform
                      </div>
                      <div style={{ fontWeight: 700 }}>
                        {item.platform || "—"}
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: 12,
                          color: theme.colors.textMuted,
                          marginBottom: 4
                        }}
                      >
                        Region
                      </div>
                      <div style={{ fontWeight: 700 }}>
                        {item.region || "—"}
                      </div>
                    </div>
                  </div>

                  {item.notes && (
                    <div style={{ marginTop: 12 }}>
                      <div
                        style={{
                          fontSize: 12,
                          color: theme.colors.textMuted,
                          marginBottom: 4
                        }}
                      >
                        Notes
                      </div>
                      <div style={{ lineHeight: 1.5 }}>{item.notes}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}