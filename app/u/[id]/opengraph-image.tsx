import { ImageResponse } from "next/og";
import { getThemeById, AppThemeId } from "../../theme";
import { getUnlockedThemes } from "../../lib/themes";
import { getCategoryLabel } from "../../items/categoryLabels";
import { getCategoryVisual } from "../../items/categoryVisuals";

export const size = {
  width: 1200,
  height: 630
};

export const contentType = "image/png";

type PublicProfileItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  estimatedPrice: number;
  marketValue: number | null;
  createdAt: string;
};

type PublicProfileCategory = {
  category: string;
  items: number;
  units: number;
  totalValue: number;
  marketTotalValue: number;
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
    marketTotalValue?: number;
    previewLimit: number;
    hiddenItems: number;
    valuedItems: number;
  };
  achievements: {
    totalUnlocked: number;
    highlights: Array<{
      id: string;
      label: string;
      icon: string;
    }>;
  };
  favoriteCategory?: PublicProfileCategory | null;
  mostValuableItem?: PublicProfileItem | null;
  categoryBreakdown?: PublicProfileCategory[];
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

export default async function Image({
  params
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const profile = await getPublicProfile(resolvedParams.id);

  if (!profile) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0F172A",
            color: "white",
            fontSize: 52,
            fontWeight: 900
          }}
        >
          DrakoryVault
        </div>
      ),
      size
    );
  }

  const showcaseThemeId = getShowcaseThemeId(
    profile.premiumStartedAt,
    profile.plan
  );

  const theme = getThemeById(showcaseThemeId);
  const rank = getCollectorRank(profile);
  const marketValue = profile.stats.marketTotalValue ?? profile.stats.totalValue;

  const categories =
    profile.categoryBreakdown && profile.categoryBreakdown.length > 0
      ? profile.categoryBreakdown.slice(0, 4)
      : getTopCategoriesFromItems(profile.itemsPreview);

  const biggestTreasure =
    profile.mostValuableItem ?? profile.itemsPreview[0] ?? null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: theme.colors.black,
          color: "white",
          padding: 58,
          fontFamily: "system-ui"
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 84% 12%, rgba(212,175,55,0.32), transparent 32%)"
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0))"
          }}
        />

        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 40
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  color: theme.colors.gold,
                  fontSize: 28,
                  fontWeight: 900,
                  letterSpacing: 1
                }}
              >
                <span>◆</span>
                <span>DRAKORYVAULT</span>
              </div>

              <div
                style={{
                  marginTop: 46,
                  fontSize: 68,
                  lineHeight: 1,
                  fontWeight: 950,
                  maxWidth: 720
                }}
              >
                {profile.displayName}
              </div>

              <div
                style={{
                  marginTop: 24,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  fontSize: 30,
                  fontWeight: 900,
                  color: theme.colors.gold
                }}
              >
                <span>{rank.icon}</span>
                <span>{rank.label}</span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 14
              }}
            >
              <div
                style={{
                  padding: "12px 20px",
                  borderRadius: 999,
                  background: theme.colors.gold,
                  color: theme.colors.black,
                  fontSize: 24,
                  fontWeight: 950
                }}
              >
                {showcaseThemeId.toUpperCase()} THEME
              </div>

              {biggestTreasure && (
                <div
                  style={{
                    width: 320,
                    padding: 18,
                    borderRadius: 24,
                    background: "rgba(255,255,255,0.10)",
                    border: "1px solid rgba(255,255,255,0.16)",
                    display: "flex",
                    flexDirection: "column"
                  }}
                >
                  <div
                    style={{
                      fontSize: 18,
                      color: "rgba(255,255,255,0.68)",
                      fontWeight: 800,
                      marginBottom: 8
                    }}
                  >
                    Biggest Treasure
                  </div>

                  <div
                    style={{
                      fontSize: 25,
                      fontWeight: 950,
                      lineHeight: 1.15,
                      marginBottom: 10
                    }}
                  >
                    {truncate(biggestTreasure.name, 34)}
                  </div>

                  <div
                    style={{
                      fontSize: 32,
                      color: theme.colors.gold,
                      fontWeight: 950
                    }}
                  >
                    {getBestItemValue(biggestTreasure).toFixed(2)} €
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 18
            }}
          >
            <MetricCard
              label="Items"
              value={String(profile.stats.totalItems)}
            />
            <MetricCard
              label="Market Value"
              value={`${marketValue.toFixed(2)} €`}
            />
            <MetricCard
              label="Achievements"
              value={String(profile.achievements.totalUnlocked)}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: 30
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                maxWidth: 790
              }}
            >
              {categories.map((category) => {
                const visual = getCategoryVisual(category.category);
                const label = getCategoryLabel(category.category, "en");

                return (
                  <div
                    key={category.category}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "12px 16px",
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.10)",
                      border: "1px solid rgba(255,255,255,0.14)",
                      fontSize: 22,
                      fontWeight: 900
                    }}
                  >
                    <span>{visual.icon}</span>
                    <span>{label}</span>
                    <span style={{ color: "rgba(255,255,255,0.58)" }}>
                      {category.items}
                    </span>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                fontSize: 24,
                color: "rgba(255,255,255,0.70)",
                fontWeight: 800
              }}
            >
              Track. Value. Showcase.
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        width: 245,
        padding: 20,
        borderRadius: 24,
        background: "rgba(255,255,255,0.10)",
        border: "1px solid rgba(255,255,255,0.14)",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <div
        style={{
          fontSize: 20,
          color: "rgba(255,255,255,0.62)",
          fontWeight: 800,
          marginBottom: 8
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 36,
          fontWeight: 950,
          color: "white"
        }}
      >
        {value}
      </div>
    </div>
  );
}

function getBestItemValue(item: PublicProfileItem) {
  return item.marketValue ?? item.estimatedPrice;
}

function getTopCategoriesFromItems(items: PublicProfileItem[]) {
  const map = new Map<string, PublicProfileCategory>();

  for (const item of items) {
    const current = map.get(item.category) ?? {
      category: item.category,
      items: 0,
      units: 0,
      totalValue: 0,
      marketTotalValue: 0
    };

    current.items += 1;
    current.units += item.quantity;
    current.totalValue += item.estimatedPrice * item.quantity;
    current.marketTotalValue += getBestItemValue(item) * item.quantity;

    map.set(item.category, current);
  }

  return [...map.values()].sort((a, b) => b.items - a.items).slice(0, 4);
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
      icon: "👑"
    };
  }

  if (score >= 300) {
    return {
      label: "Vault Master",
      icon: "🏛️"
    };
  }

  if (score >= 180) {
    return {
      label: "Rare Hunter",
      icon: "💎"
    };
  }

  if (score >= 90) {
    return {
      label: "Shelf Builder",
      icon: "📦"
    };
  }

  return {
    label: "New Collector",
    icon: "🧩"
  };
}

function truncate(value: string, max: number) {
  if (value.length <= max) return value;
  return `${value.slice(0, max)}…`;
}