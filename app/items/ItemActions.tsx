"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL!;

export default function ItemActions({
  id,
  initialQty
}: {
  id: string;
  initialQty: number;
}) {
  const router = useRouter();
  const [qty, setQty] = useState<number>(initialQty);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");

  async function saveQty() {
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch(`${API}/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: qty })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to update");
      }

      setMsg("✅");
      router.refresh(); // refresca la lista server-side
    } catch (e: any) {
      setMsg("❌");
      console.error(e);
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
      const res = await fetch(`${API}/items/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        const text = await res.text();
        throw new Error(text || "Failed to delete");
      }
      router.refresh();
    } catch (e) {
      setMsg("❌");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "flex-end" }}>
      <input
        type="number"
        min={1}
        value={qty}
        onChange={(e) => setQty(Number(e.target.value))}
        style={{
          width: 70,
          padding: "6px 8px",
          border: "1px solid #e5e7eb",
          borderRadius: 10
        }}
      />

      <button
        onClick={saveQty}
        disabled={loading}
        style={{
          padding: "6px 10px",
          borderRadius: 10,
          border: "1px solid #ddd",
          background: "white",
          cursor: loading ? "not-allowed" : "pointer"
        }}
        title="Save quantity"
      >
        Save
      </button>

      <button
        onClick={del}
        disabled={loading}
        style={{
          padding: "6px 10px",
          borderRadius: 10,
          border: "1px solid #ef4444",
          color: "#ef4444",
          background: "white",
          cursor: loading ? "not-allowed" : "pointer"
        }}
        title="Delete item"
      >
        Delete
      </button>

      {msg && <span style={{ width: 20, textAlign: "center" }}>{msg}</span>}
    </div>
  );
}