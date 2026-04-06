export type AppThemeId =
  | "classic"
  | "cyberpunk"
  | "fantasy"
  | "retro";

type ThemeColors = {
  bg: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  border: string;
  gold: string;
  black: string;
  success: string;
  danger: string;
  link: string;
};

type ThemeRadius = {
  sm: number;
  md: number;
  lg: number;
  xl: number;
};

type ThemeShadow = {
  soft: string;
  card: string;
};

export type AppTheme = {
  id: AppThemeId;
  label: string;
  description: string;
  premium: boolean;
  loyaltyMonthsRequired: number;
  colors: ThemeColors;
  radius: ThemeRadius;
  shadow: ThemeShadow;
};

const radius: ThemeRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24
};

const shadow: ThemeShadow = {
  soft: "0 8px 24px rgba(15,23,42,0.06)",
  card: "0 20px 40px rgba(15,23,42,0.10)"
};

export const availableThemes: AppTheme[] = [
  {
    id: "classic",
    label: "Classic",
    description: "La identidad base de DrakoryVault.",
    premium: false,
    loyaltyMonthsRequired: 0,
    colors: {
      bg: "#F5F3EE",
      surface: "#FFFFFF",
      surfaceAlt: "#F9FAFB",
      text: "#171717",
      textMuted: "#6B7280",
      border: "#E5E7EB",
      gold: "#C8A44D",
      black: "#171717",
      success: "#027A48",
      danger: "#B42318",
      link: "#8B6B26"
    },
    radius,
    shadow
  },
  {
    id: "cyberpunk",
    label: "Cyberpunk",
    description: "Neón oscuro, alto contraste y energía arcade.",
    premium: true,
    loyaltyMonthsRequired: 3,
    colors: {
      bg: "#0D0B1A",
      surface: "#161228",
      surfaceAlt: "#211B3A",
      text: "#F9FAFB",
      textMuted: "#A1A1AA",
      border: "#2E2750",
      gold: "#00E5FF",
      black: "#09090B",
      success: "#22C55E",
      danger: "#F43F5E",
      link: "#67E8F9"
    },
    radius,
    shadow: {
      soft: "0 8px 24px rgba(0,229,255,0.10)",
      card: "0 20px 40px rgba(0,0,0,0.35)"
    }
  },
  {
    id: "fantasy",
    label: "Fantasy",
    description: "Tonos cálidos, dorados y una estética más épica.",
    premium: true,
    loyaltyMonthsRequired: 6,
    colors: {
      bg: "#F4EFE6",
      surface: "#FFF8EE",
      surfaceAlt: "#F7EEDC",
      text: "#2A2118",
      textMuted: "#7A6857",
      border: "#E8D9BE",
      gold: "#B88746",
      black: "#2A2118",
      success: "#2F855A",
      danger: "#C05621",
      link: "#8B5E34"
    },
    radius,
    shadow: {
      soft: "0 8px 24px rgba(184,135,70,0.10)",
      card: "0 20px 40px rgba(90,62,28,0.12)"
    }
  },
  {
    id: "retro",
    label: "Retro CRT",
    description: "Inspirado en interfaces retro y vitrinas clásicas.",
    premium: true,
    loyaltyMonthsRequired: 9,
    colors: {
      bg: "#ECE8D9",
      surface: "#F8F3E3",
      surfaceAlt: "#EFE6C8",
      text: "#2B2B1F",
      textMuted: "#6D6A52",
      border: "#D5CBA7",
      gold: "#6AA84F",
      black: "#2B2B1F",
      success: "#3C8D40",
      danger: "#B85450",
      link: "#4A7C59"
    },
    radius,
    shadow: {
      soft: "0 8px 24px rgba(106,168,79,0.08)",
      card: "0 20px 40px rgba(60,80,40,0.10)"
    }
  }
];

export function getThemeById(id?: string | null): AppTheme {
  return availableThemes.find((item) => item.id === id) ?? availableThemes[0];
}

export const theme = getThemeById("classic");