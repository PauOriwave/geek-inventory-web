"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { theme } from "../theme";

const API = process.env.NEXT_PUBLIC_API_URL!;

export default function AddItemForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const locale = searchParams.get("lang") === "es" ? "es" : "en";

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [platform, setPlatform] = useState("");
  const [region, setRegion] = useState("");
  const [condition, setCondition] = useState("");
  const [completeness, setCompleteness] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);

  const text = {
    title:
      locale === "es" ? "Añadir nuevo objeto" : "Add new item",
    subtitle:
      locale === "es"
        ? "Crea una nueva entrada para tu colección con sus datos clave."
        : "Create a new entry for your collection with its key metadata.",

    name: locale === "es" ? "Nombre" : "Name",
    category: locale === "es" ? "Categoría" : "Category",
    estimatedPrice:
      locale === "es" ? "Precio estimado" : "Estimated price",
    quantity: locale === "es" ? "Cantidad" : "Quantity",
    platform: locale === "es" ? "Plataforma" : "Platform",
    region: locale === "es" ? "Región" : "Region",
    condition: locale === "es" ? "Estado" : "Condition",
    completeness:
      locale === "es" ? "Completitud" : "Completeness",
    notes: locale === "es" ? "Notas" : "Notes",

    create:
      locale === "es" ? "Crear objeto" : "Create item",
    creating:
      locale === "es" ? "Creando..." : "Creating...",

    placeholderName:
      locale === "es" ? "Ej: Pokémon Azul" : "e.g. Pokémon Blue",
    placeholderPlatform:
      locale === "es" ? "Ej: PS2, Switch, PC..." : "e.g. PS2, Switch, PC...",
    placeholderRegion:
      locale === "es" ? "Ej: PAL, NTSC-J..." : "e.g. PAL, NTSC-J...",
    placeholderCondition:
      locale === "es" ? "Ej: very_good" : "e.g. very_good",
    placeholderCompleteness:
      locale === "es" ? "Ej: cib, loose..." : "e.g. cib, loose...",
    placeholderNotes:
      locale === "es"
        ? "Detalles extra, edición, accesorios, observaciones..."
        : "Extra details, edition, accessories, observations...",

    selectCategory:
      locale === "es" ? "Seleccionar categoría" : "Select category",

    error:
      locale === "es"
        ? "No se pudo crear el objeto"
        : "Could not create item",

    required:
      locale === "es"
        ? "Nombre, categoría y precio son obligatorios"
        : "Name, category and price are required"
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !category || !estimatedPrice.trim()) {
      alert(text.required);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          category,
          estimatedPrice: Number(estimatedPrice),
          quantity: Number(quantity || "1"),
          platform: platform.trim() || null,
          region: region.trim() || null,
          condition: condition.trim() || null,
          completeness: completeness.trim() || null,
          notes: notes.trim() || null
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || text.error);
      }

      setName("");
      setCategory("");
      setEstimatedPrice("");
      setQuantity("1");
      setPlatform("");
      setRegion("");
      setCondition("");
      setCompleteness("");
      setNotes("");

      router.refresh();
    } catch (err) {
      console.error(err);
      alert(text.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      style={{
        marginTop: 14,
        padding: 18,
        borderRadius: theme.radius.xl,
        border: `1px solid ${theme.colors.border}`,
        background: theme.colors.surface,
        boxShadow: theme.shadow.card
      }}
    >
      <div style={{ marginBottom: 14 }}>
        <div
          style={{
            fontWeight: 800,
            fontSize: 16,
            color: theme.colors.text
          }}
        >
          {text.title}
        </div>

        <div
          style={{
            marginTop: 4,
            fontSize: 13,
            color: theme.colors.textMuted
          }}
        >
          {text.subtitle}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 12
          }}
        >
          <Field label={text.name}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={text.placeholderName}
              style={inputStyle}
            />
          </Field>

          <Field label={text.category}>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={inputStyle}
            >
              <option value="">{text.selectCategory}</option>
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

          <Field label={text.estimatedPrice}>
            <input
              type="number"
              min="0"
              step="0.01"
              value={estimatedPrice}
              onChange={(e) => setEstimatedPrice(e.target.value)}
              style={inputStyle}
            />
          </Field>

          <Field label={text.quantity}>
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
              placeholder={text.placeholderPlatform}
              style={inputStyle}
            />
          </Field>

          <Field label={text.region}>
            <input
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder={text.placeholderRegion}
              style={inputStyle}
            />
          </Field>

          <Field label={text.condition}>
            <input
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder={text.placeholderCondition}
              style={inputStyle}
            />
          </Field>

          <Field label={text.completeness}>
            <input
              value={completeness}
              onChange={(e) => setCompleteness(e.target.value)}
              placeholder={text.placeholderCompleteness}
              style={inputStyle}
            />
          </Field>

          <div style={{ gridColumn: "1 / -1" }}>
            <Field label={text.notes}>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={text.placeholderNotes}
                style={{
                  ...inputStyle,
                  minHeight: 110,
                  resize: "vertical"
                }}
              />
            </Field>
          </div>
        </div>

        <div
          style={{
            marginTop: 14,
            display: "flex",
            justifyContent: "flex-end"
          }}
        >
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "11px 16px",
              borderRadius: 999,
              border: "none",
              background: theme.colors.black,
              color: "white",
              fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.8 : 1
            }}
          >
            {loading ? text.creating : text.create}
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
    <label
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6
      }}
    >
      <span
        style={{
          fontSize: 12,
          color: theme.colors.textMuted,
          fontWeight: 700
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
  borderRadius: 10,
  border: `1px solid ${theme.colors.border}`,
  background: theme.colors.surfaceAlt,
  color: theme.colors.text,
  fontSize: 14,
  outline: "none"
};