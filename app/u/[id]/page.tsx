import { notFound } from "next/navigation";
import { getThemeById, AppThemeId } from "../../theme";
import { getUnlockedThemes } from "../../lib/themes";
import { formatPlanLabel, normalizePlan } from "../../lib/plans";

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
  const unlockedThemes = getUnlockedThemes(premiumStartedAt ?? null, plan ?? "free");

  if (unlockedThemes.includes("retro")) return "retro";
  if (unlockedThemes.includes("fantasy")) return "fantasy";
  if (unlockedThemes.includes("cyberpunk")) return "cyberpunk";
  if (unlockedThemes.includes("dark")) return "dark";

  return "classic";
}

function formatCategory(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
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
        <section
          style={{
            background: theme.colors.black,
            color: "white",
            borderRadius: theme.radius.xl,
            padding: "24px 26px",
            marginBottom: 18,
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
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: "rgba(255,255,255,0.72)",
                  marginBottom: 8
                }}
              >
                Public collector profile
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: 34,
                  lineHeight: 1.05,
                  fontWeight: 900
                }}
              >
                {profile.displayName}
              </h1>

              <div
                style={{
                  marginTop: 10,
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
              </div>
            </div>

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

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 320px",
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
                  Showing {profile.itemsPreview.length} / {profile.stats.totalItems}
                </div>
              </div>

              {profile.itemsPreview.length === 0 ? (
                <div style={{ color: theme.colors.textMuted }}>No public items yet.</div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 12
                  }}
                >
                  {profile.itemsPreview.map((item) => (
                    <article
                      key={item.id}
                      style={{
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: theme.radius.lg,
                        padding: 14,
                        background: theme.colors.surfaceAlt,
                        boxShadow: theme.shadow.soft
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 10,
                          marginBottom: 10,
                          alignItems: "flex-start"
                        }}
                      >
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
                              marginTop: 6,
                              display: "inline-block",
                              padding: "4px 8px",
                              borderRadius: 999,
                              background: theme.colors.surface,
                              border: `1px solid ${theme.colors.border}`,
                              fontSize: 12,
                              color: theme.colors.textMuted
                            }}
                          >
                            {formatCategory(item.category)}
                          </div>
                        </div>

                        <div
                          style={{
                            fontWeight: 800,
                            fontSize: 13,
                            color: theme.colors.textMuted
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
                    </article>
                  ))}
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
                  {profile.stats.hiddenItems} more items are hidden in the public preview for this plan.
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
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: 12
                  }}
                >
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
                Build your own vault, track value, unlock themes and grow your collector profile.
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