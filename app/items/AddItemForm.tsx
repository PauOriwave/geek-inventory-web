"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL!;

const categories = ["videogame", "book", "comic", "tcg", "figure", "other"] as const;
type Category = (typeof categories)[number];

export default function AddItemForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("videogame");
  const [estimatedPrice, setEstimatedPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          category,
          estimatedPrice,
          quantity
        })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create item");
      }

      // reset
      setName("");
      setCategory("videogame");
      setEstimatedPrice(0);
      setQuantity(1);

      router.refresh();
    } catch (e: any) {
      setError("Could not create item");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 14,
        marginTop: 14
      }}
    >
      <div style={{ fontWeight: 800, marginBottom: 10 }}>Add item</div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name (e.g. Pokemon Azul)"
          style={{
            padding: "8px 10px",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            minWidth: 260
          }}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          style={{ padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 10 }}
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
          style={{
            width: 120,
            padding: "8px 10px",
            border: "1px solid #e5e7eb",
            borderRadius: 10
          }}
        />

        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          placeholder="Qty"
          style={{
            width: 90,
            padding: "8px 10px",
            border: "1px solid #e5e7eb",
            borderRadius: 10
          }}
        />

        <button
          onClick={submit}
          disabled={loading}
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid #111827",
            background: "#111827",
            color: "white",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Adding…" : "Add"}
        </button>
      </div>

      {error && <div style={{ marginTop: 10, color: "#ef4444" }}>{error}</div>}
    </section>
  );
}