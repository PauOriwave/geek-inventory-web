import { cookies } from "next/headers";
import { AppThemeId, getThemeById } from "../theme";

type Achievement = {
  id: string;
  unlocked: boolean;
  progress: number;
  target: number;
  icon: string;
};

type Summary = {
  totalItems: number;
  totalUnits: number;
  totalValue: number;
};

export default async function CollectorLevelPanel({
  locale = "en",
  achievements = [],
  summary
}: {
  locale?: "en" | "es";
  achievements?: Achievement[];
  summary: Summary;
}) {
  const cookieStore = await cookies();
  const themeId =
    (cookieStore.get("ui_theme")?.value as AppThemeId | undefined) ?? "classic";
  const currentTheme = getThemeById(themeId);

  const safeAchievements = Array.isArray(achievements) ? achievements : [];
  const unlockedAchievements = safeAchievements.filter((a) => a.unlocked).length;
  const score = summary.totalItems + unlockedAchievements * 5;

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

  const currentLevel =
    [...levels].reverse().find((entry) => score >= entry.minScore) ?? levels[0];

  const nextLevel = levels.find((entry) => entry.level === currentLevel.level + 1) ?? null;

  const currentTitle =
    locale === "es" ? currentLevel.titleEs : currentLevel.titleEn;

  const nextTitle =
    nextLevel
      ? locale === "es"
        ? nextLevel.titleEs
        : nextLevel.titleEn
      : null;

  const progressCurrentFloor = currentLevel.minScore;
  const progressNextCeil = nextLevel?.minScore ?? currentLevel.minScore;
  const span = Math.max(1, progressNextCeil - progressCurrentFloor);
  const progressInsideLevel = nextLevel
    ? Math.min(100, ((score - progressCurrentFloor) / span) * 100)
    : 100;

  const pointsToNext = nextLevel ? Math.max(0, nextLevel.minScore - score) : 0;

  const text = {
    title: locale === "es" ? "Nivel de coleccionista" : "Collector level",
    subtitle:
      locale === "es"
        ? "Calculado con tus objetos y logros desbloqueados."
        : "Calculated from your items and unlocked achievements.",
    level: locale === "es" ? "Nivel" : "Level",
    score: locale === "es" ? "Puntuación" : "Score",
    unlocked: locale === "es" ? "Logros" : "Achievements",
    items: locale === "es" ? "Objetos" : "Items",
    next: locale === "es" ? "Siguiente nivel" : "Next level",
    maxLevel:
      locale === "es"
        ? "Has alcanzado el nivel máximo actual."
        : "You have reached the current max level.",
    missingPoints:
      locale === "es" ? "Puntos restantes" : "Points remaining"
  };

  return (
    <section
      style={{
        background: currentTheme.colors.surface,
        border: `1px solid ${currentTheme.colors.border}`,
        borderRadius: currentTheme.radius.xl,
        padding: 18,
        boxShadow: currentTheme.shadow.card
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap"
        }}
      >
        <div>
          <div
            style={{
              fontWeight: 800,
              fontSize: 16,
              color: currentTheme.colors.text
            }}
          >
            {text.title}
          </div>

          <div
            style={{
              marginTop: 4,
              fontSize: 13,
              color: currentTheme.colors.textMuted
            }}
          >
            {text.subtitle}
          </div>
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            borderRadius: 999,
            background: currentTheme.colors.gold,
            color: currentTheme.colors.black,
            fontWeight: 900
          }}
        >
          {text.level} {currentLevel.level}
        </div>
      </div>

      <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "1.2fr 0.8fr",
          gap: 16
        }}
      >
        <div
          style={{
            border: `1px solid ${currentTheme.colors.border}`,
            borderRadius: currentTheme.radius.lg,
            padding: 16,
            background: currentTheme.colors.surfaceAlt
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 900,
              color: currentTheme.colors.text
            }}
          >
            {currentTitle}
          </div>

          <div
            style={{
              marginTop: 10,
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 10
            }}
          >
            <MiniStat
              label={text.score}
              value={String(score)}
              currentTheme={currentTheme}
            />
            <MiniStat
              label={text.items}
              value={String(summary.totalItems)}
              currentTheme={currentTheme}
            />
            <MiniStat
              label={text.unlocked}
              value={String(unlockedAchievements)}
              currentTheme={currentTheme}
            />
          </div>

          <div style={{ marginTop: 14 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                fontSize: 12,
                color: currentTheme.colors.textMuted,
                marginBottom: 6
              }}
            >
              <span>{currentTitle}</span>
              <span>{nextTitle ?? text.maxLevel}</span>
            </div>

            <div
              style={{
                height: 10,
                borderRadius: 999,
                background: currentTheme.colors.surface,
                overflow: "hidden",
                border: `1px solid ${currentTheme.colors.border}`
              }}
            >
              <div
                style={{
                  width: `${progressInsideLevel}%`,
                  height: "100%",
                  background: currentTheme.colors.gold
                }}
              />
            </div>
          </div>
        </div>

        <div
          style={{
            border: `1px solid ${currentTheme.colors.border}`,
            borderRadius: currentTheme.radius.lg,
            padding: 16,
            background: currentTheme.colors.surfaceAlt
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: currentTheme.colors.textMuted,
              marginBottom: 8
            }}
          >
            {text.next}
          </div>

          {nextLevel ? (
            <>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: currentTheme.colors.text
                }}
              >
                {nextTitle}
              </div>

              <div
                style={{
                  marginTop: 10,
                  fontSize: 13,
                  color: currentTheme.colors.textMuted,
                  lineHeight: 1.7
                }}
              >
                {text.missingPoints}: {pointsToNext}
              </div>
            </>
          ) : (
            <div
              style={{
                fontSize: 14,
                color: currentTheme.colors.textMuted,
                lineHeight: 1.7
              }}
            >
              {text.maxLevel}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function MiniStat({
  label,
  value,
  currentTheme
}: {
  label: string;
  value: string;
  currentTheme: ReturnType<typeof getThemeById>;
}) {
  return (
    <div
      style={{
        background: currentTheme.colors.surface,
        border: `1px solid ${currentTheme.colors.border}`,
        borderRadius: currentTheme.radius.md,
        padding: "12px 14px"
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: currentTheme.colors.textMuted,
          marginBottom: 6
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 20,
          fontWeight: 900,
          color: currentTheme.colors.text
        }}
      >
        {value}
      </div>
    </div>
  );
}