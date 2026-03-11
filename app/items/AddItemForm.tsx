"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { theme } from "../theme";

const API = process.env.NEXT_PUBLIC_API_URL!;

const categories = [
  "videogame",
  "book",
  "comic",
  "tcg",
  "figure",
  "other"
] as const;

type Category = (typeof categories)[number];

export default function AddItemForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("videogame");
  const [estimatedPrice, setEstimatedPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (quantity < 1) {
      setError("Quantity must be at least 1");
      return;
    }

    if (estimatedPrice <= 0) {
      setError("Price must be greater than 0");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: name.trim(),
          category,
          estimatedPrice,
          quantity
        })
      });

      if (!res.ok) {
        throw new Error("Failed to create item");
      }

      setName("");
      setCategory("videogame");
      setEstimatedPrice(0);
      setQuantity(1);

      router.refresh();
    } catch (e) {
      console.error(e);
      setError("Could not create item");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      style={{
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.lg,
        padding: 14,
        background: theme.colors.surface,
        boxShadow: theme.shadow.card
      }}
    >
      <div
        style={{
          fontWeight: 800,
          marginBottom: 12,
          color: theme.colors.text
        }}
      >
        Add item
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(220px, 1.4fr) 1fr 120px 90px auto",
          gap: 10,
          alignItems: "center"
        }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name (e.g. Pokemon Azul)"
          style={inputStyle}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          style={inputStyle}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <input
          type="number"
          min={0}
          step="0.01"
          value={estimatedPrice}
          onChange={(e) => setEstimatedPrice(Number(e.target.value))}
          placeholder="Price €"
          style={inputStyle}
        />

        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          placeholder="Qty"
          style={inputStyle}
        />

        <button
          onClick={submit}
          disabled={loading}
          style={{
            padding: "10px 14px",
            borderRadius: theme.radius.sm,
            border: "none",
            background: theme.colors.gold,
            color: theme.colors.black,
            fontWeight: 800,
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Adding…" : "Add"}
        </button>
      </div>

      {error && (
        <div style={{ marginTop: 10, color: theme.colors.danger }}>
          {error}
        </div>
      )}
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