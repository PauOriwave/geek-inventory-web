import { cookies } from "next/headers";
import { AppThemeId, getThemeById } from "../theme";

type Achievement = {
  id: string;
  title: string;
  description: string;
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
    progress: locale === "es" ? "Progreso" : "Progress"
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

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
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 12
        }}
      >
        {achievements.map((achievement) => {
          const ratio = achievement.target > 0
            ? (achievement.progress / achievement.target) * 100
            : 0;

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
                      {achievement.title}
                    </div>

                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 13,
                        color: currentTheme.colors.textMuted,
                        lineHeight: 1.55
                      }}
                    >
                      {achievement.description}
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