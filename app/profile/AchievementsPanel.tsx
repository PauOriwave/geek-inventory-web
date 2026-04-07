import { cookies } from "next/headers";
import { AppThemeId, getThemeById } from "../theme";

type Achievement = {
  id: string;
  unlocked: boolean;
  progress: number;
  target: number;
  icon: string;
};

const API = process.env.NEXT_PUBLIC_API_URL!;

async function getAchievements(cookieHeader: string): Promise<Achievement[]> {
  const res = await fetch(`${API}/achievements`, {
    cache: "no-store",
    headers: {
      cookie: cookieHeader
    }
  });

  if (!res.ok) {
    throw new Error("Failed to fetch achievements");
  }

  return res.json();
}

export default async function AchievementsPanel({
  locale = "en"
}: {
  locale?: "en" | "es";
}) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const themeId =
    (cookieStore.get("ui_theme")?.value as AppThemeId | undefined) ?? "classic";
  const currentTheme = getThemeById(themeId);

  const achievements = await getAchievements(cookieHeader);

  const text = {
    title: locale === "es" ? "Logros" : "Achievements",
    subtitle:
      locale === "es"
        ? "Tu progreso como coleccionista, desbloqueado a partir de tus datos reales."
        : "Your collector progress, unlocked from your real collection data.",
    unlocked: locale === "es" ? "Desbloqueado" : "Unlocked",
    locked: locale === "es" ? "Bloqueado" : "Locked",
    progress: locale === "es" ? "Progreso" : "Progress",
    latestUnlocked:
      locale === "es" ? "Último logro desbloqueado" : "Latest unlocked achievement",
    latestUnlockedHint:
      locale === "es"
        ? "Estimado según tu progresión actual"
        : "Estimated from your current progression",
    noUnlockedYet:
      locale === "es"
        ? "Todavía no has desbloqueado logros."
        : "You have not unlocked any achievements yet."
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const latestUnlocked = getLatestUnlockedAchievement(achievements);

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
      <div style={{ marginBottom: 14 }}>
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

        <div
          style={{
            marginTop: 10,
            display: "inline-block",
            padding: "6px 10px",
            borderRadius: 999,
            background: currentTheme.colors.surfaceAlt,
            border: `1px solid ${currentTheme.colors.border}`,
            fontSize: 12,
            fontWeight: 800,
            color: currentTheme.colors.text
          }}
        >
          {unlockedCount} / {achievements.length} {text.unlocked.toLowerCase()}
        </div>
      </div>

      <div
        style={{
          marginBottom: 16,
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
          {text.latestUnlocked}
        </div>

        {latestUnlocked ? (
          <LatestUnlockedCard
            achievement={latestUnlocked}
            locale={locale}
            currentTheme={currentTheme}
            hint={text.latestUnlockedHint}
            unlockedLabel={text.unlocked}
          />
        ) : (
          <div
            style={{
              color: currentTheme.colors.textMuted,
              fontSize: 14
            }}
          >
            {text.noUnlockedYet}
          </div>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 12
        }}
      >
        {achievements.map((achievement) => {
          const ratio =
            achievement.target > 0
              ? (achievement.progress / achievement.target) * 100
              : 0;

          const copy = getAchievementCopy(achievement.id, locale);

          return (
            <div
              key={achievement.id}
              style={{
                border: `1px solid ${currentTheme.colors.border}`,
                borderRadius: currentTheme.radius.lg,
                padding: 14,
                background: achievement.unlocked
                  ? currentTheme.colors.surfaceAlt
                  : currentTheme.colors.surface
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  alignItems: "flex-start"
                }}
              >
                <div style={{ display: "flex", gap: 10 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 999,
                      background: achievement.unlocked
                        ? currentTheme.colors.gold
                        : currentTheme.colors.surfaceAlt,
                      color: achievement.unlocked
                        ? currentTheme.colors.black
                        : currentTheme.colors.text,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      border: `1px solid ${currentTheme.colors.border}`
                    }}
                  >
                    {achievement.icon}
                  </div>

                  <div>
                    <div
                      style={{
                        fontWeight: 800,
                        color: currentTheme.colors.text
                      }}
                    >
                      {copy.title}
                    </div>

                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 13,
                        color: currentTheme.colors.textMuted,
                        lineHeight: 1.55
                      }}
                    >
                      {copy.description}
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    whiteSpace: "nowrap",
                    fontSize: 11,
                    fontWeight: 800,
                    borderRadius: 999,
                    padding: "4px 8px",
                    background: achievement.unlocked
                      ? currentTheme.colors.gold
                      : currentTheme.colors.surfaceAlt,
                    color: achievement.unlocked
                      ? currentTheme.colors.black
                      : currentTheme.colors.textMuted,
                    border: `1px solid ${currentTheme.colors.border}`
                  }}
                >
                  {achievement.unlocked ? text.unlocked : text.locked}
                </span>
              </div>

              <div style={{ marginTop: 12 }}>
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
                  <span>{text.progress}</span>
                  <span>
                    {achievement.progress} / {achievement.target}
                  </span>
                </div>

                <div
                  style={{
                    height: 8,
                    borderRadius: 999,
                    background: currentTheme.colors.surfaceAlt,
                    overflow: "hidden",
                    border: `1px solid ${currentTheme.colors.border}`
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(ratio, 100)}%`,
                      height: "100%",
                      background: achievement.unlocked
                        ? currentTheme.colors.gold
                        : currentTheme.colors.black
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function LatestUnlockedCard({
  achievement,
  locale,
  currentTheme,
  hint,
  unlockedLabel
}: {
  achievement: Achievement;
  locale: "en" | "es";
  currentTheme: ReturnType<typeof getThemeById>;
  hint: string;
  unlockedLabel: string;
}) {
  const copy = getAchievementCopy(achievement.id, locale);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 14,
        alignItems: "center",
        flexWrap: "wrap"
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 999,
            background: currentTheme.colors.gold,
            color: currentTheme.colors.black,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            fontWeight: 900,
            border: `1px solid ${currentTheme.colors.border}`
          }}
        >
          {achievement.icon}
        </div>

        <div>
          <div
            style={{
              fontWeight: 900,
              fontSize: 16,
              color: currentTheme.colors.text
            }}
          >
            {copy.title}
          </div>

          <div
            style={{
              marginTop: 4,
              fontSize: 13,
              color: currentTheme.colors.textMuted,
              lineHeight: 1.6
            }}
          >
            {copy.description}
          </div>

          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              color: currentTheme.colors.textMuted
            }}
          >
            {hint}
          </div>
        </div>
      </div>

      <span
        style={{
          whiteSpace: "nowrap",
          fontSize: 12,
          fontWeight: 900,
          borderRadius: 999,
          padding: "6px 10px",
          background: currentTheme.colors.black,
          color: "white"
        }}
      >
        {unlockedLabel}
      </span>
    </div>
  );
}

function getLatestUnlockedAchievement(achievements: Achievement[]) {
  const unlocked = achievements.filter((achievement) => achievement.unlocked);

  if (unlocked.length === 0) {
    return null;
  }

  const achievementOrder = [
    "first_piece",
    "valuation_rookie",
    "collector_initiate",
    "category_explorer",
    "retro_curator",
    "brick_starter",
    "board_tactician",
    "market_watcher",
    "shelf_builder",
    "vault_keeper"
  ];

  const orderMap = new Map(
    achievementOrder.map((id, index) => [id, index])
  );

  unlocked.sort((a, b) => {
    const aOrder = orderMap.get(a.id) ?? -1;
    const bOrder = orderMap.get(b.id) ?? -1;
    return bOrder - aOrder;
  });

  return unlocked[0];
}

function getAchievementCopy(id: string, locale: "en" | "es") {
  const copy: Record<
    string,
    {
      en: { title: string; description: string };
      es: { title: string; description: string };
    }
  > = {
    first_piece: {
      en: {
        title: "First Piece",
        description: "Add your first item to the vault."
      },
      es: {
        title: "Primera pieza",
        description: "Añade tu primer objeto al vault."
      }
    },
    collector_initiate: {
      en: {
        title: "Collector Initiate",
        description: "Reach 10 items in your collection."
      },
      es: {
        title: "Iniciado coleccionista",
        description: "Alcanza 10 objetos en tu colección."
      }
    },
    shelf_builder: {
      en: {
        title: "Shelf Builder",
        description: "Reach 25 items in your collection."
      },
      es: {
        title: "Constructor de estanterías",
        description: "Alcanza 25 objetos en tu colección."
      }
    },
    vault_keeper: {
      en: {
        title: "Vault Keeper",
        description: "Reach 50 items in your collection."
      },
      es: {
        title: "Guardián del vault",
        description: "Alcanza 50 objetos en tu colección."
      }
    },
    category_explorer: {
      en: {
        title: "Category Explorer",
        description: "Own items from 3 different categories."
      },
      es: {
        title: "Explorador de categorías",
        description: "Ten objetos de 3 categorías distintas."
      }
    },
    valuation_rookie: {
      en: {
        title: "Valuation Rookie",
        description: "Generate your first valuation snapshot."
      },
      es: {
        title: "Novato en valoraciones",
        description: "Genera tu primer snapshot de valoración."
      }
    },
    market_watcher: {
      en: {
        title: "Market Watcher",
        description: "Reach 10 valuation snapshots."
      },
      es: {
        title: "Vigilante del mercado",
        description: "Alcanza 10 snapshots de valoración."
      }
    },
    retro_curator: {
      en: {
        title: "Retro Curator",
        description: "Add 5 videogames to your vault."
      },
      es: {
        title: "Curador retro",
        description: "Añade 5 videojuegos a tu vault."
      }
    },
    brick_starter: {
      en: {
        title: "Brick Starter",
        description: "Add 3 LEGO items to your vault."
      },
      es: {
        title: "Inicio de ladrillos",
        description: "Añade 3 objetos LEGO a tu vault."
      }
    },
    board_tactician: {
      en: {
        title: "Board Tactician",
        description: "Add 3 board games to your vault."
      },
      es: {
        title: "Táctico de mesa",
        description: "Añade 3 juegos de mesa a tu vault."
      }
    }
  };

  return copy[id]?.[locale] ?? copy[id]?.en ?? { title: id, description: id };
}