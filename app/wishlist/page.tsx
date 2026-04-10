import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getThemeById, AppThemeId } from "../theme";
import { getLocale } from "../i18n";

type WishlistItem = {
  id: string;
  title?: string | null;
  name?: string | null;
  category?: string | null;
  createdAt?: string;
  targetPrice?: string | number | null;
  currentMarketValue?: string | number | null;
  platform?: string | null;
  region?: string | null;
  notes?: string | null;
};

const API = process.env.NEXT_PUBLIC_API_URL!;

async function getWishlist(cookie: string): Promise<WishlistItem[]> {
  try {
    const res = await fetch(`${API}/wishlist`, {
      cache: "no-store",
      headers: { cookie }
    });

    if (!res.ok) return [];

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function formatPrice(value?: string | number | null) {
  if (value == null) return "—";
  const num = Number(value);
  if (Number.isNaN(num)) return "—";
  return `${num.toFixed(2)} €`;
}

function getDisplayName(item: WishlistItem) {
  return item.name || item.title || "Untitled item";
}

function getWishlistStatus(
  targetPrice?: string | number | null,
  currentMarketValue?: string | number | null,
  locale: "en" | "es" = "en"
) {
  if (targetPrice == null || currentMarketValue == null) {
    return locale === "es" ? "Sin objetivo" : "No target";
  }

  const target = Number(targetPrice);
  const current = Number(currentMarketValue);

  if (Number.isNaN(target) || Number.isNaN(current)) {
    return locale === "es" ? "Sin objetivo" : "No target";
  }

  if (current <= target) {
    return locale === "es" ? "Buen momento" : "Good moment";
  }

  if (current <= target * 1.1) {
    return locale === "es" ? "Vigilar de cerca" : "Watch closely";
  }

  return locale === "es"
    ? "Por encima del objetivo"
    : "Above target";
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

  const items = await getWishlist(cookieHeader);

  const text = {
    title: "Wishlist",
    subtitle:
      locale === "es"
        ? "Sigue las piezas que quieres comprar y controla cuándo se acercan a tu precio ideal."
        : "Track the pieces you want to buy and monitor when they get close to your ideal price.",
    collection: locale === "es" ? "Colección" : "Collection",
    profile: locale === "es" ? "Perfil" : "Profile",
    activeSection: "Wishlist",
    addPlaceholder:
      locale === "es"
        ? "Añadir item (ej. Zelda Switch)"
        : "Add item (e.g. Zelda Switch)",
    add: locale === "es" ? "Añadir" : "Add",
    empty:
      locale === "es"
        ? "Todavía no tienes elementos en wishlist."
        : "You do not have wishlist items yet.",
    emptyHint:
      locale === "es"
        ? "Empieza guardando juegos, libros o piezas que quieras seguir antes de comprarlos."
        : "Start by saving games, books or pieces you want to track before buying.",
    category: locale === "es" ? "Categoría" : "Category",
    targetPrice: locale === "es" ? "Precio objetivo" : "Target price",
    currentValue: locale === "es" ? "Valor actual" : "Current value",
    platform: locale === "es" ? "Plataforma" : "Platform",
    region: locale === "es" ? "Región" : "Region",
    notes: locale === "es" ? "Notas" : "Notes",
    status: locale === "es" ? "Estado" : "Status",
    remove: locale === "es" ? "Eliminar" : "Remove",
    created: locale === "es" ? "Añadido" : "Added"
  };

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
            {text.collection}
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
            {text.profile}
          </a>

          <span
            style={{
              borderRadius: 999,
              padding: "10px 14px",
              background: theme.colors.black,
              color: "white",
              fontWeight: 800,
              border: `1px solid ${theme.colors.black}`
            }}
          >
            {text.activeSection}
          </span>
        </div>

        <section
          style={{
            background: theme.colors.black,
            color: "white",
            borderRadius: theme.radius.xl,
            padding: "18px 20px",
            marginBottom: 20,
            boxShadow: theme.shadow.card
          }}
        >
          <h1
            style={{
              fontSize: 30,
              fontWeight: 900,
              margin: 0
            }}
          >
            {text.title}
          </h1>

          <p
            style={{
              marginTop: 8,
              marginBottom: 0,
              color: "rgba(255,255,255,0.78)",
              lineHeight: 1.6,
              maxWidth: 760
            }}
          >
            {text.subtitle}
          </p>
        </section>

        <section
          style={{
            background: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.radius.xl,
            padding: 18,
            marginBottom: 18,
            boxShadow: theme.shadow.card
          }}
        >
          <form
            method="POST"
            action="/wishlist/add"
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap"
            }}
          >
            <input
              name="title"
              placeholder={text.addPlaceholder}
              style={{
                flex: 1,
                minWidth: 260,
                padding: "12px 14px",
                borderRadius: 12,
                border: `1px solid ${theme.colors.border}`,
                background: theme.colors.surfaceAlt,
                color: theme.colors.text,
                fontSize: 14,
                outline: "none"
              }}
            />

            <button
              type="submit"
              style={{
                padding: "12px 16px",
                borderRadius: 12,
                background: theme.colors.gold,
                color: theme.colors.black,
                border: "none",
                fontWeight: 900,
                cursor: "pointer"
              }}
            >
              {text.add}
            </button>
          </form>
        </section>

        {items.length === 0 ? (
          <section
            style={{
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radius.xl,
              padding: 22,
              background: theme.colors.surface,
              boxShadow: theme.shadow.card
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                marginBottom: 8,
                color: theme.colors.text
              }}
            >
              {text.empty}
            </div>

            <p
              style={{
                margin: 0,
                color: theme.colors.textMuted,
                lineHeight: 1.7
              }}
            >
              {text.emptyHint}
            </p>
          </section>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {items.map((item) => {
              const name = getDisplayName(item);
              const status = getWishlistStatus(
                item.targetPrice,
                item.currentMarketValue,
                locale
              );

              return (
                <article
                  key={item.id}
                  style={{
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: theme.radius.lg,
                    padding: 16,
                    background: theme.colors.surface,
                    boxShadow: theme.shadow.soft
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      alignItems: "flex-start",
                      flexWrap: "wrap"
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 900,
                          fontSize: 16,
                          color: theme.colors.text
                        }}
                      >
                        {name}
                      </div>

                      <div
                        style={{
                          marginTop: 6,
                          display: "inline-block",
                          padding: "4px 8px",
                          borderRadius: 999,
                          background: theme.colors.surfaceAlt,
                          border: `1px solid ${theme.colors.border}`,
                          fontSize: 12,
                          color: theme.colors.textMuted
                        }}
                      >
                        {item.category || "other"}
                      </div>
                    </div>

                    <form method="POST" action={`/wishlist/${item.id}/delete`}>
                      <button
                        type="submit"
                        style={{
                          border: "none",
                          borderRadius: 999,
                          padding: "8px 12px",
                          background: "transparent",
                          color: theme.colors.danger,
                          fontWeight: 800,
                          cursor: "pointer"
                        }}
                      >
                        {text.remove}
                      </button>
                    </form>
                  </div>

                  <div
                    style={{
                      marginTop: 14,
                      display: "grid",
                      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                      gap: 10
                    }}
                  >
                    <MiniInfo
                      label={text.targetPrice}
                      value={formatPrice(item.targetPrice)}
                      theme={theme}
                    />
                    <MiniInfo
                      label={text.currentValue}
                      value={formatPrice(item.currentMarketValue)}
                      theme={theme}
                    />
                    <MiniInfo
                      label={text.status}
                      value={status}
                      theme={theme}
                    />
                  </div>

                  <div
                    style={{
                      marginTop: 10,
                      display: "grid",
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                      gap: 10
                    }}
                  >
                    <MiniInfo
                      label={text.platform}
                      value={item.platform || "—"}
                      theme={theme}
                    />
                    <MiniInfo
                      label={text.region}
                      value={item.region || "—"}
                      theme={theme}
                    />
                  </div>

                  {item.createdAt && (
                    <div
                      style={{
                        marginTop: 12,
                        fontSize: 12,
                        color: theme.colors.textMuted
                      }}
                    >
                      {text.created}: {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  )}

                  {item.notes && (
                    <div
                      style={{
                        marginTop: 12,
                        padding: "10px 12px",
                        borderRadius: theme.radius.md,
                        background: theme.colors.surfaceAlt,
                        border: `1px solid ${theme.colors.border}`
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          color: theme.colors.textMuted,
                          marginBottom: 6
                        }}
                      >
                        {text.notes}
                      </div>

                      <div
                        style={{
                          fontSize: 14,
                          color: theme.colors.text,
                          lineHeight: 1.6,
                          whiteSpace: "pre-wrap"
                        }}
                      >
                        {item.notes}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function MiniInfo({
  label,
  value,
  theme
}: {
  label: string;
  value: string;
  theme: ReturnType<typeof getThemeById>;
}) {
  return (
    <div
      style={{
        background: theme.colors.surfaceAlt,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.md,
        padding: "12px 14px"
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: theme.colors.textMuted,
          marginBottom: 6,
          fontWeight: 800
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 14,
          color: theme.colors.text,
          fontWeight: 700
        }}
      >
        {value}
      </div>
    </div>
  );
}