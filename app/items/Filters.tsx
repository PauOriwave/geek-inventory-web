"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

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

  // mantener pageSize si estaba en la URL
  const currentPageSize = sp.get("pageSize");
  if (currentPageSize) params.set("pageSize", currentPageSize);

  // reset page
  params.set("page", "1");

  const qs = params.toString();
  router.push(qs ? `/items?${qs}` : "/items");
}

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginTop: 14 }}>
      <input
        value={q}
        onChange={(e) => {
          const v = e.target.value;
          setQ(v);
          push(v, category, sort);
        }}
        placeholder="Search… (e.g. pokemon)"
        style={{
          padding: "8px 10px",
          border: "1px solid #e5e7eb",
          borderRadius: 10,
          minWidth: 220
        }}
      />

      <select
        value={category}
        onChange={(e) => {
          const v = e.target.value;
          setCategory(v);
          push(q, v, sort);
        }}
        style={{ padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 10 }}
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
        style={{ padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 10 }}
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
          padding: "8px 12px",
          borderRadius: 10,
          border: "1px solid #ddd",
          cursor: "pointer",
          background: "white"
        }}
      >
        Clear
      </button>
    </div>
  );
}