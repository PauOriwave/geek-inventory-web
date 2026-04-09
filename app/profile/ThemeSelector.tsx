"use client";

import { useRouter } from "next/navigation";
import {
  availableThemes,
  AppThemeId,
  getThemeById,
  getPremiumMonths,
  canUseTheme
} from "../theme";

export default function ThemeSelector({
  currentThemeId,
  plan = "free",
  premiumStartedAt = null,
  locale = "en"
}: {
  currentThemeId: AppThemeId;
  plan?: string;
  premiumStartedAt?: string | null;
  locale?: "en" | "es";
}) {
  const router = useRouter();
  const currentTheme = getThemeById(currentThemeId);
  const premiumMonths = getPremiumMonths(premiumStartedAt);

  const text = {
    title: locale === "es" ? "Selecciona tu tema" : "Choose your theme",
    active: locale === "es" ? "Activo" : "Active",
    apply: locale === "es" ? "Aplicar" : "Apply",
    included: locale === "es" ? "Incluido" : "Included",
    premium: locale === "es" ? "Premium" : "Premium",
    locked: locale === "es" ? "Bloqueado" : "Locked",
    premiumRequired:
      locale === "es" ? "Requiere Premium" : "Premium required",
    loyalty:
      locale === "es" ? "fidelidad" : "loyalty",
    unlockNow:
      locale === "es" ? "Disponible ahora" : "Available now",
    unlockIn:
      locale === "es" ? "Desbloquea en" : "Unlocks in",
    months:
      locale === "es" ? "meses" : "months",
    yourPremiumTime:
      locale === "es" ? "Tu antigüedad premium" : "Your premium time",
    currentMonths:
      locale === "es" ? "meses premium" : "premium months"
  };

  function applyTheme(themeId: AppThemeId) {
    const allowed = canUseTheme({
      themeId,
      plan,
      premiumStartedAt
    });

    if (!allowed) {
      return;
    }

    document.cookie = `ui_theme=${themeId}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 12
        }}
      >
        <div
          style={{
            fontWeight: 800,
            fontSize: 14,
            color: currentTheme.colors.text
          }}
        >
          {text.title}
        </div>

        <div
          style={{
            fontSize: 12,
            color: currentTheme.colors.textMuted,
            padding: "6px 10px",
            borderRadius: 999,
            background: currentTheme.colors.surfaceAlt,
            border: `1px solid ${currentTheme.colors.border}`
          }}
        >
          {text.yourPremiumTime}: {premiumMonths} {text.currentMonths}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12
        }}
      >
        {availableThemes.map((item) => {
          const isActive = item.id === currentThemeId;
          const allowed = canUseTheme({
            themeId: item.id,
            plan,
            premiumStartedAt
          });

          const monthsMissing = Math.max(
            0,
            item.loyaltyMonthsRequired - premiumMonths
          );

          return (
            <div
              key={item.id}
              style={{
                border: `1px solid ${currentTheme.colors.border}`,
                borderRadius: currentTheme.radius.lg,
                padding: 14,
                background: currentTheme.colors.surfaceAlt,
                opacity: allowed ? 1 : 0.88
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  alignItems: "center"
                }}
              >
                <div
                  style={{
                    fontWeight: 800,
                    color: currentTheme.colors.text
                  }}
                >
                  {item.label}
                </div>

                <span
                  style={{
                    fontSize: 11,
                    borderRadius: 999,
                    padding: "4px 8px",
                    background: isActive
                      ? currentTheme.colors.gold
                      : currentTheme.colors.surface,
                    color: isActive
                      ? currentTheme.colors.black
                      : currentTheme.colors.textMuted,
                    border: `1px solid ${currentTheme.colors.border}`,
                    fontWeight: 800
                  }}
                >
                  {isActive
                    ? text.active
                    : !item.premium
                      ? text.included
                      : allowed
                        ? text.premium
                        : text.locked}
                </span>
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 13,
                  color: currentTheme.colors.textMuted,
                  minHeight: 38
                }}
              >
                {item.description}
              </div>

              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  gap: 6
                }}
              >
                <Swatch color={item.colors.bg} />
                <Swatch color={item.colors.surface} />
                <Swatch color={item.colors.gold} />
                <Swatch color={item.colors.black} />
              </div>

              <div
                style={{
                  marginTop: 12,
                  fontSize: 12,
                  color: currentTheme.colors.textMuted,
                  lineHeight: 1.6
                }}
              >
                {!item.premium ? (
                  text.included
                ) : plan !== "premium" ? (
                  text.premiumRequired
                ) : allowed ? (
                  `${text.unlockNow} · ${item.loyaltyMonthsRequired}m ${text.loyalty}`
                ) : (
                  `${text.unlockIn} ${monthsMissing} ${text.months} · ${item.loyaltyMonthsRequired}m ${text.loyalty}`
                )}
              </div>

              <button
                type="button"
                onClick={() => applyTheme(item.id)}
                disabled={!allowed}
                style={{
                  marginTop: 12,
                  width: "100%",
                  border: "none",
                  borderRadius: 999,
                  padding: "10px 12px",
                  background: isActive
                    ? currentTheme.colors.surface
                    : allowed
                      ? currentTheme.colors.black
                      : "#9CA3AF",
                  color: isActive
                    ? currentTheme.colors.text
                    : "white",
                  fontWeight: 800,
                  cursor: allowed ? "pointer" : "not-allowed"
                }}
              >
                {allowed ? text.apply : text.locked}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Swatch({ color }: { color: string }) {
  return (
    <span
      style={{
        width: 18,
        height: 18,
        borderRadius: 999,
        display: "inline-block",
        background: color,
        border: "1px solid rgba(0,0,0,0.08)"
      }}
    />
  );
}