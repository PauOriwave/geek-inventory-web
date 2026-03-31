"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { theme } from "../theme";
import { getSessionTokenFromCookie } from "../lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL!;

export default function AddItemForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = searchParams.get("lang") === "es" ? "es" : "en";

  const [name, setName] = useState("");
  const [category, setCategory] = useState("videogame");
  const [estimatedPrice, setEstimatedPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [platform, setPlatform] = useState("");
  const [region, setRegion] = useState("");
  const [condition, setCondition] = useState("");
  const [completeness, setCompleteness] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const text = {
    title: locale === "es" ? "Añadir objeto" : "Add item",
    name: locale === "es" ? "Nombre" : "Name",
    category: locale === "es" ? "Categoría" : "Category",
    price: locale === "es" ? "Precio estimado" : "Estimated price",
    qty: locale === "es" ? "Cantidad" : "Quantity",
    platform: locale === "es" ? "Plataforma" : "Platform",
    region: locale === "es" ? "Región" : "Region",
    condition: locale === "es" ? "Estado" : "Condition",
    completeness: locale === "es" ? "Completitud" : "Completeness",
    notes: locale === "es" ? "Notas" : "Notes",
    submit: locale === "es" ? "Añadir" : "Add item",
    adding: locale === "es" ? "Añadiendo…" : "Adding…",
    error:
      locale === "es"
        ? "No se pudo crear el objeto"
        : "Could not create item",
    required:
      locale === "es"
        ? "Nombre, precio y cantidad son obligatorios"
        : "Name, price and quantity are required"
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const token = getSessionTokenFromCookie();
    if (!token) {
      alert(locale === "es" ? "Sesión no encontrada" : "Session not found");
      return;
    }

    if (!name.trim() || !estimatedPrice.trim() || !quantity.trim()) {
      alert(text.required);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          category,
          estimatedPrice: Number(estimatedPrice),
          quantity: Number(quantity),
          platform: platform.trim() || null,
          region: region.trim() || null,
          condition: condition.trim() || null,
          completeness: completeness.trim() || null,
          notes: notes.trim() || null
        })
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || text.error);
      }

      setName("");
      setCategory("videogame");
      setEstimatedPrice("");
      setQuantity("1");
      setPlatform("");
      setRegion("");
      setCondition("");
      setCompleteness("");
      setNotes("");

      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : text.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      style={{
        marginTop: 12,
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.xl,
        padding: 16,
        boxShadow: theme.shadow.card
      }}
    >
      <div
        style={{
          fontWeight: 800,
          fontSize: 15,
          color: theme.colors.text,
          marginBottom: 12
        }}
      >
        {text.title}
      </div>

      <form
        onSubmit={onSubmit}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 10
        }}
      >
        <Field label={text.name}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />
        </Field>

        <Field label={text.category}>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={inputStyle}
          >
            <option value="videogame">Videogame</option>
            <option value="book">Book</option>
            <option value="comic">Comic</option>
            <option value="tcg">TCG</option>
            <option value="figure">Figure</option>
            <option value="boardgame">Board Game</option>
            <option value="lego">LEGO</option>
            <option value="other">Other</option>
          </select>
        </Field>

        <Field label={text.price}>
          <input
            type="number"
            min="0"
            step="0.01"
            value={estimatedPrice}
            onChange={(e) => setEstimatedPrice(e.target.value)}
            style={inputStyle}
          />
        </Field>

        <Field label={text.qty}>
          <input
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            style={inputStyle}
          />
        </Field>

        <Field label={text.platform}>
          <input
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            style={inputStyle}
          />
        </Field>

        <Field label={text.region}>
          <input
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            style={inputStyle}
          />
        </Field>

        <Field label={text.condition}>
          <input
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            style={inputStyle}
          />
        </Field>

        <Field label={text.completeness}>
          <input
            value={completeness}
            onChange={(e) => setCompleteness(e.target.value)}
            style={inputStyle}
          />
        </Field>

        <div style={{ gridColumn: "1 / -2" }}>
          <Field label={text.notes}>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                ...inputStyle,
                minHeight: 88,
                resize: "vertical"
              }}
            />
          </Field>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "end"
          }}
        >
          <button type="submit" disabled={loading} style={primaryButton}>
            {loading ? text.adding : text.submit}
          </button>
        </div>
      </form>
    </section>
  );
}

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: theme.colors.textMuted
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  borderRadius: theme.radius.md,
  border: `1px solid ${theme.colors.border}`,
  background: theme.colors.surfaceAlt,
  color: theme.colors.text,
  fontSize: 14,
  outline: "none"
};

const primaryButton: React.CSSProperties = {
  border: "none",
  padding: "10px 14px",
  borderRadius: 999,
  background: theme.colors.gold,
  color: theme.colors.black,
  fontWeight: 900,
  cursor: "pointer",
  width: "100%"
};