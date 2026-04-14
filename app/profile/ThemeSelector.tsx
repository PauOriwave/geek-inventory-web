"use client";

import { useMemo, useState } from "react";
import {
  AppThemeId,
  availableThemes,
  canUseTheme,
  getPremiumMonths
} from "../theme";

export default function ThemeSelector({
  currentThemeId,
  plan,
  premiumStartedAt,
  locale
}: {
  currentThemeId: AppThemeId;
  plan?: string;
  premiumStartedAt?: string | null;
  locale: "en" | "es";
}) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const premiumMonths = getPremiumMonths(premiumStartedAt);

  const text = {
    title: locale === "es" ? "Selecciona tu theme" : "Choose your theme",
    active: locale === "es" ? "Activa" : "Active",
    apply: locale === "es" ? "Aplicar" : "Apply",
    applying: locale === "es" ? "Aplicando..." : "Applying...",
    saved:
      locale === "es"
        ? "Theme aplicada correctamente."
        : "Theme applied successfully.",
    locked: locale === "es" ? "Bloqueada" : "Locked",
    free: locale === "es" ? "Gratis" : "Free",
    premium: locale === "es" ? "Premium" : "Premium",
    marketPro: "Market Pro",
    annual: locale === "es" ? "Anual" : "Annual",
    availableNow:
      locale === "es" ? "Disponible ahora" : "Available now",
    needPremium:
      locale === "es"
        ? "Requiere plan de pago."
        : "Requires a paid plan.",
    needMarketPro:
      locale === "es"
        ? "Requiere Market Pro."
        : "Requires Market Pro.",
    needAnnual:
      locale === "es"
        ? "Reservada para pack anual."
        : "Reserved for annual bundle.",
    loyaltyMonths:
      locale === "es"
        ? "Meses de fidelidad"
        : "Loyalty months",
    loyaltyLocked:
      locale === "es"
        ? "Se desbloquea por antigüedad."
        : "Unlocks with loyalty.",
    genericError:
      locale === "es"
        ? "No se pudo aplicar la theme."
        : "Could not apply theme."
  };

  const items = useMemo(() => {
    return availableThemes.map((theme) => {
      const allowed = canUseTheme({
        themeId: theme.id,
        plan,
        premiumStartedAt
      });

      let accessLabel = text.free;
      let accessHint = text.availableNow;

      switch (theme.access.kind) {
        case "free":
          accessLabel = text.free;
          accessHint = text.availableNow;
          break;

        case "premium":
          accessLabel = text.premium;
          accessHint = allowed ? text.availableNow : text.needPremium;
          break;

        case "market_pro":
          accessLabel = text.marketPro;
          accessHint = allowed ? text.availableNow : text.needMarketPro;
          break;

        case "annual_bundle":
          accessLabel = text.annual;
          accessHint = text.needAnnual;
          break;

        case "loyalty":
          accessLabel = `${text.loyaltyMonths}: ${theme.access.monthsRequired}`;
          accessHint = allowed
            ? text.availableNow
            : `${text.loyaltyLocked} ${premiumMonths}/${theme.access.monthsRequired}`;
          break;
      }

      return {
        ...theme,
        allowed,
        active: currentThemeId === theme.id,
        accessLabel,
        accessHint
      };
    });
  }, [currentThemeId, plan, premiumMonths, premiumStartedAt, text]);

  async function handleApply(themeId: AppThemeId) {
    const selectedTheme = availableThemes.find((theme) => theme.id === themeId);

    if (!selectedTheme) {
      setMessage(text.genericError);
      return;
    }

    const allowed = canUseTheme({
      themeId,
      plan,
      premiumStartedAt
    });

    if (!allowed) {
      switch (selectedTheme.access.kind) {
        case "premium":
          setMessage(text.needPremium);
          return;
        case "market_pro":
          setMessage(text.needMarketPro);
          return;
        case "annual_bundle":
          setMessage(text.needAnnual);
          return;
        case "loyalty":
          setMessage(
            `${text.loyaltyLocked} ${premiumMonths}/${selectedTheme.access.monthsRequired}`
          );
          return;
        default:
          setMessage(text.genericError);
          return;
      }
    }

    try {
      setSaving(true);
      setMessage(null);

      document.cookie = `ui_theme=${encodeURIComponent(
        themeId
      )}; path=/; max-age=31536000; samesite=lax`;

      setMessage(text.saved);
      window.location.reload();
    } catch {
      setMessage(text.genericError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <div
        style={{
          fontSize: 14,
          fontWeight: 800,
          marginBottom: 12
        }}
      >
        {text.title}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12
        }}
      >
        {items.map((item) => (
          <article
            key={item.id}
            style={{
              border: `1px solid ${item.colors.border}`,
              borderRadius: item.radius.lg,
              background: item.colors.surface,
              boxShadow: item.shadow.soft,
              overflow: "hidden"
            }}
          >
            <div
              style={{
                height: 72,
                background: `linear-gradient(135deg, ${item.colors.bg} 0%, ${item.colors.surfaceAlt} 100%)`,
                borderBottom: `1px solid ${item.colors.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 14px"
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 900,
                    color: item.colors.text
                  }}
                >
                  {item.label}
                </div>

                <div
                  style={{
                    marginTop: 4,
                    fontSize: 12,
                    color: item.colors.textMuted
                  }}
                >
                  {item.accessLabel}
                </div>
              </div>

              {item.active && (
                <span
                  style={{
                    padding: "4px 8px",
                    borderRadius: 999,
                    background: item.colors.gold,
                    color: item.colors.black,
                    fontSize: 11,
                    fontWeight: 900
                  }}
                >
                  {text.active}
                </span>
              )}
            </div>

            <div
              style={{
                padding: 14,
                color: item.colors.text
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  lineHeight: 1.6,
                  minHeight: 42
                }}
              >
                {item.description}
              </div>

              <div
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  color: item.colors.textMuted,
                  lineHeight: 1.5,
                  minHeight: 36
                }}
              >
                {item.accessHint}
              </div>

              <button
                type="button"
                onClick={() => handleApply(item.id)}
                disabled={saving || item.active || !item.allowed}
                style={{
                  marginTop: 12,
                  width: "100%",
                  border: "none",
                  borderRadius: 999,
                  padding: "10px 14px",
                  background:
                    item.active || !item.allowed
                      ? item.colors.border
                      : item.colors.black,
                  color:
                    item.active || !item.allowed
                      ? item.colors.textMuted
                      : "white",
                  fontWeight: 900,
                  cursor:
                    item.active || !item.allowed || saving
                      ? "not-allowed"
                      : "pointer"
                }}
              >
                {saving && !item.active
                  ? text.applying
                  : item.active
                    ? text.active
                    : item.allowed
                      ? text.apply
                      : text.locked}
              </button>
            </div>
          </article>
        ))}
      </div>

      {message && (
        <div
          style={{
            marginTop: 14,
            fontSize: 13,
            color: "#6B7280",
            lineHeight: 1.6
          }}
        >
          {message}
        </div>
      )}
    </section>
  );
}