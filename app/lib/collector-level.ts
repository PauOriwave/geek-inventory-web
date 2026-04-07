export function getCollectorLevelData(input: {
  totalItems: number;
  unlockedAchievements: number;
  locale?: "en" | "es";
}) {
  const locale = input.locale ?? "en";
  const score = input.totalItems + input.unlockedAchievements * 5;

  const levels = [
    { level: 1, minScore: 0, titleEn: "Vault Newcomer", titleEs: "Recién llegado al vault" },
    { level: 2, minScore: 10, titleEn: "Piece Hunter", titleEs: "Cazador de piezas" },
    { level: 3, minScore: 20, titleEn: "Shelf Builder", titleEs: "Constructor de estanterías" },
    { level: 4, minScore: 35, titleEn: "Archive Seeker", titleEs: "Buscador de archivo" },
    { level: 5, minScore: 50, titleEn: "Curated Collector", titleEs: "Coleccionista curado" },
    { level: 6, minScore: 70, titleEn: "Vault Explorer", titleEs: "Explorador del vault" },
    { level: 7, minScore: 95, titleEn: "Collection Strategist", titleEs: "Estratega de colección" },
    { level: 8, minScore: 125, titleEn: "Legacy Keeper", titleEs: "Guardián del legado" },
    { level: 9, minScore: 160, titleEn: "Master Curator", titleEs: "Curador maestro" },
    { level: 10, minScore: 220, titleEn: "Vault Legend", titleEs: "Leyenda del vault" }
  ];

  const current =
    [...levels].reverse().find((entry) => score >= entry.minScore) ?? levels[0];

  const next = levels.find((entry) => entry.level === current.level + 1) ?? null;

  return {
    level: current.level,
    score,
    currentTitle: locale === "es" ? current.titleEs : current.titleEn,
    nextLevel: next?.level ?? null,
    nextMinScore: next?.minScore ?? null,
    pointsToNext: next ? Math.max(0, next.minScore - score) : 0
  };
}