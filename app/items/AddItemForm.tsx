"use client";

import { useMemo, useState } from "react";
import {
  getItemLimitByPlan,
  isPaidPlan
} from "../lib/plans";

const API = process.env.NEXT_PUBLIC_API_URL!;

const categories = [
  "videogame",
  "book",
  "comic",
  "tcg",
  "figure",
  "boardgame",
  "miniature",
  "lego",
  "movie",
  "other"
] as const;

function getPlatformOptions(category: string, locale: "en" | "es") {
  const commonOther = [
    {
      value: "",
      label: locale === "es" ? "Sin especificar" : "Not specified"
    }
  ];

  const byCategory: Record<string, { value: string; label: string }[]> = {
    videogame: [
      { value: "", label: locale === "es" ? "Sin especificar" : "Not specified" },
      { value: "PS1", label: "PS1" },
      { value: "PS2", label: "PS2" },
      { value: "PS3", label: "PS3" },
      { value: "PS4", label: "PS4" },
      { value: "PS5", label: "PS5" },
      { value: "PSP", label: "PSP" },
      { value: "PS Vita", label: "PS Vita" },
      { value: "Xbox", label: "Xbox" },
      { value: "Xbox 360", label: "Xbox 360" },
      { value: "Xbox One", label: "Xbox One" },
      { value: "Xbox Series", label: "Xbox Series" },
      { value: "NES", label: "NES" },
      { value: "SNES", label: "SNES" },
      { value: "Nintendo 64", label: "Nintendo 64" },
      { value: "GameCube", label: "GameCube" },
      { value: "Wii", label: "Wii" },
      { value: "Wii U", label: "Wii U" },
      { value: "Switch", label: "Switch" },
      { value: "Game Boy", label: "Game Boy" },
      { value: "Game Boy Color", label: "Game Boy Color" },
      { value: "Game Boy Advance", label: "Game Boy Advance" },
      { value: "Nintendo DS", label: "Nintendo DS" },
      { value: "Nintendo 3DS", label: "Nintendo 3DS" },
      { value: "Mega Drive", label: "Mega Drive" },
      { value: "Master System", label: "Master System" },
      { value: "Dreamcast", label: "Dreamcast" },
      { value: "PC", label: "PC" }
    ],

    movie: [
      { value: "", label: locale === "es" ? "Sin especificar" : "Not specified" },
      { value: "DVD", label: "DVD" },
      { value: "Blu-ray", label: "Blu-ray" },
      { value: "4K UHD", label: "4K UHD" },
      { value: "VHS", label: "VHS" }
    ],

    book: [
      { value: "", label: locale === "es" ? "Sin especificar" : "Not specified" },
      { value: "Hardcover", label: "Hardcover" },
      { value: "Paperback", label: "Paperback" },
      { value: "Pocket", label: "Pocket" }
    ],

    comic: [
      { value: "", label: locale === "es" ? "Sin especificar" : "Not specified" },
      { value: "Single Issue", label: "Single Issue" },
      { value: "TPB", label: "TPB" },
      { value: "Hardcover", label: "Hardcover" },
      { value: "Omnibus", label: "Omnibus" },
      { value: "Manga", label: "Manga" }
    ],

    boardgame: [
      { value: "", label: locale === "es" ? "Sin especificar" : "Not specified" },
      { value: "Standard", label: "Standard" },
      { value: "Expansion", label: "Expansion" },
      { value: "Collector Edition", label: "Collector Edition" }
    ],

    miniature: [
      { value: "", label: locale === "es" ? "Sin especificar" : "Not specified" },

      { value: "Warhammer 40K", label: "Warhammer 40K" },
      { value: "Age of Sigmar", label: "Age of Sigmar" },
      { value: "Kill Team", label: "Kill Team" },
      { value: "Necromunda", label: "Necromunda" },
      { value: "Blood Bowl", label: "Blood Bowl" },
      { value: "Horus Heresy", label: "Horus Heresy" },

      { value: "Warcry", label: "Warcry" },
      { value: "Middle-earth", label: "Middle-earth" },

      { value: "Infinity", label: "Infinity" },
      { value: "Malifaux", label: "Malifaux" },
      { value: "Star Wars Legion", label: "Star Wars Legion" },

      {
        value: "Other Miniatures",
        label:
          locale === "es"
            ? "Otras miniaturas"
            : "Other Miniatures"
      }
    ],

    tcg: [
      { value: "", label: locale === "es" ? "Sin especificar" : "Not specified" },
      { value: "Pokemon", label: "Pokemon" },
      { value: "Yu-Gi-Oh!", label: "Yu-Gi-Oh!" },
      { value: "Magic", label: "Magic" },
      { value: "One Piece", label: "One Piece" },
      { value: "Lorcana", label: "Lorcana" }
    ],

    figure: [
      { value: "", label: locale === "es" ? "Sin especificar" : "Not specified" },
      { value: "PVC", label: "PVC" },
      { value: "Statue", label: "Statue" },
      { value: "Nendoroid", label: "Nendoroid" },
      { value: "Figma", label: "Figma" },
      { value: "Funko Pop", label: "Funko Pop" }
    ],

    lego: [
      { value: "", label: locale === "es" ? "Sin especificar" : "Not specified" },
      { value: "Set", label: "Set" },
      { value: "Minifigure", label: "Minifigure" },
      { value: "Promotional", label: "Promotional" }
    ],

    other: commonOther
  };

  return byCategory[category] || commonOther;
}

function getRegionOptions(category: string, locale: "en" | "es") {
  if (category === "videogame" || category === "movie") {
    return [
      { value: "", label: locale === "es" ? "Sin especificar" : "Not specified" },
      { value: "PAL", label: "PAL" },
      { value: "NTSC-U", label: "NTSC-U" },
      { value: "NTSC-J", label: "NTSC-J" },
      { value: "Region Free", label: "Region Free" }
    ];
  }

  return [
    { value: "", label: locale === "es" ? "Sin especificar" : "Not specified" },
    { value: "ES", label: "ES" },
    { value: "UK", label: "UK" },
    { value: "US", label: "US" },
    { value: "JP", label: "JP" },
    { value: "EU", label: "EU" },
    { value: "International", label: "International" }
  ];
}

function getConditionOptions(locale: "en" | "es") {
  return [
    { value: "", label: locale === "es" ? "Sin especificar" : "Not specified" },
    { value: "sealed", label: locale === "es" ? "Precintado" : "Sealed" },
    { value: "mint", label: "Mint" },
    { value: "near_mint", label: locale === "es" ? "Casi nuevo" : "Near Mint" },
    { value: "very_good", label: locale === "es" ? "Muy bueno" : "Very Good" },
    { value: "good", label: locale === "es" ? "Bueno" : "Good" },
    { value: "acceptable", label: locale === "es" ? "Aceptable" : "Acceptable" },
    { value: "poor", label: locale === "es" ? "Malo" : "Poor" }
  ];
}

function getCompletenessOptions(category: string, locale: "en" | "es") {
  if (category === "videogame") {
    return [
      { value: "", label: locale === "es" ? "Sin especificar" : "Not specified" },
      { value: "loose", label: "Loose" },
      { value: "boxed", label: locale === "es" ? "Con caja" : "Boxed" },
      { value: "cib", label: "CIB" },
      { value: "sealed", label: locale === "es" ? "Precintado" : "Sealed" }
    ];
  }

  if (
    category === "boardgame" ||
    category === "lego" ||
    category === "miniature"
  ) {
    return [
      { value: "", label: locale === "es" ? "Sin especificar" : "Not specified" },
      { value: "complete", label: locale === "es" ? "Completo" : "Complete" },
      { value: "incomplete", label: locale === "es" ? "Incompleto" : "Incomplete" },
      { value: "sealed", label: locale === "es" ? "Precintado" : "Sealed" }
    ];
  }

  if (category === "book" || category === "comic" || category === "movie") {
    return [
      { value: "", label: locale === "es" ? "Sin especificar" : "Not specified" },
      { value: "standard", label: locale === "es" ? "Estándar" : "Standard" },
      { value: "special_edition", label: locale === "es" ? "Edición especial" : "Special Edition" },
      { value: "sealed", label: locale === "es" ? "Precintado" : "Sealed" }
    ];
  }

  return [
    { value: "", label: locale === "es" ? "Sin especificar" : "Not specified" },
    { value: "complete", label: locale === "es" ? "Completo" : "Complete" },
    { value: "incomplete", label: locale === "es" ? "Incompleto" : "Incomplete" }
  ];
}

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

  const platformOptions = useMemo(
    () => getPlatformOptions(category, locale),
    [category, locale]
  );

  const regionOptions = useMemo(
    () => getRegionOptions(category, locale),
    [category, locale]
  );

  const conditionOptions = useMemo(
    () => getConditionOptions(locale),
    [locale]
  );

  const completenessOptions = useMemo(
    () => getCompletenessOptions(category, locale),
    [category, locale]
  );

  const itemLimit = getItemLimitByPlan(plan);
  const paidPlan = isPaidPlan(plan);
  const freeLimitReached = itemLimit != null && currentCount >= itemLimit;

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
    planLimitError:
      locale === "es"
        ? `Has alcanzado el límite de ${itemLimit ?? "∞"} objetos de tu plan actual.`
        : `You reached the ${itemLimit ?? "∞"} item limit for your current plan.`,
    upgrade:
      locale === "es" ? "Ver planes" : "See plans",
    paidHint:
      locale === "es"
        ? "Tu plan actual permite seguir ampliando la colección."
        : "Your current plan lets you keep expanding your collection."
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (freeLimitReached) {
      setMessage(text.planLimitError);
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
        if (
          res.status === 403 &&
          (data?.code === "ITEM_LIMIT_REACHED" ||
            data?.code === "FREE_ITEM_LIMIT_REACHED")
        ) {
          setMessage(data?.message || text.planLimitError);
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
          {text.planLimitError}{" "}
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

      {paidPlan && (
        <div
          style={{
            marginBottom: 14,
            padding: "12px 14px",
            borderRadius: 16,
            background: "#F0FDF4",
            border: "1px solid #BBF7D0",
            color: "#166534",
            fontSize: 14,
            lineHeight: 1.6
          }}
        >
          {text.paidHint}
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
            onChange={(e) => {
              const nextCategory = e.target.value as (typeof categories)[number];
              setCategory(nextCategory);
              setPlatform("");
              setRegion("");
              setCompleteness("");
            }}
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
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            disabled={loading || freeLimitReached}
            style={inputStyle}
          >
            {conditionOptions.map((option) => (
              <option key={`condition-${option.value}`} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label={text.platform}>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            disabled={loading || freeLimitReached}
            style={inputStyle}
          >
            {platformOptions.map((option) => (
              <option
                key={`${category}-platform-${option.value}`}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label={text.completeness}>
          <select
            value={completeness}
            onChange={(e) => setCompleteness(e.target.value)}
            disabled={loading || freeLimitReached}
            style={inputStyle}
          >
            {completenessOptions.map((option) => (
              <option
                key={`${category}-completeness-${option.value}`}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label={text.region}>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            disabled={loading || freeLimitReached}
            style={inputStyle}
          >
            {regionOptions.map((option) => (
              <option
                key={`${category}-region-${option.value}`}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
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