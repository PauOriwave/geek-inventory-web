"use client";

import { useRouter } from "next/navigation";
import { availableThemes, AppThemeId, getThemeById } from "../theme";

export default function ThemeSelector({
  currentThemeId,
  locale = "en"
}: {
  currentThemeId: AppThemeId;
  locale?: "en" | "es";
}) {
  const router = useRouter();

  const text = {
    title: locale === "es" ? "Selecciona tu tema" : "Choose your theme",
    active: locale === "es" ? "Activo" : "Active",
    apply: locale === "es" ? "Aplicar" : "Apply",
    locked: locale === "es" ? "Bloqueado" : "Locked",
    loyalty: locale === "es" ? "fidelidad" : "loyalty",
    included: locale === "es" ? "incluido" : "included"
  };

  function applyTheme(themeId: AppThemeId) {
    document.cookie = `ui_theme=${themeId}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  const currentTheme = getThemeById(currentThemeId);

  return (
    <div>
      <div
        style={{
          fontWeight: 800,
          fontSize: 14,
          marginBottom: 12,
          color: currentTheme.colors.text
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
        {availableThemes.map((item) => {
          const isActive = item.id === currentThemeId;

          return (
            <div
              key={item.id}
              style={{
                border: `1px solid ${currentTheme.colors.border}`,
                borderRadius: currentTheme.radius.lg,
                padding: 14,
                background: currentTheme.colors.surfaceAlt
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
                  {isActive ? text.active : item.premium ? text.locked : text.included}
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
                  color: currentTheme.colors.textMuted
                }}
              >
                {item.premium
                  ? `${item.loyaltyMonthsRequired}m ${text.loyalty}`
                  : text.included}
              </div>

              <button
                type="button"
                onClick={() => applyTheme(item.id)}
                style={{
                  marginTop: 12,
                  width: "100%",
                  border: "none",
                  borderRadius: 999,
                  padding: "10px 12px",
                  background: isActive
                    ? currentTheme.colors.surface
                    : currentTheme.colors.black,
                  color: isActive
                    ? currentTheme.colors.text
                    : "white",
                  fontWeight: 800,
                  cursor: "pointer"
                }}
              >
                {text.apply}
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