import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getThemeById, AppThemeId } from "../../theme";
import { getUnlockedThemes } from "../../lib/themes";
import { formatPlanLabel, normalizePlan } from "../../lib/plans";
import { getCategoryLabel } from "../../items/categoryLabels";
import { getCategoryVisual } from "../../items/categoryVisuals";

type PublicProfileItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  estimatedPrice: number;
  marketValue: number | null;
  createdAt: string;
};

type PublicAchievement = {
  id: string;
  label: string;
  icon: string;
};

type PublicProfile = {
  id: string;
  displayName: string;
  plan: "free" | "premium" | "market_pro";
  premiumStartedAt: string | null;
  createdAt: string | null;
  stats: {
    totalItems: number;
    totalUnits: number;
    totalValue: number;
    previewLimit: number;
    hiddenItems: number;
    valuedItems: number;
  };
  achievements: {
    totalUnlocked: number;
    highlights: PublicAchievement[];
  };
  itemsPreview: PublicProfileItem[];
};

const API = process.env.NEXT_PUBLIC_API_URL!;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";

async function getPublicProfile(id: string): Promise<PublicProfile | null> {
  try {
    const res = await fetch(`${API}/users/${id}/public`, {
      cache: "no-store"
    });

    if (!res.ok) return null;

    return res.json();
  } catch {
    return null;
  }
}

function getShowcaseThemeId(
  premiumStartedAt?: string | null,
  plan?: string | null
): AppThemeId {
  const unlockedThemes = getUnlockedThemes(
    premiumStartedAt ?? null,
    plan ?? "free"
  );

  if (unlockedThemes.includes("retro")) return "retro";
  if (unlockedThemes.includes("fantasy")) return "fantasy";
  if (unlockedThemes.includes("cyberpunk")) return "cyberpunk";
  if (unlockedThemes.includes("dark")) return "dark";

  return "classic";
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }> | { id: string };
}): Promise<Metadata> {
  const resolvedParams = params instanceof Promise ? await params : params;
  const profile = await getPublicProfile(resolvedParams.id);

  if (!profile) {
    return {
      title: "Collector profile • DrakoryVault",
      description: "Public collector profile on DrakoryVault."
    };
  }

  const title = `${profile.displayName} • DrakoryVault`;
  const description = `${profile.stats.totalItems} items • ${profile.stats.totalValue.toFixed(
    2
  )} € • ${profile.achievements.totalUnlocked} achievements`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/u/${profile.id}`,
      type: "profile"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description
    }
  };
}

export default async function PublicUserPage({
  params
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const profile = await getPublicProfile(resolvedParams.id);

  if (!profile) {
    notFound();
  }

  const normalizedPlan = normalizePlan(profile.plan);
  const showcaseThemeId = getShowcaseThemeId(
    profile.premiumStartedAt,
    profile.plan
  );
  const theme = getThemeById(showcaseThemeId);

  const unlockedThemes = getUnlockedThemes(
    profile.premiumStartedAt,
    profile.plan
  );

  const createdAt = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString()
    : "—";

  const topCategories = getTopCategories(profile.itemsPreview);
  const collectorRank = getCollectorRank(profile);

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
      <style>{`
        .public-shell {
          max-width: 1180px;
          margin: 0 auto;
        }

        .public-hero {
          position: relative;
          overflow: hidden;
          background: ${theme.colors.black};
          color: white;
          border-radius: ${theme.radius.xl}px;
          padding: 28px 30px;
          margin-bottom: 18px;
          box-shadow: ${theme.shadow.card};
        }

        .public-hero-inner {
          position: relative;
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: center;
          flex-wrap: wrap;
        }

        .public-stats-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 18px;
        }

        .public-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 320px;
          gap: 18px;
          align-items: start;
        }

        .public-preview-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .public-achievements-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        @media (max-width: 1100px) {
          .public-stats-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .public-layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          main {
            padding: 16px !important;
          }

          .public-hero {
            padding: 22px 20px;
            border-radius: ${theme.radius.lg}px;
          }

          .public-hero-inner {
            align-items: flex-start;
            flex-direction: column;
          }

          .public-hero h1 {
            font-size: 30px !important;
          }

          .public-stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .public-preview-grid {
            grid-template-columns: 1fr;
          }

          .public-achievements-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 520px) {
          .public-stats-grid {
            grid-template-columns: 1fr;
          }

          .public-achievements-grid {
            grid-template-columns: 1fr;
          }

          .public-hero h1 {
            font-size: 26px !important;
          }
        }
      `}</style>

      <div className="public-shell">
        <section className="public-hero">
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at top right, rgba(212,175,55,0.24), transparent 34%)",
              pointerEvents: "none"
            }}
          />

          <div className="public-hero-inner">
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  color: theme.colors.gold,
                  marginBottom: 10,
                  letterSpacing: 0.4,
                  textTransform: "uppercase"
                }}
              >
                Public collector profile
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: 38,
                  lineHeight: 1.04,
                  fontWeight: 950,
                  overflowWrap: "anywhere"
                }}
              >
                {profile.displayName}
              </h1>

              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  color: "rgba(255,255,255,0.82)",
                  fontSize: 14
                }}
              >
                <span>Member since {createdAt}</span>
                <span>•</span>
                <span>{profile.stats.totalItems} items</span>
                <span>•</span>
                <span>{profile.stats.totalValue.toFixed(2)} €</span>
                <span>•</span>
                <span>{profile.achievements.totalUnlocked} achievements</span>
              </div>

              <div
                style={{
                  marginTop: 14,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.10)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  color: "white",
                  fontSize: 13,
                  fontWeight: 900
                }}
              >
                <span aria-hidden="true">{collectorRank.icon}</span>
                <span>Collector Rank: {collectorRank.label}</span>
              </div>

              {topCategories.length > 0 && (
                <div
                  style={{
                    marginTop: 16,
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap"
                  }}
                >
                  {topCategories.map((category) => {
                    const visual = getCategoryVisual(category.category);
                    const label = getCategoryLabel(category.category, "en");

                    return (
                      <span
                        key={category.category}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 7,
                          padding: "6px 10px",
                          borderRadius: 999,
                          background: "rgba(255,255,255,0.08)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          color: "white",
                          fontSize: 12,
                          fontWeight: 900
                        }}
                      >
                        <span aria-hidden="true">{visual.icon}</span>
                        <span>{label}</span>
                        <span style={{ color: "rgba(255,255,255,0.64)" }}>
                          {category.count}
                        </span>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            <div
              style={{
                display: "grid",
                gap: 10,
                justifyItems: "end"
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 14px",
                  borderRadius: 999,
                  background: theme.colors.gold,
                  color: theme.colors.black,
                  fontWeight: 900,
                  fontSize: 13
                }}
              >
                {formatPlanLabel(normalizedPlan, "en")}
              </div>

              <a
                href="/register"
                style={{
                  textDecoration: "none",
                  borderRadius: 999,
                  padding: "10px 14px",
                  background: "rgba(255,255,255,0.10)",
                  color: "white",
                  fontWeight: 900,
                  border: "1px solid rgba(255,255,255,0.14)",
                  fontSize: 13
                }}
              >
                Create your own vault →
              </a>
            </div>
          </div>
        </section>

        <div className="public-stats-grid">
          <StatCard
            theme={theme}
            label="Collector Rank"
            value={collectorRank.label}
            hint={collectorRank.description}
          />
          <StatCard
            theme={theme}
            label="Collection"
            value={String(profile.stats.totalItems)}
            hint={`${profile.stats.totalUnits} total units`}
          />
          <StatCard
            theme={theme}
            label="Estimated value"
            value={`${profile.stats.totalValue.toFixed(2)} €`}
            hint={`${profile.stats.valuedItems} valued items`}
          />
          <StatCard
            theme={theme}
            label="Achievements"
            value={String(profile.achievements.totalUnlocked)}
            hint="Public highlights shown below"
          />
          <StatCard
            theme={theme}
            label="Unlocked themes"
            value={String(unlockedThemes.length)}
            hint={`Showcase theme: ${showcaseThemeId}`}
          />
        </div>

        <div className="public-layout">
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
                      fontSize: 18
                    }}
                  >
                    Collection preview
                  </div>

                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 14,
                      color: theme.colors.textMuted,
                      lineHeight: 1.6
                    }}
                  >
                    A public taste of this vault, limited by plan.
                  </div>
                </div>

                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: 999,
                    background: theme.colors.surfaceAlt,
                    border: `1px solid ${theme.colors.border}`,
                    fontWeight: 800,
                    fontSize: 12
                  }}
                >
                  Showing {profile.itemsPreview.length} /{" "}
                  {profile.stats.totalItems}
                </div>
              </div>

              {profile.itemsPreview.length === 0 ? (
                <div style={{ color: theme.colors.textMuted }}>
                  No public items yet.
                </div>
              ) : (
                <div className="public-preview-grid">
                  {profile.itemsPreview.map((item) => {
                    const visual = getCategoryVisual(item.category);
                    const categoryLabel = getCategoryLabel(item.category, "en");

                    return (
                      <article
                        key={item.id}
                        style={{
                          position: "relative",
                          overflow: "hidden",
                          border: `1px solid ${theme.colors.border}`,
                          borderRadius: theme.radius.lg,
                          padding: 14,
                          background: theme.colors.surfaceAlt,
                          boxShadow: theme.shadow.soft
                        }}
                      >
                        <div
                          aria-hidden="true"
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: `linear-gradient(135deg, ${visual.background} 0%, rgba(255,255,255,0) 64%)`,
                            pointerEvents: "none"
                          }}
                        />

                        <div style={{ position: "relative" }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 10,
                              marginBottom: 10,
                              alignItems: "flex-start"
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                gap: 10,
                                minWidth: 0,
                                alignItems: "flex-start"
                              }}
                            >
                              <span
                                aria-hidden="true"
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 12,
                                  background: visual.background,
                                  color: visual.color,
                                  border: `1px solid ${visual.color}33`,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: 18,
                                  flexShrink: 0
                                }}
                              >
                                {visual.icon}
                              </span>

                              <div style={{ minWidth: 0 }}>
                                <div
                                  style={{
                                    fontWeight: 900,
                                    fontSize: 15,
                                    color: theme.colors.text,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap"
                                  }}
                                  title={item.name}
                                >
                                  {item.name}
                                </div>

                                <div
                                  style={{
                                    marginTop: 7,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    maxWidth: "100%",
                                    padding: "4px 8px",
                                    borderRadius: 999,
                                    background: theme.colors.surface,
                                    border: `1px solid ${theme.colors.border}`,
                                    fontSize: 12,
                                    color: visual.color,
                                    fontWeight: 900,
                                    whiteSpace: "nowrap"
                                  }}
                                >
                                  <span aria-hidden="true">{visual.icon}</span>
                                  <span
                                    style={{
                                      overflow: "hidden",
                                      textOverflow: "ellipsis"
                                    }}
                                  >
                                    {categoryLabel}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div
                              style={{
                                fontWeight: 900,
                                fontSize: 13,
                                color: theme.colors.textMuted,
                                whiteSpace: "nowrap"
                              }}
                            >
                              x{item.quantity}
                            </div>
                          </div>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                              gap: 10
                            }}
                          >
                            <MiniInfo
                              theme={theme}
                              label="Est."
                              value={`${item.estimatedPrice.toFixed(2)} €`}
                            />
                            <MiniInfo
                              theme={theme}
                              label="Market"
                              value={
                                item.marketValue != null
                                  ? `${item.marketValue.toFixed(2)} €`
                                  : "—"
                              }
                            />
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {profile.stats.hiddenItems > 0 && (
                <div
                  style={{
                    marginTop: 14,
                    padding: "12px 14px",
                    borderRadius: 16,
                    background: "#FEF3F2",
                    border: "1px solid #FECACA",
                    color: "#B42318",
                    fontSize: 14,
                    lineHeight: 1.6
                  }}
                >
                  {profile.stats.hiddenItems} more items are hidden in the
                  public preview for this plan.
                </div>
              )}
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
                  fontWeight: 900,
                  fontSize: 18,
                  marginBottom: 14
                }}
              >
                Achievement highlights
              </div>

              {profile.achievements.highlights.length === 0 ? (
                <div style={{ color: theme.colors.textMuted }}>
                  No public highlights yet.
                </div>
              ) : (
                <div className="public-achievements-grid">
                  {profile.achievements.highlights.map((achievement) => (
                    <article
                      key={achievement.id}
                      style={{
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: theme.radius.lg,
                        padding: 16,
                        background: theme.colors.surfaceAlt,
                        boxShadow: theme.shadow.soft
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
                          background: theme.colors.gold,
                          color: theme.colors.black,
                          fontSize: 20,
                          marginBottom: 12
                        }}
                      >
                        {achievement.icon}
                      </div>

                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 900,
                          color: theme.colors.text
                        }}
                      >
                        {achievement.label}
                      </div>
                    </article>
                  ))}
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
            <SideCard theme={theme} title="Collector identity">
              <InfoRow
                theme={theme}
                label="Rank"
                value={`${collectorRank.icon} ${collectorRank.label}`}
              />
              <InfoRow
                theme={theme}
                label="Plan"
                value={formatPlanLabel(normalizedPlan, "en")}
              />
              <InfoRow
                theme={theme}
                label="Themes"
                value={String(unlockedThemes.length)}
              />
              <InfoRow
                theme={theme}
                label="Showcase theme"
                value={showcaseThemeId}
              />
              <InfoRow
                theme={theme}
                label="Vault size"
                value={`${profile.stats.totalItems} items`}
              />
            </SideCard>

            <SideCard theme={theme} title="Join DrakoryVault">
              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: theme.colors.textMuted,
                  marginBottom: 12
                }}
              >
                Build your own vault, track value, unlock themes and grow your
                collector profile.
              </div>

              <a
                href="/register"
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
                Create account
              </a>
            </SideCard>
          </aside>
        </div>
      </div>
    </main>
  );
}

function getTopCategories(items: PublicProfileItem[]) {
  const map = new Map<string, number>();

  for (const item of items) {
    map.set(item.category, (map.get(item.category) ?? 0) + 1);
  }

  return [...map.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);
}

function getCollectorRank(profile: PublicProfile) {
  const score =
    profile.stats.totalItems * 2 +
    profile.stats.valuedItems * 2 +
    profile.achievements.totalUnlocked * 8 +
    Math.min(200, profile.stats.totalValue / 25);

  if (score >= 500) {
    return {
      label: "Mythic Collector",
      icon: "👑",
      description: "Elite vault status"
    };
  }

  if (score >= 300) {
    return {
      label: "Vault Master",
      icon: "🏛️",
      description: "High-end collector"
    };
  }

  if (score >= 180) {
    return {
      label: "Rare Hunter",
      icon: "💎",
      description: "Strong collector profile"
    };
  }

  if (score >= 90) {
    return {
      label: "Shelf Builder",
      icon: "📦",
      description: "Growing collection"
    };
  }

  return {
    label: "New Collector",
    icon: "🧩",
    description: "Starting the vault"
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

function MiniInfo({
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
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.md,
        padding: "10px 12px"
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
          fontSize: 14,
          color: theme.colors.text,
          fontWeight: 700
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