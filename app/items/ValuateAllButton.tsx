"use client";

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL!;

export default function ValuateAllButton({
  plan = "free",
  locale = "en"
}: {
  plan?: string;
  locale?: "en" | "es";
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isPaidPlan = plan === "premium" || plan === "market_pro";

  const text = {
    label: locale === "es" ? "Valorar todo" : "Valuate all",
    loading: locale === "es" ? "Valorando..." : "Valuating...",
    premiumOnly:
      locale === "es"
        ? "Esta función está disponible solo en planes de pago."
        : "This feature is available only on paid plans.",
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
    if (!isPaidPlan) {
      setMessage(text.premiumOnly);
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const res = await fetch(`${API}/items/valuate-all`, {
        method: "POST",
        credentials: "include"
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 403) {
          setMessage(text.premiumOnly);
          return;
        }

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
        title={!isPaidPlan ? text.premiumOnly : undefined}
        style={{
          border: "none",
          borderRadius: 999,
          padding: "10px 14px",
          fontWeight: 800,
          cursor: loading ? "wait" : "pointer",
          background: isPaidPlan ? "#171717" : "#9CA3AF",
          color: "white",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          opacity: loading ? 0.85 : 1,
          boxShadow: isPaidPlan
            ? "0 8px 24px rgba(15,23,42,0.16)"
            : "none"
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