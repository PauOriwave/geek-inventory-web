"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { getSessionTokenFromCookie } from "../lib/auth";
import { theme } from "../theme";

const API = process.env.NEXT_PUBLIC_API_URL!;

export default function ItemActions({
  id,
  initialQty,
  initialPrice,
  initialCondition,
  initialPlatform,
  initialCompleteness,
  initialRegion,
  initialNotes
}: {
  id: string;
  initialQty: number;
  initialPrice: number;
  initialCondition?: string | null;
  initialPlatform?: string | null;
  initialCompleteness?: string | null;
  initialRegion?: string | null;
  initialNotes?: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = searchParams.get("lang") === "es" ? "es" : "en";

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [quantity, setQuantity] = useState(String(initialQty));
  const [estimatedPrice, setEstimatedPrice] = useState(String(initialPrice));
  const [condition, setCondition] = useState(initialCondition ?? "");
  const [platform, setPlatform] = useState(initialPlatform ?? "");
  const [completeness, setCompleteness] = useState(
    initialCompleteness ?? ""
  );
  const [region, setRegion] = useState(initialRegion ?? "");
  const [notes, setNotes] = useState(initialNotes ?? "");

  const text = {
    edit: locale === "es" ? "Editar" : "Edit",
    delete: locale === "es" ? "Eliminar" : "Delete",
    valuate: "Valuate",
    save: locale === "es" ? "Guardar cambios" : "Save changes",
    cancel: locale === "es" ? "Cancelar" : "Cancel",

    quantity: locale === "es" ? "Cantidad" : "Quantity",
    price: locale === "es" ? "Precio estimado" : "Estimated price",
    condition: locale === "es" ? "Estado" : "Condition",
    platform: locale === "es" ? "Plataforma" : "Platform",
    completeness: locale === "es" ? "Completitud" : "Completeness",
    region: locale === "es" ? "Región" : "Region",
    notes: locale === "es" ? "Notas" : "Notes",

    placeholderCondition:
      locale === "es" ? "Ej: very_good" : "e.g. very_good",
    placeholderPlatform:
      locale === "es" ? "Ej: PS2, Switch, PC..." : "e.g. PS2, Switch, PC...",
    placeholderCompleteness:
      locale === "es" ? "Ej: cib, loose..." : "e.g. cib, loose...",
    placeholderRegion:
      locale === "es" ? "Ej: PAL, NTSC-J..." : "e.g. PAL, NTSC-J...",
    placeholderNotes:
      locale === "es"
        ? "Detalles, edición, accesorios, observaciones..."
        : "Details, edition, accessories, observations...",

    saving: locale === "es" ? "Guardando..." : "Saving...",
    valuating: locale === "es" ? "Valorando..." : "Valuating...",
    deleting: locale === "es" ? "Eliminando..." : "Deleting...",

    confirmDelete:
      locale === "es"
        ? "¿Seguro que quieres eliminar este objeto?"
        : "Are you sure you want to delete this item?",

    updateError:
      locale === "es"
        ? "No se pudo actualizar el objeto"
        : "Could not update item",
    deleteError:
      locale === "es"
        ? "No se pudo eliminar el objeto"
        : "Could not delete item",
    valuateError:
      locale === "es"
        ? "No se pudo valorar el objeto"
        : "Could not valuate item"
  };

  async function handleSave() {
    const token = getSessionTokenFromCookie();
    if (!token) return;

    try {
      setLoading(true);

      const res = await fetch(`${API}/items/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          quantity: Number(quantity),
          estimatedPrice: Number(estimatedPrice),
          condition: condition.trim() || null,
          platform: platform.trim() || null,
          completeness: completeness.trim() || null,
          region: region.trim() || null,
          notes: notes.trim() || null
        })
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || text.updateError);
      }

      setOpen(false);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : text.updateError);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    const ok = confirm(text.confirmDelete);
    if (!ok) return;

    const token = getSessionTokenFromCookie();
    if (!token) return;

    try {
      setLoading(true);

      const res = await fetch(`${API}/items/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || text.deleteError);
      }

      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : text.deleteError);
    } finally {
      setLoading(false);
    }
  }

  async function handleValuate() {
    const token = getSessionTokenFromCookie();
    if (!token) return;

    try {
      setLoading(true);

      const res = await fetch(`${API}/items/${id}/valuate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || text.valuateError);
      }

      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : text.valuateError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 8, justifyItems: "end" }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={chipButton}
        >
          {text.edit}
        </button>

        <button
          type="button"
          onClick={handleValuate}
          disabled={loading}
          style={goldButton}
        >
          {loading ? text.valuating : text.valuate}
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          style={dangerButton}
        >
          {loading ? text.deleting : text.delete}
        </button>
      </div>

      {open && (
        <div
          style={{
            width: 380,
            maxWidth: "100%",
            background: theme.colors.surfaceAlt,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.radius.lg,
            padding: 12,
            boxShadow: theme.shadow.soft,
            display: "grid",
            gap: 10
          }}
        >
          <ActionField label={text.quantity}>
            <input
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              type="number"
              min="1"
              style={inputStyle}
            />
          </ActionField>

          <ActionField label={text.price}>
            <input
              value={estimatedPrice}
              onChange={(e) => setEstimatedPrice(e.target.value)}
              type="number"
              min="0"
              step="0.01"
              style={inputStyle}
            />
          </ActionField>

          <ActionField label={text.condition}>
            <input
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder={text.placeholderCondition}
              style={inputStyle}
            />
          </ActionField>

          <ActionField label={text.platform}>
            <input
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              placeholder={text.placeholderPlatform}
              style={inputStyle}
            />
          </ActionField>

          <ActionField label={text.completeness}>
            <input
              value={completeness}
              onChange={(e) => setCompleteness(e.target.value)}
              placeholder={text.placeholderCompleteness}
              style={inputStyle}
            />
          </ActionField>

          <ActionField label={text.region}>
            <input
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder={text.placeholderRegion}
              style={inputStyle}
            />
          </ActionField>

          <ActionField label={text.notes}>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={text.placeholderNotes}
              style={{
                ...inputStyle,
                minHeight: 88,
                resize: "vertical"
              }}
            />
          </ActionField>

          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
              marginTop: 4
            }}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={secondaryButton}
            >
              {text.cancel}
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              style={primaryButton}
            >
              {loading ? text.saving : text.save}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionField({
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
  borderRadius: 10,
  border: `1px solid ${theme.colors.border}`,
  background: theme.colors.surface,
  color: theme.colors.text,
  fontSize: 14,
  outline: "none"
};

const chipButton: React.CSSProperties = {
  border: `1px solid ${theme.colors.border}`,
  background: theme.colors.surface,
  color: theme.colors.text,
  borderRadius: 999,
  padding: "6px 10px",
  fontWeight: 800,
  cursor: "pointer"
};

const goldButton: React.CSSProperties = {
  border: "none",
  background: theme.colors.gold,
  color: theme.colors.black,
  borderRadius: 999,
  padding: "6px 10px",
  fontWeight: 900,
  cursor: "pointer"
};

const dangerButton: React.CSSProperties = {
  border: "none",
  background: "#FEF3F2",
  color: theme.colors.danger,
  borderRadius: 999,
  padding: "6px 10px",
  fontWeight: 900,
  cursor: "pointer"
};

const secondaryButton: React.CSSProperties = {
  border: `1px solid ${theme.colors.border}`,
  background: theme.colors.surface,
  color: theme.colors.text,
  borderRadius: 999,
  padding: "8px 12px",
  fontWeight: 800,
  cursor: "pointer"
};

const primaryButton: React.CSSProperties = {
  border: "none",
  background: theme.colors.black,
  color: "white",
  borderRadius: 999,
  padding: "8px 12px",
  fontWeight: 800,
  cursor: "pointer"
};