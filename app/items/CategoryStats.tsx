import { cookies } from "next/headers";
import { getThemeById, AppThemeId } from "../theme";
import { getCategoryLabel } from "./categoryLabels";

type Row = {
  category: string;
  units: number;
  value: number;
  items: number;
  trend: "rising" | "dropping" | "stable";
  trendDelta: number;
};

const API = process.env.NEXT_PUBLIC_API_URL!;

async function getByCategory(cookieHeader: string): Promise<Row[]> {
  try {
    const res = await fetch(`${API}/stats/by-category`, {
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

export default async function CategoryStats({
  locale = "en"
}: {
  locale?: "en" | "es";
}) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const themeId =
    (cookieStore.get("ui_theme")?.value as AppThemeId | undefined) ?? "classic";
  const theme = getThemeById(themeId);

  const rows = await getByCategory(cookieHeader);

  const text = {
    title: locale === "es" ? "Valor por categoría" : "Value by category",
    noData: locale === "es" ? "Todavía no hay datos." : "No data yet.",
    units: locale === "es" ? "Unidades" : "Units",
    items: locale === "es" ? "Objetos" : "Items"
  };

  return (
    <section style={{ marginTop: 14 }}>
      <h2
        style={{
          fontSize: 15,
          fontWeight: 800,
          marginBottom: 10,
          color: theme.colors.text
        }}
      >
        {text.title}
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 10
        }}
      >
        {rows.map((r) => (
          <a
            key={r.category}
            href={`/items?category=${encodeURIComponent(
              r.category
            )}&page=1&pageSize=25&lang=${locale}`}
            style={{
              textDecoration: "none",
              color: "inherit",
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radius.md,
              padding: 12,
              background: theme.colors.surface,
              boxShadow: theme.shadow.soft,
              display: "block"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
                alignItems: "center",
                marginBottom: 6
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: theme.colors.textMuted
                }}
              >
                {getCategoryLabel(r.category, locale)}
              </div>

              <TrendBadge
                trend={r.trend}
                delta={r.trendDelta}
                locale={locale}
                theme={theme}
              />
            </div>

            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: theme.colors.text
              }}
            >
              {r.value.toFixed(2)} €
            </div>

            <div
              style={{
                fontSize: 12,
                color: theme.colors.textMuted,
                marginTop: 6
              }}
            >
              {text.units}: {r.units} · {text.items}: {r.items}
            </div>
          </a>
        ))}

        {rows.length === 0 && (
          <div style={{ color: theme.colors.textMuted }}>{text.noData}</div>
        )}
      </div>
    </section>
  );
}

function TrendBadge({
  trend,
  delta,
  locale,
  theme
}: {
  trend: "rising" | "dropping" | "stable";
  delta: number;
  locale: "en" | "es";
  theme: ReturnType<typeof getThemeById>;
}) {
  const positive = trend === "rising";
  const negative = trend === "dropping";

  const bg = positive ? "#ECFDF3" : negative ? "#FEF3F2" : "#F9FAFB";
  const color = positive
    ? "#027A48"
    : negative
      ? "#B42318"
      : theme.colors.textMuted;

  const label =
    trend === "rising"
      ? locale === "es"
        ? "Subiendo"
        : "Rising"
      : trend === "dropping"
        ? locale === "es"
          ? "Bajando"
          : "Dropping"
        : locale === "es"
          ? "Estable"
          : "Stable";

  const formattedDelta =
    delta === 0 ? "0.00€" : `${delta > 0 ? "+" : ""}${delta.toFixed(2)}€`;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 8px",
        borderRadius: 999,
        border: `1px solid ${theme.colors.border}`,
        background: bg,
        color,
        fontSize: 12,
        fontWeight: 700,
        whiteSpace: "nowrap"
      }}
    >
      <span>{label}</span>
      <span>{formattedDelta}</span>
    </span>
  );
}