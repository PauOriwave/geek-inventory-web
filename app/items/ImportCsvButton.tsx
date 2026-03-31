"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSessionTokenFromCookie } from "../lib/auth";
import { theme } from "../theme";

const API = process.env.NEXT_PUBLIC_API_URL!;

export default function ImportCsvButton() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = searchParams.get("lang") === "es" ? "es" : "en";
  const [loading, setLoading] = useState(false);

  const text = {
    label: locale === "es" ? "Importar CSV" : "Import CSV",
    loading: locale === "es" ? "Importando…" : "Importing…",
    noSession: locale === "es" ? "No hay sesión activa" : "No active session",
    failed: locale === "es" ? "Importación fallida" : "Import failed",
    chooseFile:
      locale === "es" ? "Selecciona un archivo CSV" : "Choose a CSV file"
  };

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = getSessionTokenFromCookie();
    if (!token) {
      alert(text.noSession);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API}/import/csv`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || text.failed);
      }

      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : text.failed);
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={onFileChange}
        style={{ display: "none" }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        title={text.chooseFile}
        style={buttonStyle}
      >
        {loading ? text.loading : text.label}
      </button>
    </>
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