"use client";

import { useSearchParams } from "next/navigation";
import { theme } from "../theme";

export default function Filters() {
  const searchParams = useSearchParams();
  const locale = searchParams.get("lang") === "es" ? "es" : "en";

  const currentQ = searchParams.get("q") ?? "";
  const currentCategory = searchParams.get("category") ?? "";
  const currentSort = searchParams.get("sort") ?? "";
  const currentMinPrice = searchParams.get("minPrice") ?? "";
  const currentMaxPrice = searchParams.get("maxPrice") ?? "";

  const text = {
    title: locale === "es" ? "Filtros" : "Filters",
    search: locale === "es" ? "Buscar" : "Search",
    searchPlaceholder:
      locale === "es" ? "Nombre del objeto" : "Item name",
    category: locale === "es" ? "Categoría" : "Category",
    allCategories:
      locale === "es" ? "Todas las categorías" : "All categories",
    sort: locale === "es" ? "Orden" : "Sort",
    defaultSort:
      locale === "es" ? "Por defecto" : "Default",
    priceAsc:
      locale === "es" ? "Precio ↑" : "Price ↑",
    priceDesc:
      locale === "es" ? "Precio ↓" : "Price ↓",
    newest:
      locale === "es" ? "Más recientes" : "Newest",
    oldest:
      locale === "es" ? "Más antiguos" : "Oldest",
    minPrice:
      locale === "es" ? "Precio mínimo" : "Min price",
    maxPrice:
      locale === "es" ? "Precio máximo" : "Max price",
    apply:
      locale === "es" ? "Aplicar filtros" : "Apply filters",
    clear:
      locale === "es" ? "Limpiar" : "Clear"
  };

  return (
    <section
      style={{
        marginTop: 12,
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.xl,
        padding: 16,
        boxShadow: theme.shadow.card
      }}
    >
      <div
        style={{
          fontWeight: 800,
          fontSize: 15,
          color: theme.colors.text,
          marginBottom: 12
        }}
      >
        {text.title}
      </div>

      <form
        action="/items"
        method="GET"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
          gap: 10,
          alignItems: "end"
        }}
      >
        <input type="hidden" name="lang" value={locale} />
        <input type="hidden" name="page" value="1" />
        <input type="hidden" name="pageSize" value="25" />

        <Field label={text.search}>
          <input
            name="q"
            defaultValue={currentQ}
            placeholder={text.searchPlaceholder}
            style={inputStyle}
          />
        </Field>

        <Field label={text.category}>
          <select
            name="category"
            defaultValue={currentCategory}
            style={inputStyle}
          >
            <option value="">{text.allCategories}</option>
            <option value="videogame">Videogame</option>
            <option value="book">Book</option>
            <option value="comic">Comic</option>
            <option value="tcg">TCG</option>
            <option value="figure">Figure</option>
            <option value="boardgame">Board Game</option>
            <option value="lego">LEGO</option>
            <option value="other">Other</option>
          </select>
        </Field>

        <Field label={text.sort}>
          <select
            name="sort"
            defaultValue={currentSort}
            style={inputStyle}
          >
            <option value="">{text.defaultSort}</option>
            <option value="price_asc">{text.priceAsc}</option>
            <option value="price_desc">{text.priceDesc}</option>
            <option value="created_desc">{text.newest}</option>
            <option value="created_asc">{text.oldest}</option>
          </select>
        </Field>

        <Field label={text.minPrice}>
          <input
            name="minPrice"
            defaultValue={currentMinPrice}
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            style={inputStyle}
          />
        </Field>

        <Field label={text.maxPrice}>
          <input
            name="maxPrice"
            defaultValue={currentMaxPrice}
            type="number"
            min="0"
            step="0.01"
            placeholder="9999.99"
            style={inputStyle}
          />
        </Field>

        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap"
          }}
        >
          <button type="submit" style={primaryButton}>
            {text.apply}
          </button>

          <a
            href={`/items?lang=${locale}`}
            style={secondaryButton}
          >
            {text.clear}
          </a>
        </div>
      </form>
    </section>
  );
}

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label
      style={{
        display: "grid",
        gap: 6
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: theme.colors.textMuted
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  borderRadius: theme.radius.md,
  border: `1px solid ${theme.colors.border}`,
  background: theme.colors.surfaceAlt,
  color: theme.colors.text,
  fontSize: 14,
  outline: "none"
};

const primaryButton: React.CSSProperties = {
  border: "none",
  padding: "10px 14px",
  borderRadius: 999,
  background: theme.colors.black,
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
  textDecoration: "none"
};

const secondaryButton: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 999,
  border: `1px solid ${theme.colors.border}`,
  background: theme.colors.surfaceAlt,
  color: theme.colors.text,
  fontWeight: 800,
  textDecoration: "none"
};