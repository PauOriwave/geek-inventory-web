export type ThemeUnlock = {
  id: string;
  requiredMonths: number;
};

export const THEMES: ThemeUnlock[] = [
  { id: "classic", requiredMonths: 0 },
  { id: "dark", requiredMonths: 1 },
  { id: "dragon", requiredMonths: 3 },
  { id: "cyber", requiredMonths: 6 },
  { id: "legendary", requiredMonths: 12 }
];

export function getUnlockedThemes(premiumSince?: string | null) {
  if (!premiumSince) {
    return ["classic"];
  }

  const start = new Date(premiumSince);
  const now = new Date();

  const months =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());

  return THEMES
    .filter((t) => months >= t.requiredMonths)
    .map((t) => t.id);
}