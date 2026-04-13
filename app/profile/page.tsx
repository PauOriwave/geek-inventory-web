import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale } from "../i18n";
import { getThemeById, AppThemeId } from "../theme";
import { getUnlockedThemes } from "../lib/themes";
import ThemeSelector from "./ThemeSelector";
import {
  formatLimit,
  formatPlanLabel,
  getItemLimitByPlan,
  getWishlistLimitByPlan,
  normalizePlan
} from "../lib/plans";

type Me = {
  id: string;
  email?: string;
  plan?: string;
  premiumStartedAt?: string | null;
  createdAt?: string;
};

type WishlistItem = {
  id: string;
};

type Item = {
  id: string;
};

type Achievement = {
  id: string;
  unlocked: boolean;
  progress: number;
  target: number;
  icon?: string;
};

const API = process.env.NEXT_PUBLIC_API_URL!;

async function getMe(cookie: string): Promise<Me | null> {
  try {
    const res = await fetch(`${API}/auth/me`, {
      cache: "no-store",
      headers: { cookie }
    });

    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getItems(cookie: string): Promise<Item[]> {
  try {
    const res = await fetch(`${API}/items?page=1&pageSize=200`, {
      cache: "no-store",
      headers: { cookie }
    });

    if (!res.ok) return [];

    const data = await res.json();
    return Array.isArray(data?.items) ? data.items : [];
  } catch {
    return [];
  }
}

async function getWishlist(cookie: string): Promise<WishlistItem[]> {
  try {
    const res = await fetch(`${API}/wishlist`, {
      cache: "no-store",
      headers: { cookie }
    });

    if (!res.ok) return [];

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function getAchievements(cookie: string): Promise<Achievement[]> {
  try {
    const res = await fetch(`${API}/achievements`, {
      cache: "no-store",
      headers: { cookie }
    });

    if (!res.ok) return [];

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function monthsSince(dateString?: string | null) {
  if (!dateString) return 0;

  const start = new Date(dateString);
  const now = new Date();

  const months =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());

  return Math.max(0, months);
}

function nextThemeMilestone(unlockedIds: string[]) {
  const order = [
    { id: "classic", months: 0 },
    { id: "dark", months: 1 },
    { id: "dragon", months: 3 },
    { id: "cyber", months: 6 },
    { id: "legendary", months: 12 }
  ];

  return order.find((theme) => !unlockedIds.includes(theme.id)) ?? null;
}

function prettifyAchievementId(id: string, locale: "en" | "es") {
  const labels: Record<string, { es: string; en: string }> = {
    first_item: { es: "Primer objeto", en: "First item" },
    ten_items: { es: "10 objetos", en: "10 items" },
    twenty_five_items: { es: "25 objetos", en: "25 items" },
    fifty_items: { es: "50 objetos", en: "50 items" },
    first_wishlist_item: { es: "Primer wish", en: "First wish" },
    ten_wishlist_items: { es: "10 wishes", en: "10 wishes" },
    first_valuation: { es: "Primera valoración", en: "First valuation" },
    collector_starter: { es: "Collector Starter", en: "Collector Starter" },
    collector_rising: { es: "Collector Rising", en: "Collector Rising" },
    collector_elite: { es: "Collector Elite", en: "Collector Elite" }
  };

  if (labels[id]) {
    return locale === "es" ? labels[id].es : labels[id].en;
  }

  return id
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function achievementDescription(
  achievement: Achievement,
  locale: "en" | "es"
) {
  if (achievement.unlocked) {
    return locale === "es"
      ? "Ya forma parte de tu progreso."
      : "Already part of your progress.";
  }

  return locale === "es"
    ? `Te faltan ${Math.max(0, achievement.target - achievement.progress)} para desbloquearlo.`
    : `${Math.max(0, achievement.target - achievement.progress)} left to unlock.`;
}

function getAchievementProgress(achievement: Achievement) {
  if (!achievement.target || achievement.target <= 0) return 0;
  return Math.max(
    0,
    Math.min(100, Math.round((achievement.progress / achievement.target) * 100))
  );
}

function getAchievementIcon(id: string, fallback?: string) {
  if (fallback) return fallback;

  if (id.includes("wishlist")) return "💫";
  if (id.includes("valuation")) return "📈";
  if (id.includes("item")) return "🏆";
  if (id.includes("collector")) return "🐉";
  return "✨";
}

export default async function ProfilePage({
  searchParams
}: {
  searchParams?:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
}) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const session = cookieStore.get("session")?.value;

  if (!session) {
    redirect("/login");
  }

  const sp =
    searchParams instanceof Promise ? await searchParams : searchParams ?? {};

  const locale = getLocale(sp);

  const themeId =
    (cookieStore.get("ui_theme")?.value as AppThemeId | undefined) ?? "classic";
  const theme = getThemeById(themeId);

  const [me, items, wishlist, achievements] = await Promise.all([
    getMe(cookieHeader),
    getItems(cookieHeader),
    getWishlist(cookieHeader),
    getAchievements(cookieHeader)
  ]);

  const plan = normalizePlan(me?.plan);
  const premiumStartedAt = me?.premiumStartedAt ?? null;
  const unlockedThemes = getUnlockedThemes(premiumStartedAt);
  const unlockedAchievements = achievements.filter((a) => a.unlocked);
  const unlockedAchievementsCount = unlockedAchievements.length;
  const premiumMonths = monthsSince(premiumStartedAt);
  const nextTheme = nextThemeMilestone(unlockedThemes);

  const itemCount = items.length;
  const wishlistCount = wishlist.length;

  const itemLimit = getItemLimitByPlan(plan);
  const wishlistLimit = getWishlistLimitByPlan(plan);

  const lastUnlocked =
    unlockedAchievements[unlockedAchievements.length - 1] ?? null;

  const langEnHref = `/profile?lang=en`;
  const langEsHref = `/profile?lang=es`;

  const text = {
    collection: locale === "es" ? "Colección" : "Collection",
    wishlist: "Wishlist",
    pricing: locale === "es" ? "Planes" : "Pricing",
    activeSection: locale === "es" ? "Perfil" : "Profile",

    title: locale === "es" ? "Tu perfil" : "Your profile",
    subtitle:
      locale === "es"
        ? "Tu identidad dentro de DrakoryVault: plan, progreso, themes y logros."
        : "Your identity inside DrakoryVault: plan, progress, themes and achievements.",

    currentPlan: locale === "es" ? "Tu plan actual" : "Your current plan",
    upgrade: locale === "es" ? "Mejorar plan" : "Upgrade plan",
    viewPlans: locale === "es" ? "Ver planes" : "View plans",

    collectorHint:
      locale === "es"
        ? "Collector desbloquea más espacio para colección, más wishlist y themes loyalty."
        : "Collector unlocks more collection space, more wishlist and loyalty themes.",

    marketHint:
      locale === "es"
        ? "Market Pro añade la capa más avanzada pensada para señales, alertas y funciones de mercado."
        : "Market Pro adds the most advanced layer built for signals, alerts and market features.",

    fullAccess:
      locale === "es"
        ? "Ya tienes acceso al nivel más alto disponible."
        : "You already have access to the highest available tier.",

    collectionUsage: locale === "es" ? "Colección" : "Collection",
    wishlistUsage: "Wishlist",
    unlockedAchievements:
      locale === "es" ? "Logros desbloqueados" : "Unlocked achievements",
    memberSince:
      locale === "es" ? "Miembro desde" : "Member since",

    usageHintFree:
      locale === "es"
        ? "Tu plan Starter está pensado para empezar. Cuando quieras profundidad y mejor control, toca subir."
        : "Your Starter plan is designed to get you started. Upgrade when you want more depth and control.",

    usageHintPaid:
      locale === "es"
        ? "Tu cuenta ya tiene acceso ampliado. La siguiente capa está enfocada a inteligencia de mercado."
        : "Your account already has expanded access. The next layer is focused on market intelligence.",

    loyaltyTitle:
      locale === "es" ? "Themes desbloqueables" : "Unlockable themes",
    loyaltyText:
      locale === "es"
        ? "Los themes premium se desbloquean con tu antigüedad. Cuanto más tiempo mantienes tu plan, más identidad visual ganas."
        : "Premium themes unlock with loyalty. The longer you stay subscribed, the more visual identity you earn.",

    unlockedThemes:
      locale === "es" ? "Themes desbloqueados" : "Unlocked themes",
    premiumMonths:
      locale === "es" ? "Meses premium" : "Premium months",
    nextUnlock:
      locale === "es" ? "Próximo desbloqueo" : "Next unlock",

    achievementsTitle:
      locale === "es" ? "Progreso y logros" : "Progress and achievements",
    achievementsSubtitle:
      locale === "es"
        ? "Haz que tu perfil evolucione añadiendo piezas, valorando tu colección y manteniendo tu fidelidad."
        : "Let your profile evolve by adding pieces, valuing your collection and keeping your loyalty.",
    lastUnlocked:
      locale === "es" ? "Último desbloqueado" : "Last unlocked",
    inProgress:
      locale === "es" ? "En progreso" : "In progress",
    unlocked:
      locale === "es" ? "Desbloqueado" : "Unlocked"
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: theme.colors.bg,
        color: theme.colors.text,
        padding: 24,
        fontFamily: "system-ui"
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 10
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 10px",
              borderRadius: 999,
              background: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`
            }}
          >
            <a
              href={langEnHref}
              style={{
                textDecoration: "none",
                fontWeight: 800,
                fontSize: 13,
                color:
                  locale === "en"
                    ? theme.colors.text
                    : theme.colors.textMuted
              }}
            >
              EN
            </a>

            <span style={{ color: theme.colors.textMuted }}>/</span>

            <a
              href={langEsHref}
              style={{
                textDecoration: "none",
                fontWeight: 800,
                fontSize: 13,
                color:
                  locale === "es"
                    ? theme.colors.text
                    : theme.colors.textMuted
              }}
            >
              ES
            </a>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 18,
            flexWrap: "wrap"
          }}
        >
          <a href={`/items?lang=${locale}`} style={navLink(theme)}>
            {text.collection}
          </a>

          <a href={`/wishlist?lang=${locale}`} style={navLink(theme)}>
            {text.wishlist}
          </a>

          <a href={`/pricing?lang=${locale}`} style={navLink(theme)}>
            {text.pricing}
          </a>

          <span
            style={{
              borderRadius: 999,
              padding: "10px 14px",
              background: theme.colors.black,
              color: "white",
              fontWeight: 800,
              border: `1px solid ${theme.colors.black}`
            }}
          >
            {text.activeSection}
          </span>
        </div>

        <section
          style={{
            background: theme.colors.black,
            color: "white",
            borderRadius: theme.radius.xl,
            padding: "20px 22px",
            marginBottom: 20,
            boxShadow: theme.shadow.card
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              alignItems: "center",
              flexWrap: "wrap"
            }}
          >
            <div style={{ maxWidth: 780 }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: 34,
                  lineHeight: 1.08,
                  fontWeight: 900
                }}
              >
                {text.title}
              </h1>

              <p
                style={{
                  marginTop: 10,
                  marginBottom: 0,
                  color: "rgba(255,255,255,0.78)",
                  lineHeight: 1.65,
                  fontSize: 15
                }}
              >
                {text.subtitle}
              </p>
            </div>

            <div
              style={{
                padding: "10px 14px",
                borderRadius: 999,
                background: theme.colors.gold,
                color: theme.colors.black,
                fontWeight: 900,
                fontSize: 13
              }}
            >
              {formatPlanLabel(plan, locale)}
            </div>
          </div>
        </section>

        <section
          style={{
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.radius.xl,
            padding: 18,
            background: theme.colors.surface,
            boxShadow: theme.shadow.card,
            marginBottom: 18
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "center"
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: theme.colors.textMuted
                }}
              >
                {text.currentPlan}
              </div>

              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  marginTop: 4
                }}
              >
                {formatPlanLabel(plan, locale)}
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 13,
                  color: theme.colors.textMuted,
                  maxWidth: 540,
                  lineHeight: 1.6
                }}
              >
                {plan === "free"
                  ? text.collectorHint
                  : plan === "premium"
                    ? text.marketHint
                    : text.fullAccess}
              </div>
            </div>

            <a
              href={`/pricing?lang=${locale}`}
              style={{
                textDecoration: "none",
                borderRadius: 999,
                padding: "12px 16px",
                background: theme.colors.black,
                color: "white",
                fontWeight: 900
              }}
            >
              {plan === "market_pro" ? text.viewPlans : text.upgrade}
            </a>
          </div>
        </section>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 12,
            marginBottom: 18
          }}
        >
          <StatCard
            theme={theme}
            label={text.collectionUsage}
            value={`${itemCount} / ${formatLimit(itemLimit)}`}
            hint={plan === "free" ? text.usageHintFree : text.usageHintPaid}
          />
          <StatCard
            theme={theme}
            label={text.wishlistUsage}
            value={`${wishlistCount} / ${formatLimit(wishlistLimit)}`}
            hint={plan === "free" ? text.usageHintFree : text.usageHintPaid}
          />
          <StatCard
            theme={theme}
            label={text.unlockedAchievements}
            value={String(unlockedAchievementsCount)}
            hint={`${achievements.length} total`}
          />
          <StatCard
            theme={theme}
            label={text.memberSince}
            value={
              me?.createdAt
                ? new Date(me.createdAt).toLocaleDateString()
                : "—"
            }
            hint={me?.email || "—"}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 340px",
            gap: 18,
            alignItems: "start"
          }}
        >
          <div>
            <section
              style={{
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radius.xl,
                padding: 18,
                background: theme.colors.surface,
                boxShadow: theme.shadow.card,
                marginBottom: 18
              }}
            >
              <div
                style={{
                  fontWeight: 900,
                  fontSize: 17,
                  marginBottom: 8
                }}
              >
                {text.loyaltyTitle}
              </div>

              <div
                style={{
                  color: theme.colors.textMuted,
                  fontSize: 14,
                  lineHeight: 1.7,
                  marginBottom: 16
                }}
              >
                {text.loyaltyText}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 10,
                  marginBottom: 16
                }}
              >
                <MiniStat
                  theme={theme}
                  label={text.unlockedThemes}
                  value={String(unlockedThemes.length)}
                />
                <MiniStat
                  theme={theme}
                  label={text.premiumMonths}
                  value={String(premiumMonths)}
                />
                <MiniStat
                  theme={theme}
                  label={text.nextUnlock}
                  value={nextTheme ? `${nextTheme.id} · ${nextTheme.months}m` : "—"}
                />
              </div>

              <ThemeSelector
                currentThemeId={themeId}
                plan={plan}
                premiumStartedAt={premiumStartedAt}
                locale={locale}
              />
            </section>

            <section
              style={{
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radius.xl,
                padding: 18,
                background: theme.colors.surface,
                boxShadow: theme.shadow.card
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                  flexWrap: "wrap",
                  marginBottom: 14
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 900,
                      fontSize: 17
                    }}
                  >
                    {text.achievementsTitle}
                  </div>

                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 14,
                      color: theme.colors.textMuted,
                      lineHeight: 1.6,
                      maxWidth: 700
                    }}
                  >
                    {text.achievementsSubtitle}
                  </div>
                </div>

                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: 999,
                    background: theme.colors.surfaceAlt,
                    border: `1px solid ${theme.colors.border}`,
                    fontWeight: 900,
                    fontSize: 13
                  }}
                >
                  {unlockedAchievementsCount}/{achievements.length}
                </div>
              </div>

              {lastUnlocked && (
                <div
                  style={{
                    marginBottom: 16,
                    padding: 16,
                    borderRadius: theme.radius.xl,
                    background: theme.colors.black,
                    color: "white",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "center",
                    flexWrap: "wrap"
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: "rgba(255,255,255,0.70)",
                        marginBottom: 6
                      }}
                    >
                      {text.lastUnlocked}
                    </div>

                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 900
                      }}
                    >
                      {getAchievementIcon(lastUnlocked.id, lastUnlocked.icon)}{" "}
                      {prettifyAchievementId(lastUnlocked.id, locale)}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "8px 12px",
                      borderRadius: 999,
                      background: theme.colors.gold,
                      color: theme.colors.black,
                      fontWeight: 900,
                      fontSize: 12
                    }}
                  >
                    {text.unlocked}
                  </div>
                </div>
              )}

              {achievements.length === 0 ? (
                <div
                  style={{
                    color: theme.colors.textMuted,
                    fontSize: 14
                  }}
                >
                  —
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 12
                  }}
                >
                  {achievements.map((achievement) => {
                    const progress = getAchievementProgress(achievement);
                    const unlocked = achievement.unlocked;

                    return (
                      <article
                        key={achievement.id}
                        style={{
                          borderRadius: theme.radius.lg,
                          padding: 16,
                          background: unlocked
                            ? theme.colors.surfaceAlt
                            : theme.colors.surface,
                          border: `1px solid ${theme.colors.border}`,
                          boxShadow: theme.shadow.soft
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 10,
                            alignItems: "flex-start",
                            marginBottom: 10
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: 10,
                              alignItems: "center"
                            }}
                          >
                            <div
                              style={{
                                width: 42,
                                height: 42,
                                borderRadius: 999,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: unlocked
                                  ? theme.colors.gold
                                  : theme.colors.surfaceAlt,
                                border: `1px solid ${theme.colors.border}`,
                                fontSize: 20
                              }}
                            >
                              {getAchievementIcon(
                                achievement.id,
                                achievement.icon
                              )}
                            </div>

                            <div>
                              <div
                                style={{
                                  fontSize: 15,
                                  fontWeight: 900,
                                  color: theme.colors.text
                                }}
                              >
                                {prettifyAchievementId(achievement.id, locale)}
                              </div>

                              <div
                                style={{
                                  marginTop: 4,
                                  fontSize: 12,
                                  color: theme.colors.textMuted
                                }}
                              >
                                {achievementDescription(achievement, locale)}
                              </div>
                            </div>
                          </div>

                          <span
                            style={{
                              padding: "4px 8px",
                              borderRadius: 999,
                              fontSize: 11,
                              fontWeight: 900,
                              background: unlocked
                                ? theme.colors.gold
                                : theme.colors.surfaceAlt,
                              color: unlocked
                                ? theme.colors.black
                                : theme.colors.textMuted,
                              border: `1px solid ${theme.colors.border}`,
                              whiteSpace: "nowrap"
                            }}
                          >
                            {unlocked ? text.unlocked : text.inProgress}
                          </span>
                        </div>

                        <div
                          style={{
                            width: "100%",
                            height: 10,
                            borderRadius: 999,
                            background: theme.colors.surfaceAlt,
                            overflow: "hidden",
                            border: `1px solid ${theme.colors.border}`,
                            marginBottom: 8
                          }}
                        >
                          <div
                            style={{
                              width: `${progress}%`,
                              height: "100%",
                              background: unlocked
                                ? theme.colors.gold
                                : theme.colors.black,
                              transition: "width 0.2s ease"
                            }}
                          />
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 8,
                            fontSize: 12,
                            color: theme.colors.textMuted
                          }}
                        >
                          <span>
                            {achievement.progress}/{achievement.target}
                          </span>
                          <span>{progress}%</span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          <aside
            style={{
              display: "grid",
              gap: 18
            }}
          >
            <SideCard
              theme={theme}
              title={locale === "es" ? "Tu cuenta" : "Your account"}
            >
              <InfoRow label="Email" value={me?.email || "—"} theme={theme} />
              <InfoRow
                label={text.currentPlan}
                value={formatPlanLabel(plan, locale)}
                theme={theme}
              />
              <InfoRow
                label={text.premiumMonths}
                value={String(premiumMonths)}
                theme={theme}
              />
            </SideCard>

            <SideCard
              theme={theme}
              title={locale === "es" ? "Upgrade rápido" : "Quick upgrade"}
            >
              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: theme.colors.textMuted,
                  marginBottom: 12
                }}
              >
                {plan === "free"
                  ? text.collectorHint
                  : plan === "premium"
                    ? text.marketHint
                    : text.fullAccess}
              </div>

              <a
                href={`/pricing?lang=${locale}`}
                style={{
                  display: "inline-block",
                  textDecoration: "none",
                  borderRadius: 999,
                  padding: "10px 14px",
                  background: theme.colors.black,
                  color: "white",
                  fontWeight: 900
                }}
              >
                {plan === "market_pro" ? text.viewPlans : text.upgrade}
              </a>
            </SideCard>
          </aside>
        </div>
      </div>
    </main>
  );
}

function navLink(theme: ReturnType<typeof getThemeById>): React.CSSProperties {
  return {
    textDecoration: "none",
    borderRadius: 999,
    padding: "10px 14px",
    background: theme.colors.surface,
    color: theme.colors.text,
    fontWeight: 800,
    border: `1px solid ${theme.colors.border}`
  };
}

function StatCard({
  theme,
  label,
  value,
  hint
}: {
  theme: ReturnType<typeof getThemeById>;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div
      style={{
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.lg,
        padding: 16,
        background: theme.colors.surface,
        boxShadow: theme.shadow.soft
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: theme.colors.textMuted,
          marginBottom: 6,
          fontWeight: 800
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 22,
          fontWeight: 900,
          marginBottom: 6
        }}
      >
        {value}
      </div>

      <div
        style={{
          fontSize: 12,
          color: theme.colors.textMuted,
          lineHeight: 1.5
        }}
      >
        {hint}
      </div>
    </div>
  );
}

function MiniStat({
  theme,
  label,
  value
}: {
  theme: ReturnType<typeof getThemeById>;
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.md,
        padding: "12px 14px",
        background: theme.colors.surfaceAlt
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: theme.colors.textMuted,
          marginBottom: 6,
          fontWeight: 800
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 16,
          fontWeight: 900
        }}
      >
        {value}
      </div>
    </div>
  );
}

function SideCard({
  theme,
  title,
  children
}: {
  theme: ReturnType<typeof getThemeById>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.xl,
        padding: 18,
        background: theme.colors.surface,
        boxShadow: theme.shadow.card
      }}
    >
      <div
        style={{
          fontWeight: 900,
          fontSize: 16,
          marginBottom: 12
        }}
      >
        {title}
      </div>

      {children}
    </section>
  );
}

function InfoRow({
  label,
  value,
  theme
}: {
  label: string;
  value: string;
  theme: ReturnType<typeof getThemeById>;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        padding: "10px 0",
        borderBottom: `1px solid ${theme.colors.border}`,
        fontSize: 14
      }}
    >
      <span style={{ color: theme.colors.textMuted }}>{label}</span>
      <span style={{ fontWeight: 800, color: theme.colors.text }}>{value}</span>
    </div>
  );
}