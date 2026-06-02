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
      return [];
    }

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

          return (
            <a
              key={it.id}
              href={`/items/${it.id}${locale === "es" ? "?lang=es" : "?lang=en"}`}
              style={{
                textDecoration: "none",
                color: theme.colors.text
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "28px 1fr auto",
                  gap: 10,
                  alignItems: "center",
                  padding: "8px 10px",
                  borderRadius: 10,
                  background: idx < 3 ? visual.background : "transparent",
                  border:
                    idx < 3
                      ? `1px solid ${visual.color}33`
                      : "1px solid transparent"
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: idx < 3 ? visual.color : theme.colors.textMuted,
                    fontWeight: 900
                  }}
                >
                  #{idx + 1}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    minWidth: 0
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      background: visual.background,
                      color: visual.color,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      flexShrink: 0,
                      border: `1px solid ${visual.color}33`
                    }}
                  >
                    {visual.icon}
                  </span>

                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
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
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}
                    >
                      {getCategoryLabel(it.category, locale)} · {it.quantity} ×{" "}
                      {it.estimatedPrice.toFixed(2)} €
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    fontWeight: 900,
                    whiteSpace: "nowrap"
                  }}
                >
                  {it.totalValue.toFixed(2)} €
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