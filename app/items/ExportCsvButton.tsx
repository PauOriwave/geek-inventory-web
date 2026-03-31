"use client";

import { useSearchParams } from "next/navigation";
import { getSessionTokenFromCookie } from "../lib/auth";
import { theme } from "../theme";

const API = process.env.NEXT_PUBLIC_API_URL!;

export default function ExportCsvButton() {
  const searchParams = useSearchParams();
  const locale = searchParams.get("lang") === "es" ? "es" : "en";

  const text = {
    label: locale === "es" ? "Exportar CSV" : "Export CSV",
    noSession: locale === "es" ? "No hay sesión activa" : "No active session"
  };

  function onExport() {
    const token = getSessionTokenFromCookie();
    if (!token) {
      alert(text.noSession);
      return;
    }

    window.open(`${API}/export/csv?token=${encodeURIComponent(token)}`, "_blank");
  }

  return (
    <button type="button" onClick={onExport} style={buttonStyle}>
      {text.label}
    </button>
  );
}

const buttonStyle: React.CSSProperties = {
  border: `1px solid ${theme.colors.border}`,
  padding: "10px 12px",
  borderRadius: 999,
  background: theme.colors.surface,
  color: theme.colors.text,
  fontWeight: 800,
  cursor: "pointer"
};