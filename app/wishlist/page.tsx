import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getThemeById, AppThemeId } from "../theme";
import { getLocale } from "../i18n";

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

export default async function WishlistPage({
  searchParams
}: {
  searchParams?:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
}) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const session = cookieStore.get("session")?.value;

  if (!session) {
    redirect("/login");
  }

  const sp =
    searchParams instanceof Promise ? await searchParams : searchParams ?? {};

  const locale = getLocale(sp);

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
        padding: 24,
        fontFamily: "system-ui"
      }}
    >
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        {/* NAV */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 18,
            flexWrap: "wrap"
          }}
        >
          <a
            href={`/items?lang=${locale}`}
            style={{
              textDecoration: "none",
              borderRadius: 999,
              padding: "10px 14px",
              background: theme.colors.surface,
              color: theme.colors.text,
              fontWeight: 800,
              border: `1px solid ${theme.colors.border}`
            }}
          >
            {locale === "es" ? "Colección" : "Collection"}
          </a>

          <a
            href={`/profile?lang=${locale}`}
            style={{
              textDecoration: "none",
              borderRadius: 999,
              padding: "10px 14px",
              background: theme.colors.surface,
              color: theme.colors.text,
              fontWeight: 800,
              border: `1px solid ${theme.colors.border}`
            }}
          >
            {locale === "es" ? "Perfil" : "Profile"}
          </a>

          <span
            style={{
              borderRadius: 999,
              padding: "10px 14px",
              background: theme.colors.black,
              color: "white",
              fontWeight: 800
            }}
          >
            Wishlist
          </span>
        </div>

        {/* HEADER */}
        <div
          style={{
            background: theme.colors.black,
            color: "white",
            borderRadius: theme.radius.xl,
            padding: "18px 20px",
            marginBottom: 20
          }}
        >
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>
            Wishlist
          </h1>

          <p
            style={{
              marginTop: 8,
              color: "rgba(255,255,255,0.78)"
            }}
          >
            {locale === "es"
              ? "Sigue los objetos que quieres conseguir y vigila su precio."
              : "Track items you want and monitor their value."}
          </p>
        </div>

        {/* LIST */}
        {items.length === 0 ? (
          <p style={{ color: theme.colors.textMuted }}>
            {locale === "es" ? "No hay items aún." : "No items yet."}
          </p>
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
                <div style={{ fontWeight: 800 }}>{item.name}</div>

                <div
                  style={{
                    fontSize: 12,
                    color: theme.colors.textMuted,
                    marginTop: 4
                  }}
                >
                  {item.category}
                </div>

                <div style={{ marginTop: 10 }}>
                  🎯 {formatPrice(item.targetPrice)} · 📈{" "}
                  {formatPrice(item.currentMarketValue)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}