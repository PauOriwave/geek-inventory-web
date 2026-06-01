import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppThemeId, getThemeById } from "../theme";
import LogoutButton from "../items/LogoutButton";
import UserBadge from "../components/UserBadge";
import { getLocale } from "../i18n";
import { getCategoryLabel } from "../items/categoryLabels";
import MarketComparePanel from "./components/MarketComparePanel";
import MarketInsightsPanel from "./components/MarketInsightsPanel";

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
    const qs = category ? `?category=${encodeURIComponent(category)}` : "";

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
      locale === "es"
        ? "Piezas con datos de mercado"
        : "Items with market data",
    baseValue: locale === "es" ? "Valor base" : "Base value",
    marketValue: locale === "es" ? "Valor de mercado" : "Market value",
    totalGap:
      locale === "es" ? "Diferencia total" : "Total difference",
    rising: locale === "es" ? "Piezas calentándose" : "Heating Up",
    dropping: locale === "es" ? "Piezas enfriándose" : "Cooling Down",
    biggestGaps:
      locale === "es" ? "Mayor potencial oculto" : "Hidden Potential",
    noData:
      locale === "es"
        ? "Todavía no hay suficientes datos de mercado para esta vista."
        : "There is not enough market data for this view yet.",
    first: locale === "es" ? "Valor inicial" : "Initial value",
    latest: locale === "es" ? "Valor actual" : "Current value",
    delta: locale === "es" ? "Movimiento" : "Movement",
    estimated: locale === "es" ? "Valor base" : "Base value",
    market: locale === "es" ? "Mercado" : "Market",
    gap: locale === "es" ? "Diferencia" : "Difference",
    actions: locale === "es" ? "Acciones" : "Actions",
    viewItem: locale === "es" ? "Ver objeto" : "View item",
    compare: locale === "es" ? "Comparar" : "Compare",
    back: locale === "es" ? "Volver a colección" : "Back to collection",
    teaserTitle:
      locale === "es"
        ? "Desbloquea inteligencia real para tu colección"
        : "Unlock real collection intelligence",
    teaserSubtitle:
      locale === "es"
        ? "Market Pro te ayuda a detectar piezas que se calientan, objetos perdiendo interés y oportunidades ocultas dentro de tu colección."
        : "Market Pro helps you spot heating items, pieces losing hype and hidden opportunities inside your collection.",
    feature1:
      locale === "es"
        ? "Piezas calentándose y enfriándose"
        : "Heating up and cooling down items",
    feature2:
      locale === "es"
        ? "Potencial oculto entre tu valor base y el mercado"
        : "Hidden potential between your base value and the market",
    feature3:
      locale === "es"
        ? "Resumen avanzado del valor real de tu colección"
        : "Advanced overview of your real collection value",
    locked:
      locale === "es"
        ? "Disponible solo para usuarios Market Pro"
        : "Available only for Market Pro users",
    upgrade: locale === "es" ? "Ver planes en perfil" : "See plans in profile"
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
      <style>{`
        .marketpro-shell {
          max-width: 1320px;
          margin: 0 auto;
        }

        .marketpro-header {
          background: ${theme.colors.black};
          color: white;
          border-radius: ${theme.radius.xl}px;
          padding: 16px 20px;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          box-shadow: ${theme.shadow.card};
        }

        .marketpro-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .marketpro-teaser-grid {
          position: relative;
          display: grid;
          grid-template-columns: 1fr;
          gap: 22px;
          align-items: stretch;
        }

        .marketpro-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
          margin-bottom: 18px;
        }

        .marketpro-panels-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
          margin-bottom: 18px;
        }

        .marketpro-table-wrap {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .marketpro-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 820px;
        }

        @media (min-width: 1024px) {
          .marketpro-teaser-grid {
            grid-template-columns: minmax(0, 1.2fr) minmax(260px, 0.8fr);
          }

          .marketpro-panels-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 767px) {
          .marketpro-shell {
            max-width: 100%;
          }

          .marketpro-header {
            padding: 14px;
            border-radius: ${theme.radius.lg}px;
            align-items: flex-start;
            flex-direction: column;
          }

          .marketpro-header-actions {
            width: 100%;
            justify-content: flex-start;
          }
        }
      `}</style>

      <div className="marketpro-shell">
        <div className="marketpro-header">
          <div>
            <div style={{ fontWeight: 900, fontSize: 22 }}>{text.title}</div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.76)",
                marginTop: 4
              }}
            >
              {text.subtitle}
            </div>
          </div>

          <div className="marketpro-header-actions">
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

            <div className="marketpro-teaser-grid">
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
                  title={
                    locale === "es"
                      ? "Piezas calentándose"
                      : "Heating up"
                  }
                  value="+124.80 €"
                />
                <TeaserMetricCard
                  title={
                    locale === "es"
                      ? "Potencial oculto"
                      : "Hidden potential"
                  }
                  value="+18.4%"
                />
                <TeaserMetricCard
                  title={
                    locale === "es"
                      ? "Valor real de colección"
                      : "Real collection value"
                  }
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
            apiBaseUrl={API}
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
  text,
  apiBaseUrl
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
    actions: string;
    viewItem: string;
    compare: string;
  };
  apiBaseUrl: string;
}) {
  const data = await getMarketOverview(cookieHeader, category);

  if (!data || data.summary.trackedItems === 0) {
    return (
      <>
        <MarketComparePanel
          locale={locale}
          theme={theme}
          apiBaseUrl={apiBaseUrl}
        />

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
      </>
    );
  }

  return (
    <>
      <div className="marketpro-stats-grid">
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

      <MarketComparePanel
        locale={locale}
        theme={theme}
        apiBaseUrl={apiBaseUrl}
      />

      <MarketInsightsPanel data={data} locale={locale} theme={theme} />

      <div className="marketpro-panels-grid">
        <Panel theme={theme} title={text.rising}>
          <TrendTable
            rows={data.rising}
            locale={locale}
            theme={theme}
            emptyText={text.noData}
            firstLabel={text.first}
            latestLabel={text.latest}
            deltaLabel={text.delta}
            viewItemLabel={text.viewItem}
            compareLabel={text.compare}
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
            viewItemLabel={text.viewItem}
            compareLabel={text.compare}
          />
        </Panel>
      </div>

      <Panel theme={theme} title={text.biggestGaps}>
        <div className="marketpro-table-wrap">
          <table className="marketpro-table">
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
                <Th theme={theme} align="right">
                  {text.actions}
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
                  <Td theme={theme} align="right">
                    <ActionLinks
                      id={row.id}
                      locale={locale}
                      theme={theme}
                      viewItemLabel={text.viewItem}
                      compareLabel={text.compare}
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
  children: ReactNode;
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
        boxShadow: theme.shadow.soft,
        minWidth: 0
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
          color: accent ?? theme.colors.text,
          wordBreak: "break-word"
        }}
      >
        {value}
      </div>
      {subvalue ? (
        <div
          style={{
            marginTop: 6,
            fontSize: 12,
            color: theme.colors.textMuted
          }}
        >
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
  deltaLabel,
  viewItemLabel,
  compareLabel
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
  viewItemLabel: string;
  compareLabel: string;
}) {
  if (rows.length === 0) {
    return <div style={{ color: theme.colors.textMuted }}>{emptyText}</div>;
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {rows.map((row) => {
        const positive = row.delta > 0;

        return (
          <div
            key={row.id}
            style={{
              color: theme.colors.text,
              border: `1px solid ${theme.colors.border}`,
              background: theme.colors.surfaceAlt,
              borderRadius: 16,
              padding: 14,
              display: "grid",
              gap: 10
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
                flexWrap: "wrap"
              }}
            >
              <div style={{ minWidth: 0 }}>
                <a
                  href={`/items/${row.id}?lang=${locale}`}
                  style={{
                    textDecoration: "none",
                    color: theme.colors.text,
                    fontWeight: 900,
                    wordBreak: "break-word"
                  }}
                >
                  {row.name}
                </a>
                <div
                  style={{
                    fontSize: 12,
                    color: theme.colors.textMuted,
                    marginTop: 2
                  }}
                >
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
                gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
                gap: 8,
                fontSize: 12
              }}
            >
              <MiniMetric
                label={firstLabel}
                value={`${row.firstValue.toFixed(2)} €`}
                theme={theme}
              />
              <MiniMetric
                label={latestLabel}
                value={`${row.latestValue.toFixed(2)} €`}
                theme={theme}
              />
              <MiniMetric
                label={deltaLabel}
                value={`${row.delta >= 0 ? "+" : ""}${row.delta.toFixed(2)} €`}
                theme={theme}
              />
            </div>

            <ActionLinks
              id={row.id}
              locale={locale}
              theme={theme}
              viewItemLabel={viewItemLabel}
              compareLabel={compareLabel}
            />
          </div>
        );
      })}
    </div>
  );
}

function ActionLinks({
  id,
  locale,
  theme,
  viewItemLabel,
  compareLabel
}: {
  id: string;
  locale: "en" | "es";
  theme: ReturnType<typeof getThemeById>;
  viewItemLabel: string;
  compareLabel: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: 8,
        flexWrap: "wrap"
      }}
    >
      <a
        href={`/items/${id}?lang=${locale}`}
        style={{
          textDecoration: "none",
          borderRadius: 999,
          padding: "7px 10px",
          background: theme.colors.surface,
          color: theme.colors.text,
          border: `1px solid ${theme.colors.border}`,
          fontSize: 12,
          fontWeight: 900,
          whiteSpace: "nowrap"
        }}
      >
        {viewItemLabel} →
      </a>

      <a
        href={`/market-pro?lang=${locale}&compareA=${id}#market-compare`}
        style={{
          textDecoration: "none",
          borderRadius: 999,
          padding: "7px 10px",
          background: theme.colors.black,
          color: "white",
          border: `1px solid ${theme.colors.black}`,
          fontSize: 12,
          fontWeight: 900,
          whiteSpace: "nowrap"
        }}
      >
        {compareLabel} →
      </a>
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
        padding: "8px 10px",
        minWidth: 0
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: theme.colors.textMuted,
          marginBottom: 4
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontWeight: 800,
          wordBreak: "break-word"
        }}
      >
        {value}
      </div>
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
        fontWeight: 800,
        whiteSpace: "nowrap"
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
  children: ReactNode;
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
        background: theme.colors.surfaceAlt,
        whiteSpace: "nowrap"
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
  children: ReactNode;
  align?: "left" | "right";
  theme: ReturnType<typeof getThemeById>;
}) {
  return (
    <td
      style={{
        textAlign: align ?? "left",
        padding: 12,
        borderBottom: `1px solid ${theme.colors.border}`,
        background: theme.colors.surface,
        whiteSpace: "nowrap"
      }}
    >
      {children}
    </td>
  );
}