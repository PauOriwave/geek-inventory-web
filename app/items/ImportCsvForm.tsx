"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";


const API = process.env.NEXT_PUBLIC_API_URL!;

export default function ImportCsvForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  async function submit() {
    if (!file) {
      setResult("Select a CSV file first.");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API}/import/items`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      const data = await res.json();

      setResult(`Inserted: ${data.inserted} | Failed: ${data.failed}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      setResult("Import failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 14,
        marginTop: 20
      }}
    >
      <div style={{ fontWeight: 800, marginBottom: 10 }}>
        Import CSV
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

        <button
          onClick={submit}
          disabled={loading}
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid #111827",
            background: "#111827",
            color: "white",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Importing…" : "Import"}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: 10, color: "#6b7280" }}>
          {result}
        </div>
      )}
    </section>
  );
}