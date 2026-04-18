import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppThemeId, getThemeById } from "../theme";
import LogoutButton from "../items/LogoutButton";
import UserBadge from "../components/UserBadge";
import { getLocale } from "../i18n";
import { getCategoryLabel } from "../items/categoryLabels";

type MarketOverview = {
  summary: {
    trackedItems: number;
    baseTotalValue: number;
    marketTotalValue: number;
    totalGap: number;
    totalGapPercent: number | null;
  };
  rising: Array<{
    id: string;
    name: string;
    category: string;
    firstValue: number;
    latestValue: number;
    delta: number;
  }>;
  dropping: Array<{
    id: string;
    name: string;
    category: string;
    firstValue: number;
    latestValue: number;
    delta: number;
  }>;
  biggestGaps: Array<{
    id: string;
    name: string;
    category: string;
    estimatedPrice: number;
    marketValue: number;
    gap: number;
    gapPercent: number | null;
  }>;
};

const API = process.env.NEXT_PUBLIC_API_URL!;

async function getMarketOverview(
  cookieHeader: string,
  category?: string
): Promise<MarketOverview | null> {
  try {
    const qs = category
      ? `?category=${encodeURIComponent(category)}`
      : "";

    const res = await fetch(`${API}/stats/market-overview${qs}`, {
      cache: "no-store",
      headers: {
        cookie: cookieHeader
      }
    });

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch {
    return null;
  }
}

export default async function MarketProPage({
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

  const themeId =
    (cookieStore.get("ui_theme")?.value as AppThemeId | undefined) ?? "classic";
  const theme = getThemeById(themeId);

  const sp =
    searchParams instanceof Promise ? await searchParams : searchParams ?? {};

  const locale = getLocale(sp);
  const category = typeof sp.category === "string" ? sp.category : undefined;

  const data = await getMarketOverview(cookieHeader, category);

  const text = {
    title: locale === "es" ? "Market Pro" : "Market Pro",
    subtitle:
      locale === "es"
        ? "Lectura avanzada de mercado para tu colección"
        : "Advanced market intelligence for your collection",
    trackedItems:
      locale === "es" ? "Items con market data" : "Items with market data",
    baseValue: locale === "es" ? "Valor base" : "Base value",
    marketValue: locale === "es" ? "Valor mercado" : "Market value",
    totalGap: locale === "es" ? "Gap total" : "Total gap",
    rising: locale === "es" ? "Top subidas" : "Top rising",
    dropping: locale === "es" ? "Top bajadas" : "Top dropping",
    biggestGaps:
      locale === "es" ? "Mayores diferencias" : "Biggest gaps",
    noData:
      locale === "es"
        ? "Todavía no hay suficiente market data para esta vista."
        : "There is not enough market data for this view yet.",
    first: locale === "es" ? "Inicial" : "Initial",
    latest: locale === "es" ? "Actual" : "Current",
    delta: locale === "es" ? "Cambio" : "Change",
    estimated: locale === "es" ? "Estimado" : "Estimated",
    market: locale === "es" ? "Mercado" : "Market",
    gap: locale === "es" ? "Gap" : "Gap",
    back: locale === "es" ? "Volver a colección" : "Back to collection"
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: theme.colors.bg,
        color: theme.colors.text,
        fontFamily: "system-ui",
        padding: 24
      }}
    >
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <div
          style={{
            background: theme.colors.black,
            color: "white",
            borderRadius: theme.radius.xl,
            padding: "16px 20px",
            marginBottom: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            boxShadow: theme.shadow.card
          }}
        >
          <div>
            <div style={{ fontWeight: 900, fontSize: 22 }}>{text.title}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.76)", marginTop: 4 }}>
              {text.subtitle}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap"
            }}
          >
            <UserBadge />

            <a
              href={`/items?lang=${locale}`}
              style={{
                textDecoration: "none",
                borderRadius: 999,
                padding: "10px 14px",
                background: "rgba(255,255,255,0.10)",
                color: "white",
                fontWeight: 800,
                border: "1px solid rgba(255,255,255,0.12)"
              }}
            >
              {text.back}
            </a>

            <LogoutButton />
          </div>
        </div>

        {!data || data.summary.trackedItems === 0 ? (
          <section
            style={{
              background: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radius.xl,
              padding: 24,
              boxShadow: theme.shadow.card,
              color: theme.colors.textMuted
            }}
          >
            {text.noData}
          </section>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(180px, 1fr))",
                gap: 12,
                marginBottom: 18
              }}
            >
              <StatCard
                label={text.trackedItems}
                value={data.summary.trackedItems}
                theme={theme}
              />
              <StatCard
                label={text.baseValue}
                value={`${data.summary.baseTotalValue.toFixed(2)} €`}
                theme={theme}
              />
              <StatCard
                label={text.marketValue}
                value={`${data.summary.marketTotalValue.toFixed(2)} €`}
                theme={theme}
              />
              <StatCard
                label={text.totalGap}
                value={`${data.summary.totalGap >= 0 ? "+" : ""}${data.summary.totalGap.toFixed(2)} €`}
                theme={theme}
                accent={
                  data.summary.totalGap > 0
                    ? theme.colors.success
                    : data.summary.totalGap < 0
                      ? theme.colors.danger
                      : theme.colors.text
                }
                subvalue={
                  data.summary.totalGapPercent != null
                    ? `${data.summary.totalGapPercent >= 0 ? "+" : ""}${data.summary.totalGapPercent.toFixed(1)}%`
                    : undefined
                }
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 18,
                marginBottom: 18
              }}
            >
              <Panel theme={theme} title={text.rising}>
                <TrendTable
                  rows={data.rising}
                  locale={locale}
                  theme={theme}
                  emptyText={text.noData}
                  firstLabel={text.first}
                  latestLabel={text.latest}
                  deltaLabel={text.delta}
                />
              </Panel>

              <Panel theme={theme} title={text.dropping}>
                <TrendTable
                  rows={data.dropping}
                  locale={locale}
                  theme={theme}
                  emptyText={text.noData}
                  firstLabel={text.first}
                  latestLabel={text.latest}
                  deltaLabel={text.delta}
                />
              </Panel>
            </div>

            <Panel theme={theme} title={text.biggestGaps}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <Th theme={theme}>Item</Th>
                      <Th theme={theme}>Category</Th>
                      <Th theme={theme} align="right">
                        {text.estimated}
                      </Th>
                      <Th theme={theme} align="right">
                        {text.market}
                      </Th>
                      <Th theme={theme} align="right">
                        {text.gap}
                      </Th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.biggestGaps.map((row) => (
                      <tr key={row.id}>
                        <Td theme={theme}>
                          <a
                            href={`/items/${row.id}?lang=${locale}`}
                            style={{
                              textDecoration: "none",
                              color: theme.colors.text,
                              fontWeight: 800
                            }}
                          >
                            {row.name}
                          </a>
                        </Td>
                        <Td theme={theme}>
                          {getCategoryLabel(row.category, locale)}
                        </Td>
                        <Td theme={theme} align="right">
                          {row.estimatedPrice.toFixed(2)} €
                        </Td>
                        <Td theme={theme} align="right">
                          {row.marketValue.toFixed(2)} €
                        </Td>
                        <Td theme={theme} align="right">
                          <GapBadge
                            gap={row.gap}
                            gapPercent={row.gapPercent}
                            theme={theme}
                          />
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </>
        )}
      </div>
    </main>
  );
}

function Panel({
  title,
  children,
  theme
}: {
  title: string;
  children: React.ReactNode;
  theme: ReturnType<typeof getThemeById>;
}) {
  return (
    <section
      style={{
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.xl,
        overflow: "hidden",
        boxShadow: theme.shadow.card
      }}
    >
      <div
        style={{
          padding: "14px 16px",
          borderBottom: `1px solid ${theme.colors.border}`,
          background: theme.colors.surfaceAlt,
          fontWeight: 900
        }}
      >
        {title}
      </div>
      <div style={{ padding: 16 }}>{children}</div>
    </section>
  );
}

function StatCard({
  label,
  value,
  theme,
  accent,
  subvalue
}: {
  label: string;
  value: string | number;
  theme: ReturnType<typeof getThemeById>;
  accent?: string;
  subvalue?: string;
}) {
  return (
    <div
      style={{
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.lg,
        padding: "16px 18px",
        boxShadow: theme.shadow.soft
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: theme.colors.textMuted,
          marginBottom: 6
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 900,
          color: accent ?? theme.colors.text
        }}
      >
        {value}
      </div>
      {subvalue ? (
        <div style={{ marginTop: 6, fontSize: 12, color: theme.colors.textMuted }}>
          {subvalue}
        </div>
      ) : null}
    </div>
  );
}

function TrendTable({
  rows,
  locale,
  theme,
  emptyText,
  firstLabel,
  latestLabel,
  deltaLabel
}: {
  rows: Array<{
    id: string;
    name: string;
    category: string;
    firstValue: number;
    latestValue: number;
    delta: number;
  }>;
  locale: "en" | "es";
  theme: ReturnType<typeof getThemeById>;
  emptyText: string;
  firstLabel: string;
  latestLabel: string;
  deltaLabel: string;
}) {
  if (rows.length === 0) {
    return <div style={{ color: theme.colors.textMuted }}>{emptyText}</div>;
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {rows.map((row) => {
        const positive = row.delta > 0;

        return (
          <a
            key={row.id}
            href={`/items/${row.id}?lang=${locale}`}
            style={{
              textDecoration: "none",
              color: theme.colors.text,
              border: `1px solid ${theme.colors.border}`,
              background: theme.colors.surfaceAlt,
              borderRadius: 16,
              padding: 14,
              display: "grid",
              gap: 8
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center"
              }}
            >
              <div>
                <div style={{ fontWeight: 900 }}>{row.name}</div>
                <div style={{ fontSize: 12, color: theme.colors.textMuted, marginTop: 2 }}>
                  {getCategoryLabel(row.category, locale)}
                </div>
              </div>

              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 84,
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: positive
                    ? "rgba(34,197,94,0.14)"
                    : "rgba(244,63,94,0.14)",
                  color: positive ? theme.colors.success : theme.colors.danger,
                  fontWeight: 900,
                  fontSize: 12
                }}
              >
                {row.delta >= 0 ? "+" : ""}
                {row.delta.toFixed(2)} €
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 8,
                fontSize: 12
              }}
            >
              <MiniMetric label={firstLabel} value={`${row.firstValue.toFixed(2)} €`} theme={theme} />
              <MiniMetric label={latestLabel} value={`${row.latestValue.toFixed(2)} €`} theme={theme} />
              <MiniMetric
                label={deltaLabel}
                value={`${row.delta >= 0 ? "+" : ""}${row.delta.toFixed(2)} €`}
                theme={theme}
              />
            </div>
          </a>
        );
      })}
    </div>
  );
}

function MiniMetric({
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
        borderRadius: 12,
        border: `1px solid ${theme.colors.border}`,
        background: theme.colors.surface,
        padding: "8px 10px"
      }}
    >
      <div style={{ fontSize: 11, color: theme.colors.textMuted, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontWeight: 800 }}>{value}</div>
    </div>
  );
}

function GapBadge({
  gap,
  gapPercent,
  theme
}: {
  gap: number;
  gapPercent: number | null;
  theme: ReturnType<typeof getThemeById>;
}) {
  const positive = gap > 0;
  const negative = gap < 0;

  const bg = positive
    ? "rgba(34,197,94,0.14)"
    : negative
      ? "rgba(244,63,94,0.14)"
      : theme.colors.surfaceAlt;

  const color = positive
    ? theme.colors.success
    : negative
      ? theme.colors.danger
      : theme.colors.textMuted;

  return (
    <span
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 2,
        padding: "6px 10px",
        borderRadius: 12,
        background: bg,
        color,
        fontWeight: 800
      }}
    >
      <span>
        {gap >= 0 ? "+" : ""}
        {gap.toFixed(2)} €
      </span>
      {gapPercent != null ? (
        <span style={{ fontSize: 11 }}>
          {gapPercent >= 0 ? "+" : ""}
          {gapPercent.toFixed(1)}%
        </span>
      ) : null}
    </span>
  );
}

function Th({
  children,
  align,
  theme
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  theme: ReturnType<typeof getThemeById>;
}) {
  return (
    <th
      style={{
        textAlign: align ?? "left",
        padding: 12,
        fontSize: 12,
        color: theme.colors.textMuted,
        borderBottom: `1px solid ${theme.colors.border}`,
        background: theme.colors.surfaceAlt
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align,
  theme
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  theme: ReturnType<typeof getThemeById>;
}) {
  return (
    <td
      style={{
        textAlign: align ?? "left",
        padding: 12,
        borderBottom: `1px solid ${theme.colors.border}`,
        background: theme.colors.surface
      }}
    >
      {children}
    </td>
  );
}