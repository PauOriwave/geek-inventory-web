"use client";

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL!;

function isPaidPlan(plan?: string) {
  return plan === "premium" || plan === "market_pro";
}

export default function ValuateAllButton({
  plan = "free",
  locale = "en"
}: {
  plan?: string;
  locale?: "en" | "es";
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const hasAccess = isPaidPlan(plan);

  const text = {
    label: locale === "es" ? "Valorar todo" : "Valuate all",
    loading: locale === "es" ? "Valorando..." : "Valuating...",
    premiumOnly:
      locale === "es"
        ? "Esta función está disponible solo en planes de pago."
        : "This feature is available only on paid plans.",
    premiumHint:
      locale === "es"
        ? "Actualiza tu plan para valorar toda la colección de una vez."
        : "Upgrade your plan to valuate your whole collection at once.",
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
    pro: "PRO",
    updated: locale === "es" ? "Actualizados" : "Updated",
    skipped: locale === "es" ? "Omitidos" : "Skipped",
    processed: locale === "es" ? "Procesados" : "Processed"
  };

  async function handleClick() {
    if (!hasAccess) {
      setMessage(`${text.premiumOnly} ${text.premiumHint}`);
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
          setMessage(`${text.premiumOnly} ${text.premiumHint}`);
          return;
        }

        setMessage(data?.message || text.genericError);
        return;
      }

      setMessage(
        `${text.success} ${text.processed}: ${data?.processed ?? 0} · ${text.updated}: ${data?.updated ?? 0} · ${text.skipped}: ${data?.skipped ?? 0}`
      );
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
        title={!hasAccess ? text.premiumOnly : undefined}
        style={{
          border: "none",
          borderRadius: 999,
          padding: "10px 14px",
          fontWeight: 800,
          cursor: loading ? "wait" : "pointer",
          background: hasAccess ? "#171717" : "#9CA3AF",
          color: "white",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          opacity: loading ? 0.85 : 1,
          boxShadow: hasAccess
            ? "0 8px 24px rgba(15,23,42,0.16)"
            : "none"
        }}
      >
        <span>{loading ? text.loading : text.label}</span>

        {!hasAccess && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 900,
              padding: "3px 7px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.18)",
              color: "white",
              lineHeight: 1
            }}
          >
            {text.pro}
          </span>
        )}
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