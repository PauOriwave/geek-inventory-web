import { cookies } from "next/headers";
import { getThemeById, AppThemeId } from "../theme";

type TrendingItem = {
  id: string;
  name: string;
  category: string;
  firstValue: number;
  latestValue: number;
  delta: number;
};

const API = process.env.NEXT_PUBLIC_API_URL!;

async function getTrendingItems(
  cookieHeader: string,
  direction: "rising" | "dropping",
  category?: string
): Promise<TrendingItem[]> {
  try {
    const qs = new URLSearchParams();
    qs.set("limit", "5");
    qs.set("direction", direction);

    if (category) {
      qs.set("category", category);
    }

    const res = await fetch(`${API}/stats/trending-items?${qs.toString()}`, {
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

export default async function TrendingItems({
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

  const [risingItems, droppingItems] = await Promise.all([
    getTrendingItems(cookieHeader, "rising", category),
    getTrendingItems(cookieHeader, "dropping", category)
  ]);

  const text = {
    title: category
      ? locale === "es"
        ? `Movimientos de ${capitalize(category)}`
        : `${capitalize(category)} movers`
      : locale === "es"
        ? "Principales movimientos"
        : "Top movers",
    subtitle:
      locale === "es"
        ? "desde el historial de valoraciones"
        : "from valuation history",
    rising: locale === "es" ? "Objetos subiendo" : "Rising items",
    dropping: locale === "es" ? "Objetos bajando" : "Dropping items",
    noRising:
      locale === "es"
        ? "Todavía no hay objetos subiendo."
        : "No rising items yet.",
    noDropping:
      locale === "es"
        ? "Todavía no hay objetos bajando."
        : "No dropping items yet."
  };

  return (
    <section
      style={{
        marginTop: 14,
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.xl,
        padding: 16,
        boxShadow: theme.shadow.card
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 12
        }}
      >
        <div
          style={{
            fontWeight: 800,
            fontSize: 15,
            color: theme.colors.text
          }}
        >
          {text.title}
        </div>

        <div
          style={{
            fontSize: 12,
            color: theme.colors.textMuted
          }}
        >
          {text.subtitle}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 12
        }}
      >
        <TrendColumn
          title={text.rising}
          emptyText={text.noRising}
          items={risingItems}
          direction="rising"
          locale={locale}
          theme={theme}
        />

        <TrendColumn
          title={text.dropping}
          emptyText={text.noDropping}
          items={droppingItems}
          direction="dropping"
          locale={locale}
          theme={theme}
        />
      </div>
    </section>
  );
}

function TrendColumn({
  title,
  emptyText,
  items,
  direction,
  locale,
  theme
}: {
  title: string;
  emptyText: string;
  items: TrendingItem[];
  direction: "rising" | "dropping";
  locale: "en" | "es";
  theme: ReturnType<typeof getThemeById>;
}) {
  return (
    <div
      style={{
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.lg,
        padding: 12,
        background: theme.colors.surfaceAlt
      }}
    >
      <div
        style={{
          fontWeight: 800,
          marginBottom: 10,
          color: theme.colors.text
        }}
      >
        {title}
      </div>

      {items.length === 0 ? (
        <div style={{ color: theme.colors.textMuted, fontSize: 13 }}>
          {emptyText}
        </div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {items.map((item, index) => (
            <a
              key={item.id}
              href={`/items/${item.id}?lang=${locale}`}
              style={{
                textDecoration: "none",
                color: theme.colors.text,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radius.md,
                background: theme.colors.surface,
                padding: "10px 12px",
                display: "grid",
                gridTemplateColumns: "28px 1fr auto",
                gap: 10,
                alignItems: "center"
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: theme.colors.textMuted
                }}
              >
                #{index + 1}
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
                  title={item.name}
                >
                  {item.name}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: theme.colors.textMuted
                  }}
                >
                  {item.firstValue.toFixed(2)} € → {item.latestValue.toFixed(2)} €
                </div>
              </div>

              <TrendDeltaBadge
                delta={item.delta}
                direction={direction}
                theme={theme}
              />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function TrendDeltaBadge({
  delta,
  direction,
  theme
}: {
  delta: number;
  direction: "rising" | "dropping";
  theme: ReturnType<typeof getThemeById>;
}) {
  const positive = direction === "rising";
  const bg = positive ? "#ECFDF3" : "#FEF3F2";
  const color = positive ? "#027A48" : "#B42318";

  return (
    <span
      style={{
        display: "inline-block",
        minWidth: 74,
        textAlign: "center",
        padding: "4px 8px",
        borderRadius: 999,
        border: `1px solid ${theme.colors.border}`,
        background: bg,
        color,
        fontSize: 12,
        fontWeight: 800,
        whiteSpace: "nowrap"
      }}
    >
      {delta > 0 ? "+" : ""}
      {delta.toFixed(2)} €
    </span>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}