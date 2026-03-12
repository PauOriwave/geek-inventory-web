"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { theme } from "../theme";

const categories = ["", "videogame", "book", "comic", "tcg", "figure", "other"] as const;

const sorts = [
  { value: "newest", label: "Newest" },
  { value: "price_desc", label: "Price: high → low" },
  { value: "price_asc", label: "Price: low → high" }
] as const;

export default function Filters() {
  const router = useRouter();
  const sp = useSearchParams();

  const initialQ = sp.get("q") ?? "";
  const initialCategory = sp.get("category") ?? "";
  const initialSort = sp.get("sort") ?? "newest";

  const [q, setQ] = useState(initialQ);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState(initialSort);

  function push(nextQ: string, nextCategory: string, nextSort: string) {
    const params = new URLSearchParams();

    if (nextQ.trim()) params.set("q", nextQ.trim());
    if (nextCategory) params.set("category", nextCategory);
    if (nextSort && nextSort !== "newest") params.set("sort", nextSort);

    const currentPageSize = sp.get("pageSize");
    if (currentPageSize) params.set("pageSize", currentPageSize);

    params.set("page", "1");

    const qs = params.toString();
    router.push(qs ? `/items?${qs}` : "/items");
  }

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
          fontWeight: 800,
          marginBottom: 12,
          color: theme.colors.text,
          fontSize: 15
        }}
      >
        Filters
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(220px, 1.5fr) 1fr 1fr auto",
          gap: 10,
          alignItems: "center"
        }}
      >
        <input
          value={q}
          onChange={(e) => {
            const v = e.target.value;
            setQ(v);
            push(v, category, sort);
          }}
          placeholder="Search…"
          style={inputStyle}
        />

        <select
          value={category}
          onChange={(e) => {
            const v = e.target.value;
            setCategory(v);
            push(q, v, sort);
          }}
          style={inputStyle}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === "" ? "All categories" : c}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => {
            const v = e.target.value;
            setSort(v);
            push(q, category, v);
          }}
          style={inputStyle}
        >
          {sorts.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            setQ("");
            setCategory("");
            setSort("newest");
            router.push("/items");
          }}
          style={{
            padding: "10px 12px",
            borderRadius: theme.radius.sm,
            border: `1px solid ${theme.colors.border}`,
            background: theme.colors.surfaceAlt,
            color: theme.colors.text,
            fontWeight: 700,
            cursor: "pointer"
          }}
        >
          Clear
        </button>
      </div>
    </section>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radius.sm,
  background: theme.colors.surface,
  color: theme.colors.text,
  outline: "none"
};