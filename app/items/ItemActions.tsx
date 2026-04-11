"use client";

import { useMemo, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL!;

function getPlatformOptions(locale: "en" | "es") {
  return [
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
    { value: "PC", label: "PC" },
    { value: "DVD", label: "DVD" },
    { value: "Blu-ray", label: "Blu-ray" },
    { value: "4K UHD", label: "4K UHD" },
    { value: "VHS", label: "VHS" },
    { value: "Hardcover", label: "Hardcover" },
    { value: "Paperback", label: "Paperback" },
    { value: "Pocket", label: "Pocket" },
    { value: "Single Issue", label: "Single Issue" },
    { value: "TPB", label: "TPB" },
    { value: "Omnibus", label: "Omnibus" },
    { value: "Manga", label: "Manga" },
    { value: "Standard", label: "Standard" },
    { value: "Expansion", label: "Expansion" },
    { value: "Collector Edition", label: "Collector Edition" },
    { value: "Pokemon", label: "Pokemon" },
    { value: "Yu-Gi-Oh!", label: "Yu-Gi-Oh!" },
    { value: "Magic", label: "Magic" },
    { value: "One Piece", label: "One Piece" },
    { value: "Lorcana", label: "Lorcana" },
    { value: "PVC", label: "PVC" },
    { value: "Statue", label: "Statue" },
    { value: "Nendoroid", label: "Nendoroid" },
    { value: "Figma", label: "Figma" },
    { value: "Funko Pop", label: "Funko Pop" },
    { value: "Set", label: "Set" },
    { value: "Minifigure", label: "Minifigure" },
    { value: "Promotional", label: "Promotional" }
  ];
}

function getRegionOptions(locale: "en" | "es") {
  return [
    { value: "", label: locale === "es" ? "Sin especificar" : "Not specified" },
    { value: "PAL", label: "PAL" },
    { value: "NTSC-U", label: "NTSC-U" },
    { value: "NTSC-J", label: "NTSC-J" },
    { value: "Region Free", label: "Region Free" },
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

function getCompletenessOptions(locale: "en" | "es") {
  return [
    { value: "", label: locale === "es" ? "Sin especificar" : "Not specified" },
    { value: "loose", label: "Loose" },
    { value: "boxed", label: locale === "es" ? "Con caja" : "Boxed" },
    { value: "cib", label: "CIB" },
    { value: "complete", label: locale === "es" ? "Completo" : "Complete" },
    { value: "incomplete", label: locale === "es" ? "Incompleto" : "Incomplete" },
    { value: "standard", label: locale === "es" ? "Estándar" : "Standard" },
    { value: "special_edition", label: locale === "es" ? "Edición especial" : "Special Edition" },
    { value: "sealed", label: locale === "es" ? "Precintado" : "Sealed" }
  ];
}

export default function ItemActions({
  id,
  initialQty,
  initialPrice,
  initialCondition = "",
  initialPlatform = "",
  initialCompleteness = "",
  initialRegion = "",
  initialNotes = "",
  locale = "en",
  plan
}: {
  id: string;
  initialQty: number;
  initialPrice: number;
  initialCondition?: string | null;
  initialPlatform?: string | null;
  initialCompleteness?: string | null;
  initialRegion?: string | null;
  initialNotes?: string | null;
  locale?: "en" | "es";
  plan?: string;
}) {
  const [qty, setQty] = useState(String(initialQty));
  const [price, setPrice] = useState(String(initialPrice));
  const [condition, setCondition] = useState(initialCondition ?? "");
  const [platform, setPlatform] = useState(initialPlatform ?? "");
  const [completeness, setCompleteness] = useState(initialCompleteness ?? "");
  const [region, setRegion] = useState(initialRegion ?? "");
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [valuating, setValuating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const platformOptions = useMemo(() => getPlatformOptions(locale), [locale]);
  const regionOptions = useMemo(() => getRegionOptions(locale), [locale]);
  const conditionOptions = useMemo(() => getConditionOptions(locale), [locale]);
  const completenessOptions = useMemo(
    () => getCompletenessOptions(locale),
    [locale]
  );

  const isPaidPlan = plan === "premium" || plan === "market_pro";

  const text = {
    edit: locale === "es" ? "Editar" : "Edit",
    save: locale === "es" ? "Guardar" : "Save",
    saving: locale === "es" ? "Guardando..." : "Saving...",
    cancel: locale === "es" ? "Cancelar" : "Cancel",
    delete: locale === "es" ? "Eliminar" : "Delete",
    deleting: locale === "es" ? "Eliminando..." : "Deleting...",
    valuate: locale === "es" ? "Valorar" : "Valuate",
    valuating: locale === "es" ? "Valorando..." : "Valuating...",
    qty: locale === "es" ? "Cantidad" : "Quantity",
    price: locale === "es" ? "Precio estimado" : "Estimated price",
    condition: locale === "es" ? "Estado" : "Condition",
    platform: locale === "es" ? "Plataforma" : "Platform",
    completeness: locale === "es" ? "Completitud" : "Completeness",
    region: locale === "es" ? "Región" : "Region",
    notes: locale === "es" ? "Notas" : "Notes",
    confirmDelete:
      locale === "es"
        ? "¿Seguro que quieres eliminar este objeto?"
        : "Are you sure you want to delete this item?",
    noValuation:
      locale === "es"
        ? "No se encontró valoración para este objeto ahora mismo."
        : "No valuation found for this item right now.",
    genericValuationError:
      locale === "es" ? "No se pudo valorar." : "Could not valuate.",
    premiumOnly:
      locale === "es"
        ? "Esta función está disponible solo en planes de pago."
        : "This feature is available only on paid plans."
  };

  async function handleSave() {
    try {
      setSaving(true);

      const res = await fetch(`${API}/items/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          quantity: Number(qty),
          estimatedPrice: Number(price),
          condition: condition || undefined,
          platform: platform || undefined,
          completeness: completeness || undefined,
          region: region || undefined,
          notes: notes || undefined
        })
      });

      if (!res.ok) {
        throw new Error("Failed to update item");
      }

      setEditing(false);
      window.location.reload();
    } catch {
      alert(locale === "es" ? "No se pudo guardar." : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const ok = window.confirm(text.confirmDelete);
    if (!ok) return;

    try {
      setDeleting(true);

      const res = await fetch(`${API}/items/${id}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (!res.ok) {
        throw new Error("Failed to delete item");
      }

      window.location.reload();
    } catch {
      alert(locale === "es" ? "No se pudo eliminar." : "Could not delete.");
    } finally {
      setDeleting(false);
    }
  }

  async function handleValuate() {
    if (!isPaidPlan) {
      alert(text.premiumOnly);
      return;
    }

    try {
      setValuating(true);

      const res = await fetch(`${API}/items/${id}/valuate`, {
        method: "POST",
        credentials: "include"
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 403) {
          alert(text.premiumOnly);
          return;
        }

        if (data?.code === "NO_VALUATION_FOUND") {
          alert(data?.message || text.noValuation);
          return;
        }

        throw new Error(data?.message || text.genericValuationError);
      }

      window.location.reload();
    } catch (error) {
      alert(
        error instanceof Error && error.message
          ? error.message
          : text.genericValuationError
      );
    } finally {
      setValuating(false);
    }
  }

  if (!editing) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
          flexWrap: "wrap"
        }}
      >
        <button
          type="button"
          onClick={() => setEditing(true)}
          style={secondaryBtn}
        >
          {text.edit}
        </button>

        <button
          type="button"
          onClick={handleValuate}
          disabled={valuating}
          title={!isPaidPlan ? text.premiumOnly : undefined}
          style={{
            ...darkBtn,
            opacity: valuating ? 0.8 : !isPaidPlan ? 0.7 : 1
          }}
        >
          {valuating ? text.valuating : text.valuate}
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          style={dangerBtn}
        >
          {deleting ? text.deleting : text.delete}
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        minWidth: 320,
        padding: 12,
        border: "1px solid #E5E7EB",
        borderRadius: 16,
        background: "#FFFFFF",
        boxShadow: "0 12px 32px rgba(15,23,42,0.10)",
        display: "grid",
        gap: 10
      }}
    >
      <Field label={text.qty}>
        <input
          type="number"
          min="1"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          style={inputStyle}
        />
      </Field>

      <Field label={text.price}>
        <input
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={inputStyle}
        />
      </Field>

      <Field label={text.condition}>
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
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
          style={inputStyle}
        >
          {platformOptions.map((option) => (
            <option key={`platform-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label={text.completeness}>
        <select
          value={completeness}
          onChange={(e) => setCompleteness(e.target.value)}
          style={inputStyle}
        >
          {completenessOptions.map((option) => (
            <option key={`completeness-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label={text.region}>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          style={inputStyle}
        >
          {regionOptions.map((option) => (
            <option key={`region-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label={text.notes}>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{
            ...inputStyle,
            minHeight: 90,
            resize: "vertical"
          }}
        />
      </Field>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
          flexWrap: "wrap"
        }}
      >
        <button
          type="button"
          onClick={() => setEditing(false)}
          style={secondaryBtn}
        >
          {text.cancel}
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={darkBtn}
        >
          {saving ? text.saving : text.save}
        </button>
      </div>
    </div>
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
        gap: 6,
        textAlign: "left"
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

const secondaryBtn: React.CSSProperties = {
  border: "1px solid #E5E7EB",
  borderRadius: 999,
  padding: "8px 12px",
  background: "#FFFFFF",
  color: "#171717",
  fontWeight: 800,
  cursor: "pointer"
};

const darkBtn: React.CSSProperties = {
  border: "none",
  borderRadius: 999,
  padding: "8px 12px",
  background: "#171717",
  color: "#FFFFFF",
  fontWeight: 800,
  cursor: "pointer"
};

const dangerBtn: React.CSSProperties = {
  border: "none",
  borderRadius: 999,
  padding: "8px 12px",
  background: "#DC2626",
  color: "#FFFFFF",
  fontWeight: 800,
  cursor: "pointer"
};