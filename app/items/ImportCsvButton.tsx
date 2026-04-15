"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
    loading: locale === "es" ? "Importando..." : "Importing...",
    failed: locale === "es" ? "Importación fallida" : "Import failed",
    chooseFile:
      locale === "es" ? "Selecciona un archivo CSV" : "Choose a CSV file",
    success:
      locale === "es" ? "Importación completada" : "Import completed"
  };

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const importUrl = `${API}/import/items`;

      console.log("API =", API);
      console.log("IMPORT URL =", importUrl);
      console.log("FILE =", {
        name: file.name,
        size: file.size,
        type: file.type
      });

      const res = await fetch(importUrl, {
        method: "POST",
        credentials: "include",
        body: formData
      });

      const rawText = await res.text();

      console.log("IMPORT STATUS =", res.status, res.statusText);
      console.log("IMPORT RAW RESPONSE =", rawText);

      let data: {
        inserted?: number;
        updated?: number;
        failed?: number;
        message?: string;
        stoppedByPlanLimit?: boolean;
      } | null = null;

      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        data = null;
      }

      if (!res.ok) {
        throw new Error(
          data?.message ||
            rawText ||
            `${text.failed} (${res.status} ${res.statusText})`
        );
      }

      router.refresh();

      alert(
        `${text.success}. Inserted: ${data?.inserted ?? 0}, updated: ${data?.updated ?? 0}, failed: ${data?.failed ?? 0}.`
      );
    } catch (err) {
      console.error("IMPORT ERROR =", err);
      alert(err instanceof Error ? err.message : text.failed);
    } finally {
      setLoading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
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