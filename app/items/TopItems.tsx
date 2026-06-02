import { cookies } from "next/headers";
import { getThemeById, AppThemeId } from "../theme";
import { getCategoryLabel } from "./categoryLabels";
import { getCategoryVisual } from "./categoryVisuals";

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
  try {
    const qs = new URLSearchParams();
    qs.set("limit", "10");

    if (category) qs.set("category", category);

    const res = await fetch(`${API}/stats/top-items?${qs.toString()}`, {
      cache: "no-store",
      headers: { cookie: cookieHeader }
    });

    if (!res.ok) return [];

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function TopItems({
  category,
  locale = "en"
}: {
  category?: string;
  locale?: "en" | "es";
}) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const themeId =
    (cookieStore.get("ui_theme")?.value as AppThemeId | undefined) ?? "classic";
  const theme = getThemeById(themeId);

  const items = await getTopItems(cookieHeader, category);

  const text = {
    title: category
      ? locale === "es"
        ? `Top ${getCategoryLabel(category, locale)}`
        : `Top ${getCategoryLabel(category, locale)} items`
      : locale === "es"
        ? "Top 10 objetos"
        : "Top 10 items",
    byValue: locale === "es" ? "por valor" : "by value",
    noItems:
      locale === "es"
        ? "No hay objetos en esta categoría."
        : "No items in this category."
  };

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
          alignItems: "baseline",
          gap: 12
        }}
      >
        <div style={{ fontWeight: 800 }}>{text.title}</div>

        <div style={{ fontSize: 12, color: theme.colors.textMuted }}>
          {text.byValue}
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
        {items.map((it, idx) => {
          const visual = getCategoryVisual(it.category);
          const categoryLabel = getCategoryLabel(it.category, locale);

          return (
            <a
              key={it.id}
              href={`/items/${it.id}?lang=${locale}`}
              style={{
                textDecoration: "none",
                color: theme.colors.text
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "28px minmax(0, 1fr)",
                  gap: 10,
                  padding: "10px",
                  borderRadius: 12,
                  background: idx < 3 ? theme.colors.surfaceAlt : "transparent",
                  border:
                    idx < 3
                      ? `1px solid ${theme.colors.border}`
                      : "1px solid transparent"
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: idx < 3 ? visual.color : theme.colors.textMuted,
                    fontWeight: 900,
                    paddingTop: 2
                  }}
                >
                  #{idx + 1}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      alignItems: "flex-start"
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 850,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        minWidth: 0
                      }}
                      title={it.name}
                    >
                      {it.name}
                    </div>

                    <div
                      style={{
                        fontWeight: 900,
                        whiteSpace: "nowrap",
                        fontSize: 13
                      }}
                    >
                      {it.totalValue.toFixed(2)} €
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 7,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      flexWrap: "wrap"
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        maxWidth: "100%",
                        padding: "4px 8px",
                        borderRadius: 999,
                        background: visual.background,
                        color: visual.color,
                        border: `1px solid ${visual.color}33`,
                        fontSize: 11,
                        fontWeight: 900,
                        whiteSpace: "nowrap"
                      }}
                    >
                      <span aria-hidden="true">{visual.icon}</span>
                      <span>{categoryLabel}</span>
                    </span>

                    <span
                      style={{
                        fontSize: 12,
                        color: theme.colors.textMuted,
                        whiteSpace: "nowrap"
                      }}
                    >
                      {it.quantity} × {it.estimatedPrice.toFixed(2)} €
                    </span>
                  </div>
                </div>
              </div>
            </a>
          );
        })}

        {items.length === 0 && (
          <div style={{ color: theme.colors.textMuted }}>{text.noItems}</div>
        )}
      </div>
    </section>
  );
}