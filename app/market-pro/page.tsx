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

type Me = {
  id: string;
  email?: string;
  plan?: string;
};

const API = process.env.NEXT_PUBLIC_API_URL!;

function hasMarketProAccess(plan?: string | null) {
  if (!plan) return false;

  const normalized = plan.toLowerCase().trim();

  return (
    normalized === "market_pro" ||
    normalized === "market-pro" ||
    normalized === "marketpro"
  );
}

async function getMe(cookieHeader: string): Promise<Me | null> {
  try {
    const res = await fetch(`${API}/auth/me`, {
      cache: "no-store",
      headers: {
        cookie: cookieHeader
      }
    });

    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

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

  const me = await getMe(cookieHeader);
  const hasAccess = hasMarketProAccess(me?.plan);

  const text = {
    title: "Market Pro",
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
    back: locale === "es" ? "Volver a colección" : "Back to collection",
    teaserTitle:
      locale === "es"
        ? "Desbloquea inteligencia de mercado real"
        : "Unlock real market intelligence",
    teaserSubtitle:
      locale === "es"
        ? "Market Pro te ayuda a detectar oportunidades, riesgos y diferencias entre tu valoración base y el mercado."
        : "Market Pro helps you spot opportunities, risk and gaps between your baseline value and the market.",
    feature1:
      locale === "es"
        ? "Top subidas y bajadas de tu colección"
        : "Top rising and dropping items in your collection",
    feature2:
      locale === "es"
        ? "Mayores gaps entre precio estimado y valor de mercado"
        : "Biggest gaps between estimated price and market value",
    feature3:
      locale === "es"
        ? "Resumen avanzado del valor real de mercado"
        : "Advanced overview of your real market value",
    locked:
      locale === "es"
        ? "Disponible solo para usuarios Market Pro"
        : "Available only for Market Pro users",
    upgrade:
      locale === "es" ? "Ver planes en perfil" : "See plans in profile"
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

        {!hasAccess ? (
          <section
            style={{
              position: "relative",
              overflow: "hidden",
              background:
                "linear-gradient(135deg, rgba(15,23,42,1) 0%, rgba(30,41,59,1) 60%, rgba(51,65,85,1) 100%)",
              border: `1px solid rgba(212,175,55,0.26)`,
              borderRadius: theme.radius.xl,
              padding: 28,
              boxShadow: theme.shadow.card,
              color: "white"
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at top right, rgba(212,175,55,0.20), transparent 34%)",
                pointerEvents: "none"
              }}
            />

            <div
              style={{
                position: "relative",
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.2fr) minmax(260px, 0.8fr)",
                gap: 22,
                alignItems: "stretch"
              }}
            >
              <div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "7px 12px",
                    borderRadius: 999,
                    background: "rgba(212,175,55,0.16)",
                    color: theme.colors.gold,
                    fontWeight: 900,
                    fontSize: 12,
                    marginBottom: 14,
                    border: "1px solid rgba(212,175,55,0.22)"
                  }}
                >
                  <span>🔒</span>
                  <span>{text.locked}</span>
                </div>

                <h1
                  style={{
                    margin: 0,
                    fontSize: 34,
                    lineHeight: 1.05,
                    fontWeight: 900
                  }}
                >
                  {text.teaserTitle}
                </h1>

                <p
                  style={{
                    margin: "14px 0 0 0",
                    maxWidth: 720,
                    color: "rgba(255,255,255,0.82)",
                    lineHeight: 1.7,
                    fontSize: 15
                  }}
                >
                  {text.teaserSubtitle}
                </p>

                <div
                  style={{
                    marginTop: 20,
                    display: "grid",
                    gap: 12
                  }}
                >
                  <TeaserBullet text={text.feature1} />
                  <TeaserBullet text={text.feature2} />
                  <TeaserBullet text={text.feature3} />
                </div>

                <div
                  style={{
                    marginTop: 22,
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap"
                  }}
                >
                  <a
                    href={`/profile?lang=${locale}`}
                    style={{
                      textDecoration: "none",
                      borderRadius: 999,
                      padding: "12px 16px",
                      background: theme.colors.gold,
                      color: theme.colors.black,
                      fontWeight: 900,
                      border: "1px solid rgba(255,255,255,0.08)"
                    }}
                  >
                    {text.upgrade}
                  </a>

                  <a
                    href={`/items?lang=${locale}`}
                    style={{
                      textDecoration: "none",
                      borderRadius: 999,
                      padding: "12px 16px",
                      background: "rgba(255,255,255,0.08)",
                      color: "white",
                      fontWeight: 800,
                      border: "1px solid rgba(255,255,255,0.12)"
                    }}
                  >
                    {text.back}
                  </a>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gap: 12
                }}
              >
                <TeaserMetricCard
                  title={locale === "es" ? "Top movers" : "Top movers"}
                  value="+124.80 €"
                />
                <TeaserMetricCard
                  title={locale === "es" ? "Gap detectado" : "Gap detected"}
                  value="+18.4%"
                />
                <TeaserMetricCard
                  title={locale === "es" ? "Valor real mercado" : "Real market value"}
                  value="2,431.20 €"
                />
              </div>
            </div>
          </section>
        ) : (
          <MarketProContent
            cookieHeader={cookieHeader}
            category={category}
            locale={locale}
            theme={theme}
            text={text}
          />
        )}
      </div>
    </main>
  );
}

async function MarketProContent({
  cookieHeader,
  category,
  locale,
  theme,
  text
}: {
  cookieHeader: string;
  category?: string;
  locale: "en" | "es";
  theme: ReturnType<typeof getThemeById>;
  text: {
    trackedItems: string;
    baseValue: string;
    marketValue: string;
    totalGap: string;
    rising: string;
    dropping: string;
    biggestGaps: string;
    noData: string;
    first: string;
    latest: string;
    delta: string;
    estimated: string;
    market: string;
    gap: string;
  };
}) {
  const data = await getMarketOverview(cookieHeader, category);

  if (!data || data.summary.trackedItems === 0) {
    return (
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
    );
  }

  return (
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
  );
}

function TeaserBullet({ text }: { text: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        color: "rgba(255,255,255,0.9)"
      }}
    >
      <span style={{ color: "#D4AF37", fontSize: 16, lineHeight: 1.2 }}>✦</span>
      <span style={{ lineHeight: 1.6 }}>{text}</span>
    </div>
  );
}

function TeaserMetricCard({
  title,
  value
}: {
  title: string;
  value: string;
}) {
  return (
    <div
      style={{
        borderRadius: 20,
        padding: "18px 18px",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.10)",
        backdropFilter: "blur(6px)"
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: "rgba(255,255,255,0.68)",
          marginBottom: 8
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontWeight: 900,
          fontSize: 24,
          color: "#F8E08E"
        }}
      >
        {value}
      </div>
    </div>
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