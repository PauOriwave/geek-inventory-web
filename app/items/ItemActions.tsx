"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { theme } from "../theme";

const API = process.env.NEXT_PUBLIC_API_URL!;

export default function ItemActions({
  id,
  initialQty,
  initialPrice
}: {
  id: string;
  initialQty: number;
  initialPrice: number;
}) {
  const router = useRouter();
  const [qty, setQty] = useState<number>(initialQty);
  const [price, setPrice] = useState<number>(initialPrice);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function save() {
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch(`${API}/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity: qty,
          estimatedPrice: price
        })
      });

      if (!res.ok) {
        throw new Error("Failed to update");
      }

      setMsg("✓");
      router.refresh();
    } catch (e) {
      console.error(e);
      setMsg("✕");
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(""), 1200);
    }
  }

  async function del() {
    const ok = confirm("Delete this item? This cannot be undone.");
    if (!ok) return;

    setLoading(true);
    setMsg("");

    try {
      const res = await fetch(`${API}/items/${id}`, {
        method: "DELETE"
      });

      if (!res.ok && res.status !== 204) {
        throw new Error("Failed to delete");
      }

      router.refresh();
    } catch (e) {
      console.error(e);
      setMsg("✕");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        justifyContent: "flex-end",
        flexWrap: "wrap"
      }}
    >
      <input
        type="number"
        min={1}
        value={qty}
        onChange={(e) => setQty(Number(e.target.value))}
        style={smallInput}
      />

      <input
        type="number"
        min={0}
        step="0.01"
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
        style={smallInputWide}
      />

      <button
        onClick={save}
        disabled={loading}
        style={{
          padding: "6px 10px",
          borderRadius: theme.radius.sm,
          border: "none",
          background: theme.colors.gold,
          color: theme.colors.black,
          fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer"
        }}
      >
        Save
      </button>

      <button
        onClick={del}
        disabled={loading}
        style={{
          padding: "6px 10px",
          borderRadius: theme.radius.sm,
          border: `1px solid ${theme.colors.danger}`,
          color: theme.colors.danger,
          background: theme.colors.surface,
          fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer"
        }}
      >
        Delete
      </button>

      {msg && (
        <span style={{ width: 20, textAlign: "center", color: theme.colors.textMuted }}>
          {msg}
        </span>
      )}
    </div>
  );
}

const smallInput: React.CSSProperties = {
  width: 62,
  padding: "6px 8px",
  border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radius.sm,
  background: theme.colors.surface,
  color: theme.colors.text,
  outline: "none"
};

const smallInputWide: React.CSSProperties = {
  width: 88,
  padding: "6px 8px",
  border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radius.sm,
  background: theme.colors.surface,
  color: theme.colors.text,
  outline: "none"
};