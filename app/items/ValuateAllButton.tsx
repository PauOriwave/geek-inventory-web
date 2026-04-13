"use client";

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL!;

export default function ValuateAllButton({
  locale = "en"
}: {
  plan?: string;
  locale?: "en" | "es";
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const text = {
    label: locale === "es" ? "Valorar todo" : "Valuate all",
    loading: locale === "es" ? "Valorando..." : "Valuating...",
    success:
      locale === "es"
        ? "Colección valorada correctamente."
        : "Collection valuated successfully.",
    networkError:
      locale === "es"
        ? "Error de red al valorar la colección."
        : "Network error while valuating collection.",
    genericError:
      locale === "es"
        ? "No se pudo valorar la colección."
        : "Could not valuate collection.",
    updated: locale === "es" ? "Actualizados" : "Updated",
    skipped: locale === "es" ? "Omitidos" : "Skipped",
    processed: locale === "es" ? "Procesados" : "Processed"
  };

  async function handleClick() {
    try {
      setLoading(true);
      setMessage(null);

      const res = await fetch(`${API}/items/valuate-all`, {
        method: "POST",
        credentials: "include"
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setMessage(data?.message || text.genericError);
        return;
      }

      setMessage(
        `${text.success} ${text.processed}: ${data?.processed ?? 0} · ${text.updated}: ${data?.updated ?? 0} · ${text.skipped}: ${data?.skipped ?? 0}`
      );

      window.location.reload();
    } catch {
      setMessage(text.networkError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        style={{
          border: "none",
          borderRadius: 999,
          padding: "10px 14px",
          fontWeight: 800,
          cursor: loading ? "wait" : "pointer",
          background: "#171717",
          color: "white",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          opacity: loading ? 0.85 : 1,
          boxShadow: "0 8px 24px rgba(15,23,42,0.16)"
        }}
      >
        <span>{loading ? text.loading : text.label}</span>
      </button>

      {message && (
        <div
          style={{
            fontSize: 12,
            color: "#6B7280",
            lineHeight: 1.5,
            maxWidth: 360
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}