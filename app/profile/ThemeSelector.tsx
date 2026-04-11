"use client";

import { useMemo, useState } from "react";
import { getUnlockedThemes } from "../lib/themes";

type ThemeId = "classic" | "dark" | "dragon" | "cyber" | "legendary";

type ThemeMeta = {
  id: ThemeId;
  name: {
    es: string;
    en: string;
  };
  description: {
    es: string;
    en: string;
  };
  requiredMonths: number;
  preview: {
    bg: string;
    surface: string;
    accent: string;
    text: string;
  };
};

const THEMES: ThemeMeta[] = [
  {
    id: "classic",
    name: {
      es: "Classic",
      en: "Classic"
    },
    description: {
      es: "La base limpia y elegante de DrakoryVault.",
      en: "The clean and elegant DrakoryVault base."
    },
    requiredMonths: 0,
    preview: {
      bg: "#F8FAFC",
      surface: "#FFFFFF",
      accent: "#171717",
      text: "#111827"
    }
  },
  {
    id: "dark",
    name: {
      es: "Dark",
      en: "Dark"
    },
    description: {
      es: "Un tono más serio para sesiones largas.",
      en: "A more serious tone for long sessions."
    },
    requiredMonths: 1,
    preview: {
      bg: "#0F172A",
      surface: "#111827",
      accent: "#E5E7EB",
      text: "#F9FAFB"
    }
  },
  {
    id: "dragon",
    name: {
      es: "Dragon",
      en: "Dragon"
    },
    description: {
      es: "Una identidad más épica y coleccionista.",
      en: "A more epic collector identity."
    },
    requiredMonths: 3,
    preview: {
      bg: "#1F2937",
      surface: "#111827",
      accent: "#F59E0B",
      text: "#F9FAFB"
    }
  },
  {
    id: "cyber",
    name: {
      es: "Cyber",
      en: "Cyber"
    },
    description: {
      es: "Visual más avanzado para usuarios fieles.",
      en: "A more advanced visual style for loyal users."
    },
    requiredMonths: 6,
    preview: {
      bg: "#0B1020",
      surface: "#111827",
      accent: "#22D3EE",
      text: "#E0F2FE"
    }
  },
  {
    id: "legendary",
    name: {
      es: "Legendary",
      en: "Legendary"
    },
    description: {
      es: "La recompensa visual para los usuarios top.",
      en: "The visual reward for top users."
    },
    requiredMonths: 12,
    preview: {
      bg: "#1C1917",
      surface: "#292524",
      accent: "#FBBF24",
      text: "#FEF3C7"
    }
  }
];

export default function ThemeSelector({
  currentThemeId,
  plan,
  premiumStartedAt,
  locale = "en"
}: {
  currentThemeId: string;
  plan: string;
  premiumStartedAt?: string | null;
  locale?: "en" | "es";
}) {
  const [pendingTheme, setPendingTheme] = useState<string | null>(null);

  const unlockedThemes = useMemo(() => {
    if (plan === "free") {
      return ["classic"];
    }

    return getUnlockedThemes(premiumStartedAt);
  }, [plan, premiumStartedAt]);

  const text = {
    current: locale === "es" ? "Actual" : "Current",
    active: locale === "es" ? "Usando ahora" : "Currently active",
    locked: locale === "es" ? "Bloqueado" : "Locked",
    unlockAt:
      locale === "es" ? "Se desbloquea en" : "Unlocks at",
    month: locale === "es" ? "mes" : "month",
    months: locale === "es" ? "meses" : "months",
    availableNow:
      locale === "es" ? "Disponible ahora" : "Available now",
    starterOnly:
      locale === "es"
        ? "El plan Starter solo puede usar Classic."
        : "Starter plan can only use Classic.",
    loyaltyHint:
      locale === "es"
        ? "Los themes loyalty se desbloquean según tu antigüedad premium."
        : "Loyalty themes unlock based on your premium age."
  };

  function applyTheme(themeId: string) {
    try {
      setPendingTheme(themeId);
      document.cookie = `ui_theme=${encodeURIComponent(themeId)}; path=/; max-age=31536000`;
      window.location.reload();
    } catch {
      setPendingTheme(null);
    }
  }

  return (
    <div>
      <div
        style={{
          marginBottom: 14,
          fontSize: 13,
          color: "#6B7280",
          lineHeight: 1.6
        }}
      >
        {plan === "free" ? text.starterOnly : text.loyaltyHint}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12
        }}
      >
        {THEMES.map((theme) => {
          const unlocked = unlockedThemes.includes(theme.id);
          const active = currentThemeId === theme.id;
          const monthsLabel =
            theme.requiredMonths === 1 ? text.month : text.months;

          return (
            <button
              key={theme.id}
              type="button"
              disabled={!unlocked || pendingTheme !== null}
              onClick={() => applyTheme(theme.id)}
              style={{
                textAlign: "left",
                border: active
                  ? "2px solid #111827"
                  : unlocked
                    ? "1px solid #E5E7EB"
                    : "1px solid #E5E7EB",
                borderRadius: 18,
                padding: 14,
                background: unlocked ? "#FFFFFF" : "#F9FAFB",
                cursor:
                  unlocked && pendingTheme === null ? "pointer" : "not-allowed",
                opacity: unlocked ? 1 : 0.72,
                boxShadow: active
                  ? "0 10px 30px rgba(15,23,42,0.12)"
                  : "0 8px 20px rgba(15,23,42,0.06)"
              }}
            >
              <div
                style={{
                  height: 86,
                  borderRadius: 14,
                  padding: 10,
                  background: theme.preview.bg,
                  border: "1px solid rgba(0,0,0,0.08)",
                  marginBottom: 12,
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                <div
                  style={{
                    width: "72%",
                    height: 16,
                    borderRadius: 999,
                    background: theme.preview.accent,
                    marginBottom: 8
                  }}
                />
                <div
                  style={{
                    width: "100%",
                    height: 42,
                    borderRadius: 12,
                    background: theme.preview.surface,
                    border: "1px solid rgba(255,255,255,0.08)"
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    right: 10,
                    top: 10,
                    fontSize: 11,
                    fontWeight: 900,
                    color: theme.preview.text,
                    background: "rgba(255,255,255,0.12)",
                    padding: "4px 8px",
                    borderRadius: 999,
                    backdropFilter: "blur(4px)"
                  }}
                >
                  {theme.name[locale]}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  alignItems: "center",
                  marginBottom: 6
                }}
              >
                <div
                  style={{
                    fontWeight: 900,
                    fontSize: 15,
                    color: "#111827"
                  }}
                >
                  {theme.name[locale]}
                </div>

                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    borderRadius: 999,
                    padding: "4px 8px",
                    background: active
                      ? "#111827"
                      : unlocked
                        ? "#F3F4F6"
                        : "#E5E7EB",
                    color: active ? "#FFFFFF" : unlocked ? "#111827" : "#6B7280",
                    whiteSpace: "nowrap"
                  }}
                >
                  {active
                    ? text.active
                    : unlocked
                      ? text.availableNow
                      : text.locked}
                </span>
              </div>

              <div
                style={{
                  fontSize: 13,
                  color: "#6B7280",
                  lineHeight: 1.55,
                  marginBottom: 10,
                  minHeight: 40
                }}
              >
                {theme.description[locale]}
              </div>

              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: unlocked ? "#374151" : "#9CA3AF"
                }}
              >
                {theme.requiredMonths === 0
                  ? text.availableNow
                  : `${text.unlockAt} ${theme.requiredMonths} ${monthsLabel}`}
              </div>

              {active && (
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#111827"
                  }}
                >
                  {text.current}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}