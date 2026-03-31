"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { getSessionTokenFromCookie } from "../lib/auth";
import { theme } from "../theme";

const API = process.env.NEXT_PUBLIC_API_URL!;

export default function ValuateAllButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = searchParams.get("lang") === "es" ? "es" : "en";
  const [loading, setLoading] = useState(false);

  const text = {
    label: locale === "es" ? "Valorar todo" : "Valuate all",
    loading: locale === "es" ? "Valorando…" : "Valuating…",
    confirm:
      locale === "es"
        ? "¿Valorar todos los objetos de tu colección? Esto creará nuevos snapshots."
        : "Valuate all items in your collection? This will create new valuation snapshots.",
    noSession: locale === "es" ? "No hay sesión activa" : "No active session",
    failed:
      locale === "es" ? "No se pudo valorar la colección" : "Valuate all failed",
    result:
      locale === "es"
        ? (p: number, u: number, s: number) =>
            `Procesados: ${p}\nActualizados: ${u}\nOmitidos: ${s}`
        : (p: number, u: number, s: number) =>
            `Processed: ${p}\nUpdated: ${u}\nSkipped: ${s}`
  };

  async function handleValuateAll() {
    const token = getSessionTokenFromCookie();

    if (!token) {
      alert(text.noSession);
      return;
    }

    const ok = confirm(text.confirm);
    if (!ok) return;

    setLoading(true);

    try {
      const res = await fetch(`${API}/items/valuate-all`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || text.failed);
      }

      alert(text.result(data.processed, data.updated, data.skipped));
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : text.failed);
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
        border: "none",
        padding: "10px 12px",
        borderRadius: 999,
        background: theme.colors.gold,
        color: theme.colors.black,
        fontWeight: 900,
        cursor: loading ? "not-allowed" : "pointer",
        boxShadow: theme.shadow.soft
      }}
    >
      {loading ? text.loading : text.label}
    </button>
  );
}