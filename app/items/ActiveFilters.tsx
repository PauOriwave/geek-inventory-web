import { theme } from "../theme";

export default function ActiveFilters({
  q,
  category,
  minPrice,
  maxPrice,
  locale
}: {
  q?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  locale: "en" | "es";
}) {
  const hasFilters = Boolean(q || category || minPrice || maxPrice);

  const text = {
    title: locale === "es" ? "Filtros activos" : "Active filters",
    clearAll: locale === "es" ? "Limpiar todo" : "Clear all",
    search: locale === "es" ? "Búsqueda" : "Search",
    category: locale === "es" ? "Categoría" : "Category",
    minPrice: locale === "es" ? "Precio mín." : "Min price",
    maxPrice: locale === "es" ? "Precio máx." : "Max price",
    none: locale === "es" ? "No hay filtros activos." : "No active filters."
  };

  if (!hasFilters) {
    return (
      <section
        style={{
          marginBottom: 12,
          background: theme.colors.surface,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radius.lg,
          padding: "12px 14px",
          boxShadow: theme.shadow.soft
        }}
      >
        <div
          style={{
            fontSize: 13,
            color: theme.colors.textMuted
          }}
        >
          {text.none}
        </div>
      </section>
    );
  }

  return (
    <section
      style={{
        marginBottom: 12,
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.lg,
        padding: "12px 14px",
        boxShadow: theme.shadow.soft
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 10
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: theme.colors.text
          }}
        >
          {text.title}
        </div>

        <a
          href={`/items?lang=${locale}`}
          style={{
            textDecoration: "none",
            fontSize: 12,
            fontWeight: 800,
            color: theme.colors.link
          }}
        >
          {text.clearAll}
        </a>
      </div>

      {/* Chips */}
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap"
        }}
      >
        {q && (
          <FilterChip
            label={text.search}
            value={q}
            href={buildHref({
              locale,
              category,
              minPrice,
              maxPrice
            })}
          />
        )}

        {category && (
          <FilterChip
            label={text.category}
            value={category}
            href={buildHref({
              locale,
              q,
              minPrice,
              maxPrice
            })}
          />
        )}

        {minPrice && (
          <FilterChip
            label={text.minPrice}
            value={`${minPrice} €`}
            href={buildHref({
              locale,
              q,
              category,
              maxPrice
            })}
          />
        )}

        {maxPrice && (
          <FilterChip
            label={text.maxPrice}
            value={`${maxPrice} €`}
            href={buildHref({
              locale,
              q,
              category,
              minPrice
            })}
          />
        )}
      </div>
    </section>
  );
}

function FilterChip({
  label,
  value,
  href
}: {
  label: string;
  value: string;
  href: string;
}) {
  return (
    <a
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        textDecoration: "none",
        background: theme.colors.surfaceAlt,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: 999,
        padding: "6px 10px",
        color: theme.colors.text
      }}
    >
      <span
        style={{
          fontSize: 12,
          color: theme.colors.textMuted
        }}
      >
        {label}:
      </span>

      <span
        style={{
          fontSize: 12,
          fontWeight: 800
        }}
      >
        {value}
      </span>

      <span
        style={{
          fontSize: 12,
          fontWeight: 900,
          color: theme.colors.textMuted
        }}
      >
        ×
      </span>
    </a>
  );
}

function buildHref({
  locale,
  q,
  category,
  minPrice,
  maxPrice
}: {
  locale: "en" | "es";
  q?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
}) {
  const params = new URLSearchParams();

  if (q) params.set("q", q);
  if (category) params.set("category", category);
  if (minPrice) params.set("minPrice", minPrice);
  if (maxPrice) params.set("maxPrice", maxPrice);

  params.set("lang", locale);
  params.set("page", "1");
  params.set("pageSize", "25");

  return `/items?${params.toString()}`;
}