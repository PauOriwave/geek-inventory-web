"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { theme } from "../theme";
import { getSessionTokenFromCookie } from "../lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL!;

export default function ImportCsvButton() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleImport() {
    const file = fileRef.current?.files?.[0];
    const token = getSessionTokenFromCookie();

    if (!token) {
      alert("No active session");
      return;
    }

    if (!file) {
      alert("Select a CSV file first");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API}/import/items`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Import failed");
      }

      alert(`Imported: ${data.inserted}, Failed: ${data.failed}`);
      router.refresh();

      if (fileRef.current) {
        fileRef.current.value = "";
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Import failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        flexWrap: "wrap"
      }}
    >
      <input
        ref={fileRef}
        type="file"
        accept=".csv"
        style={{
          fontSize: 13,
          color: theme.colors.text
        }}
      />

      <button
        type="button"
        onClick={handleImport}
        disabled={loading}
        style={{
          padding: "10px 12px",
          borderRadius: theme.radius.sm,
          border: `1px solid ${theme.colors.border}`,
          background: theme.colors.surface,
          color: theme.colors.text,
          fontWeight: 700,
          boxShadow: theme.shadow.soft,
          cursor: loading ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "Importing…" : "Import CSV"}
      </button>
    </div>
  );
}