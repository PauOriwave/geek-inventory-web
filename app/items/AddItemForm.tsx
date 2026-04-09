"use client";

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL!;
const FREE_ITEM_LIMIT = 50;

const categories = [
  "videogame",
  "book",
  "comic",
  "tcg",
  "figure",
  "boardgame",
  "lego",
  "movie",
  "other"
] as const;

export default function AddItemForm({
  locale = "en",
  plan = "free",
  currentCount = 0
}: {
  locale?: "en" | "es";
  plan?: string;
  currentCount?: number;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] =
    useState<(typeof categories)[number]>("videogame");
  const [estimatedPrice, setEstimatedPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [condition, setCondition] = useState("");
  const [platform, setPlatform] = useState("");
  const [completeness, setCompleteness] = useState("");
  const [region, setRegion] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isPremium = plan === "premium";
  const freeLimitReached = !isPremium && currentCount >= FREE_ITEM_LIMIT;

  const text = {
    title: locale === "es" ? "Añadir nuevo objeto" : "Add new item",
    name: locale === "es" ? "Nombre" : "Name",
    category: locale === "es" ? "Categoría" : "Category",
    estimatedPrice: locale === "es" ? "Precio estimado" : "Estimated price",
    quantity: locale === "es" ? "Cantidad" : "Quantity",
    condition: locale === "es" ? "Estado" : "Condition",
    platform: locale === "es" ? "Plataforma" : "Platform",
    completeness: locale === "es" ? "Completitud" : "Completeness",
    region: locale === "es" ? "Región" : "Region",
    notes: locale === "es" ? "Notas" : "Notes",
    submit: locale === "es" ? "Crear objeto" : "Create item",
    creating: locale === "es" ? "Creando..." : "Creating...",
    success:
      locale === "es"
        ? "Objeto creado correctamente."
        : "Item created successfully.",
    genericError:
      locale === "es"
        ? "No se pudo crear el objeto."
        : "Could not create the item.",
    freeLimitError:
      locale === "es"
        ? "Has alcanzado el límite del plan Free. Sube a Premium para seguir añadiendo objetos."
        : "You reached the Free plan limit. Upgrade to Premium to keep adding items.",
    upgrade:
      locale === "es" ? "Ver Premium" : "See Premium"
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (freeLimitReached) {
      setMessage(text.freeLimitError);
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const res = await fetch(`${API}/items`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          category,
          estimatedPrice: Number(estimatedPrice),
          quantity: Number(quantity),
          condition: condition || undefined,
          platform: platform || undefined,
          completeness: completeness || undefined,
          region: region || undefined,
          notes: notes || undefined
        })
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 403 && data?.code === "FREE_ITEM_LIMIT_REACHED") {
          setMessage(text.freeLimitError);
          return;
        }

        setMessage(data?.message || text.genericError);
        return;
      }

      setName("");
      setCategory("videogame");
      setEstimatedPrice("");
      setQuantity("1");
      setCondition("");
      setPlatform("");
      setCompleteness("");
      setRegion("");
      setNotes("");
      setMessage(text.success);

      window.location.reload();
    } catch {
      setMessage(text.genericError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 24,
        padding: 18,
        boxShadow: "0 20px 40px rgba(15,23,42,0.10)"
      }}
    >
      <div
        style={{
          fontWeight: 800,
          fontSize: 16,
          marginBottom: 14,
          color: "#171717"
        }}
      >
        {text.title}
      </div>

      {freeLimitReached && (
        <div
          style={{
            marginBottom: 14,
            padding: "12px 14px",
            borderRadius: 16,
            background: "#FEF3F2",
            border: "1px solid #FECACA",
            color: "#B42318",
            fontSize: 14,
            lineHeight: 1.6
          }}
        >
          {text.freeLimitError}{" "}
          <a
            href={`/pricing?lang=${locale}`}
            style={{
              color: "#B42318",
              fontWeight: 900,
              textDecoration: "none"
            }}
          >
            {text.upgrade}
          </a>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 12
        }}
      >
        <Field label={text.name}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading || freeLimitReached}
            style={inputStyle}
          />
        </Field>

        <Field label={text.category}>
          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as (typeof categories)[number])
            }
            disabled={loading || freeLimitReached}
            style={inputStyle}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>

        <Field label={text.estimatedPrice}>
          <input
            type="number"
            step="0.01"
            min="0"
            value={estimatedPrice}
            onChange={(e) => setEstimatedPrice(e.target.value)}
            required
            disabled={loading || freeLimitReached}
            style={inputStyle}
          />
        </Field>

        <Field label={text.quantity}>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            disabled={loading || freeLimitReached}
            style={inputStyle}
          />
        </Field>

        <Field label={text.condition}>
          <input
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            disabled={loading || freeLimitReached}
            style={inputStyle}
          />
        </Field>

        <Field label={text.platform}>
          <input
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            disabled={loading || freeLimitReached}
            style={inputStyle}
          />
        </Field>

        <Field label={text.completeness}>
          <input
            value={completeness}
            onChange={(e) => setCompleteness(e.target.value)}
            disabled={loading || freeLimitReached}
            style={inputStyle}
          />
        </Field>

        <Field label={text.region}>
          <input
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            disabled={loading || freeLimitReached}
            style={inputStyle}
          />
        </Field>

        <div style={{ gridColumn: "1 / -1" }}>
          <Field label={text.notes}>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading || freeLimitReached}
              style={{
                ...inputStyle,
                minHeight: 90,
                resize: "vertical"
              }}
            />
          </Field>
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <button
            type="submit"
            disabled={loading || freeLimitReached}
            style={{
              border: "none",
              borderRadius: 999,
              padding: "12px 16px",
              background: freeLimitReached ? "#9CA3AF" : "#171717",
              color: "white",
              fontWeight: 900,
              cursor: freeLimitReached ? "not-allowed" : "pointer"
            }}
          >
            {loading ? text.creating : text.submit}
          </button>
        </div>

        {message && (
          <div
            style={{
              gridColumn: "1 / -1",
              fontSize: 13,
              color: message === text.success ? "#027A48" : "#6B7280",
              lineHeight: 1.6
            }}
          >
            {message}
          </div>
        )}
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
        display: "grid",
        gap: 6
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: "#6B7280"
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
  borderRadius: 12,
  border: "1px solid #E5E7EB",
  background: "#F9FAFB",
  color: "#171717",
  fontSize: 14,
  outline: "none"
};