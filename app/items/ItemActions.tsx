"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { theme } from "../theme";
import { getSessionTokenFromCookie } from "../lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL!;

export default function ItemActions({
  id,
  initialQty,
  initialPrice,
  initialCondition,
  initialNotes
}: {
  id: string;
  initialQty: number;
  initialPrice: number;
  initialCondition?: string | null;
  initialNotes?: string | null;
}) {
  const router = useRouter();

  const [qty, setQty] = useState<number>(initialQty);
  const [price, setPrice] = useState<number>(initialPrice);
  const [condition, setCondition] = useState<string>(initialCondition ?? "");
  const [notes, setNotes] = useState<string>(initialNotes ?? "");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function save() {
    const token = getSessionTokenFromCookie();

    if (!token) {
      setMsg("✕");
      return;
    }

    setLoading(true);
    setMsg("");

    try {
      const res = await fetch(`${API}/items/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          quantity: qty,
          estimatedPrice: price,
          condition: condition || "",
          notes: notes || ""
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
    const token = getSessionTokenFromCookie();

    if (!token) {
      setMsg("✕");
      return;
    }

    const ok = confirm("Delete this item? This cannot be undone.");
    if (!ok) return;

    setLoading(true);
    setMsg("");

    try {
      const res = await fetch(`${API}/items/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
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
        display: "grid",
        gap: 8,
        justifyItems: "end"
      }}
    >
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
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          justifyContent: "flex-end",
          flexWrap: "wrap"
        }}
      >
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          style={smallSelect}
        >
          <option value="">Condition</option>
          <option value="mint">mint</option>
          <option value="near_mint">near_mint</option>
          <option value="very_good">very_good</option>
          <option value="good">good</option>
          <option value="fair">fair</option>
          <option value="poor">poor</option>
        </select>

        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes"
          style={notesInput}
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          justifyContent: "flex-end",
          flexWrap: "wrap"
        }}
      >
        <button
          onClick={save}
          disabled={loading}
          style={{
            padding: "7px 10px",
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
            padding: "7px 10px",
            borderRadius: theme.radius.sm,
            border: `1px solid ${theme.colors.border}`,
            background: theme.colors.surfaceAlt,
            color: theme.colors.danger,
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          Delete
        </button>

        {msg && (
          <span
            style={{
              width: 18,
              textAlign: "center",
              color: theme.colors.textMuted,
              fontSize: 13
            }}
          >
            {msg}
          </span>
        )}
      </div>
    </div>
  );
}

const smallInput: React.CSSProperties = {
  width: 60,
  padding: "7px 8px",
  border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radius.sm,
  background: theme.colors.surface,
  color: theme.colors.text,
  outline: "none"
};

const smallInputWide: React.CSSProperties = {
  width: 84,
  padding: "7px 8px",
  border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radius.sm,
  background: theme.colors.surface,
  color: theme.colors.text,
  outline: "none"
};

const smallSelect: React.CSSProperties = {
  width: 130,
  padding: "7px 8px",
  border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radius.sm,
  background: theme.colors.surface,
  color: theme.colors.text,
  outline: "none"
};

const notesInput: React.CSSProperties = {
  width: 160,
  padding: "7px 8px",
  border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radius.sm,
  background: theme.colors.surface,
  color: theme.colors.text,
  outline: "none"
};