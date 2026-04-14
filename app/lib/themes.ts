import {
  AppThemeId,
  availableThemes,
  canUseTheme,
  getPremiumMonths
} from "../theme";

export type ThemeUnlock = {
  id: AppThemeId;
  requiredMonths: number;
};

export const THEMES: ThemeUnlock[] = availableThemes.map((theme) => ({
  id: theme.id,
  requiredMonths:
    theme.access.kind === "loyalty" ? theme.access.monthsRequired : 0
}));

export function getUnlockedThemes(
  premiumSince?: string | null,
  plan?: string | null
): AppThemeId[] {
  return availableThemes
    .filter((theme) =>
      canUseTheme({
        themeId: theme.id,
        plan: plan ?? "free",
        premiumStartedAt: premiumSince ?? null
      })
    )
    .map((theme) => theme.id);
}

export function getNextLockedTheme(
  premiumSince?: string | null,
  plan?: string | null
) {
  const unlocked = new Set(getUnlockedThemes(premiumSince, plan));

  return (
    availableThemes.find((theme) => !unlocked.has(theme.id)) ?? null
  );
}

export function getThemeProgress(
  themeId: AppThemeId,
  premiumSince?: string | null,
  plan?: string | null
) {
  const theme = availableThemes.find((item) => item.id === themeId);

  if (!theme) {
    return {
      unlocked: false,
      progress: 0,
      target: 0
    };
  }

  const allowed = canUseTheme({
    themeId,
    plan: plan ?? "free",
    premiumStartedAt: premiumSince ?? null
  });

  if (theme.access.kind !== "loyalty") {
    return {
      unlocked: allowed,
      progress: allowed ? 1 : 0,
      target: 1
    };
  }

  const months = getPremiumMonths(premiumSince);
  const target = theme.access.monthsRequired;

  return {
    unlocked: allowed,
    progress: Math.min(months, target),
    target
  };
}