"use client";

import { theme } from "../theme";
import { getSessionTokenFromCookie } from "../lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL!;

export default function ExportCsvButton() {
  async function handleExport() {
    const token = getSessionTokenFromCookie();

    if (!token) {
      alert("No active session");
      return;
    }

    const res = await fetch(`${API}/export/items.csv`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const text = await res.text();
      alert(`Export failed: ${text}`);
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "items-export.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      style={{
        display: "inline-block",
        padding: "10px 12px",
        borderRadius: theme.radius.sm,
        border: `1px solid ${theme.colors.border}`,
        background: theme.colors.surface,
        color: theme.colors.text,
        textDecoration: "none",
        fontWeight: 700,
        boxShadow: theme.shadow.soft,
        cursor: "pointer"
      }}
    >
      Export CSV
    </button>
  );
}