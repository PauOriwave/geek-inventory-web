import { cookies } from "next/headers";
import { getThemeById, AppThemeId } from "../theme";
import { getCategoryLabel } from "./categoryLabels";
import { getCategoryVisual } from "./categoryVisuals";

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

    if (!res.ok) return [];

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
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 10
        }}
      >
        {rows.map((r) => {
          const visual = getCategoryVisual(r.category);
          const label = getCategoryLabel(r.category, locale);

          return (
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
                  gap: 10,
                  alignItems: "flex-start",
                  marginBottom: 10
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      maxWidth: "100%",
                      padding: "5px 9px",
                      borderRadius: 999,
                      background: visual.background,
                      color: visual.color,
                      border: `1px solid ${visual.color}33`,
                      fontSize: 12,
                      fontWeight: 900,
                      whiteSpace: "nowrap"
                    }}
                  >
                    <span aria-hidden="true">{visual.icon}</span>
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}
                    >
                      {label}
                    </span>
                  </div>
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
                  fontSize: 20,
                  fontWeight: 900,
                  color: theme.colors.text
                }}
              >
                {r.value.toFixed(2)} €
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: theme.colors.textMuted,
                  marginTop: 7
                }}
              >
                {text.units}: {r.units} · {text.items}: {r.items}
              </div>
            </a>
          );
        })}

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

  const bg = positive
    ? "rgba(34,197,94,0.14)"
    : negative
      ? "rgba(244,63,94,0.14)"
      : theme.colors.surfaceAlt;

  const color = positive
    ? theme.colors.success
    : negative
      ? theme.colors.danger
      : theme.colors.textMuted;

  const icon = positive ? "↗" : negative ? "↘" : "→";

  const formattedDelta =
    delta === 0 ? "0.00€" : `${delta > 0 ? "+" : ""}${delta.toFixed(2)}€`;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 8px",
        borderRadius: 999,
        border: `1px solid ${theme.colors.border}`,
        background: bg,
        color,
        fontSize: 11,
        fontWeight: 900,
        whiteSpace: "nowrap",
        flexShrink: 0
      }}
    >
      <span aria-hidden="true">{icon}</span>
      <span>{formattedDelta}</span>
    </span>
  );
}