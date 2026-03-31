"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { theme } from "../theme";

export default function Filters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const locale = searchParams.get("lang") === "es" ? "es" : "en";

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "");

  const text = {
    search: locale === "es" ? "Buscar..." : "Search...",
    category: locale === "es" ? "Categoría" : "Category",
    minPrice: locale === "es" ? "Precio mín." : "Min price",
    maxPrice: locale === "es" ? "Precio máx." : "Max price",
    sort: locale === "es" ? "Ordenar" : "Sort",
    apply: locale === "es" ? "Aplicar filtros" : "Apply filters",
    reset: locale === "es" ? "Resetear" : "Reset",
    all: locale === "es" ? "Todas" : "All",
    priceAsc: locale === "es" ? "Precio ↑" : "Price ↑",
    priceDesc: locale === "es" ? "Precio ↓" : "Price ↓",
    newest: locale === "es" ? "Más recientes" : "Newest",
    oldest: locale === "es" ? "Más antiguos" : "Oldest"
  };

  function applyFilters() {
    const params = new URLSearchParams();

    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (sort) params.set("sort", sort);

    params.set("lang", locale);
    params.set("page", "1");
    params.set("pageSize", "25");

    router.push(`/items?${params.toString()}`);
  }

  function resetFilters() {
    router.push(`/items?lang=${locale}`);
  }

  return (
    <div
      style={{
        marginTop: 10,
        padding: 14,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.lg,
        background: theme.colors.surface,
        boxShadow: theme.shadow.soft,
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        alignItems: "center"
      }}
    >
      {/* Search */}
      <input
        placeholder={text.search}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={inputStyle}
      />

      {/* Category */}
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={inputStyle}
      >
        <option value="">{text.all}</option>
        <option value="videogame">Videogame</option>
        <option value="book">Book</option>
        <option value="comic">Comic</option>
        <option value="tcg">TCG</option>
        <option value="figure">Figure</option>
        <option value="boardgame">Board Game</option>
        <option value="lego">LEGO</option>
        <option value="other">Other</option>
      </select>

      {/* Min price */}
      <input
        type="number"
        placeholder={text.minPrice}
        value={minPrice}
        onChange={(e) => setMinPrice(e.target.value)}
        style={inputStyle}
      />

      {/* Max price */}
      <input
        type="number"
        placeholder={text.maxPrice}
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
        style={inputStyle}
      />

      {/* Sort */}
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        style={inputStyle}
      >
        <option value="">{text.sort}</option>
        <option value="price_asc">{text.priceAsc}</option>
        <option value="price_desc">{text.priceDesc}</option>
        <option value="newest">{text.newest}</option>
        <option value="oldest">{text.oldest}</option>
      </select>

      {/* Buttons */}
      <button onClick={applyFilters} style={primaryButton}>
        {text.apply}
      </button>

      <button onClick={resetFilters} style={secondaryButton}>
        {text.reset}
      </button>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #e5e7eb",
  fontSize: 13,
  outline: "none"
};

const primaryButton: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "none",
  background: theme.colors.black,
  color: "white",
  fontWeight: 700,
  cursor: "pointer"
};

const secondaryButton: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: `1px solid ${theme.colors.border}`,
  background: "white",
  color: theme.colors.text,
  fontWeight: 700,
  cursor: "pointer"
};