export type ThemeId =
  | "vault"
  | "fantasy"
  | "cyberpunk"
  | "ember-dragon";

export type AppTheme = {
  id: ThemeId;
  label: string;
  description: string;
  premium: boolean;
  loyaltyMonthsRequired: number;
  colors: {
    bg: string;
    surface: string;
    surfaceAlt: string;
    text: string;
    textMuted: string;
    border: string;
    black: string;
    gold: string;
    link: string;
    danger: string;
    success: string;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  shadow: {
    soft: string;
    card: string;
  };
};

const themes: Record<ThemeId, AppTheme> = {
  vault: {
    id: "vault",
    label: "Vault",
    description: "Classic premium collector look",
    premium: false,
    loyaltyMonthsRequired: 0,
    colors: {
      bg: "#F5F3EE",
      surface: "#FFFFFF",
      surfaceAlt: "#FAF8F3",
      text: "#171717",
      textMuted: "#6B7280",
      border: "#E7E2D8",
      black: "#171717",
      gold: "#C8A44D",
      link: "#8B6A20",
      danger: "#B42318",
      success: "#027A48"
    },
    radius: {
      sm: 10,
      md: 14,
      lg: 18,
      xl: 24
    },
    shadow: {
      soft: "0 6px 18px rgba(23, 23, 23, 0.05)",
      card: "0 10px 30px rgba(23, 23, 23, 0.08)"
    }
  },

  fantasy: {
    id: "fantasy",
    label: "Fantasy",
    description: "Arcane collector vault",
    premium: true,
    loyaltyMonthsRequired: 3,
    colors: {
      bg: "#F4EFE8",
      surface: "#FFFDF8",
      surfaceAlt: "#F8F1E5",
      text: "#231815",
      textMuted: "#7A6A5A",
      border: "#E7D8C6",
      black: "#231815",
      gold: "#B88A3B",
      link: "#8A5E1A",
      danger: "#A63D2F",
      success: "#2D7A4A"
    },
    radius: {
      sm: 10,
      md: 14,
      lg: 18,
      xl: 24
    },
    shadow: {
      soft: "0 6px 18px rgba(56, 33, 15, 0.06)",
      card: "0 10px 30px rgba(56, 33, 15, 0.10)"
    }
  },

  cyberpunk: {
    id: "cyberpunk",
    label: "Cyberpunk",
    description: "Neon market lab",
    premium: true,
    loyaltyMonthsRequired: 6,
    colors: {
      bg: "#0D1117",
      surface: "#111827",
      surfaceAlt: "#161F2D",
      text: "#F3F4F6",
      textMuted: "#9CA3AF",
      border: "#263041",
      black: "#05070A",
      gold: "#EAB308",
      link: "#67E8F9",
      danger: "#FB7185",
      success: "#34D399"
    },
    radius: {
      sm: 10,
      md: 14,
      lg: 18,
      xl: 24
    },
    shadow: {
      soft: "0 6px 18px rgba(0, 0, 0, 0.24)",
      card: "0 10px 30px rgba(0, 0, 0, 0.35)"
    }
  },

  "ember-dragon": {
    id: "ember-dragon",
    label: "Ember Dragon",
    description: "Legendary long-term supporter theme",
    premium: true,
    loyaltyMonthsRequired: 12,
    colors: {
      bg: "#140D0B",
      surface: "#1B1210",
      surfaceAlt: "#241815",
      text: "#F8F3EE",
      textMuted: "#C2A89A",
      border: "#3C2721",
      black: "#0E0908",
      gold: "#D4AF37",
      link: "#F59E0B",
      danger: "#F87171",
      success: "#4ADE80"
    },
    radius: {
      sm: 10,
      md: 14,
      lg: 18,
      xl: 24
    },
    shadow: {
      soft: "0 6px 18px rgba(0, 0, 0, 0.25)",
      card: "0 10px 30px rgba(0, 0, 0, 0.4)"
    }
  }
};

export const defaultThemeId: ThemeId = "vault";

export function getTheme(themeId?: string): AppTheme {
  if (!themeId) {
    return themes[defaultThemeId];
  }

  return themes[themeId as ThemeId] ?? themes[defaultThemeId];
}

export const theme = getTheme();

export const availableThemes = Object.values(themes);