"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { theme } from "../theme";
import { getSessionTokenFromCookie } from "../lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL!;

export default function ValuateAllButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleValuateAll() {
    const token = getSessionTokenFromCookie();

    if (!token) {
      alert("No active session");
      return;
    }

    const ok = confirm(
      "Valuate all items in your collection? This will create new valuation snapshots."
    );

    if (!ok) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/items/valuate-all`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Valuate all failed");
      }

      alert(
        `Processed: ${data.processed}\nUpdated: ${data.updated}\nSkipped: ${data.skipped}`
      );

      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Valuate all failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleValuateAll}
      disabled={loading}
      style={{
        display: "inline-block",
        padding: "10px 12px",
        borderRadius: theme.radius.sm,
        border: `1px solid ${theme.colors.border}`,
        background: theme.colors.gold,
        color: theme.colors.black,
        fontWeight: 800,
        boxShadow: theme.shadow.soft,
        cursor: loading ? "not-allowed" : "pointer"
      }}
    >
      {loading ? "Valuating…" : "Valuate all"}
    </button>
  );
}