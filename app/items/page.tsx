import { Fragment, type ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Filters from "./Filters";
import AddItemForm from "./AddItemForm";
import ImportCsvButton from "./ImportCsvButton";
import ExportCsvButton from "./ExportCsvButton";
import ValuateAllButton from "./ValuateAllButton";
import ItemActions from "./ItemActions";
import ActiveFilters from "./ActiveFilters";
import TopItems from "./TopItems";
import CategoryStats from "./CategoryStats";
import CollectionValueChart from "./CollectionValueChart";
import TrendingItems from "./TrendingItems";
import LogoutButton from "./LogoutButton";
import { getLocale } from "../i18n";
import { getCategoryLabel } from "./categoryLabels";
import { getCategoryVisual } from "./categoryVisuals";
import { AppThemeId, getThemeById } from "../theme";
import { getCollectorLevelData } from "../lib/collector-level";
import UserBadge from "../components/UserBadge";

type Item = {
  id: string;
  name: string;
  category: string;
  estimatedPrice: string | number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  condition?: string | null;
  notes?: string | null;
  platform?: string | null;
  completeness?: string | null;
  region?: string | null;
  marketValue?: string | number | null;
  valuationSource?: string | null;
  valuationConfidence?: number | null;
  lastValuationAt?: string | null;
};

type Snapshot = {
  id: string;
  source: string;
  marketValue: string | number;
  confidence?: number | null;
  recordedAt: string;
};

type Summary = {
  totalItems: number;
  totalUnits: number;
  totalValue: number;
};

type ItemsResponse = {
  items: Item[];
  total: number;
  page: number;
  pageSize: number;
};

type Achievement = {
  id: string;
  unlocked: boolean;
  progress: number;
  target: number;
  icon: string;
};

type Me = {
  id: string;
  email?: string;
  createdAt?: string;
  plan?: string;
  premiumStartedAt?: string | null;
};

type ChartRange = "7d" | "30d" | "90d" | "all";
type ChartSeries = "all" | "base" | "market";

const API = process.env.NEXT_PUBLIC_API_URL!;

function parseChartRange(value: unknown): ChartRange {
  if (value === "7d" || value === "30d" || value === "90d") {
    return value;
  }

  return "all";
}

function parseChartSeries(value: unknown): ChartSeries {
  if (value === "base" || value === "market") {
    return value;
  }

  return "all";
}

function hasMarketProAccess(plan?: string | null) {
  if (!plan) return false;

  const normalized = plan.toLowerCase().trim();

  return (
    normalized === "market_pro" ||
    normalized === "market-pro" ||
    normalized === "marketpro"
  );
}

async function getItems(
  queryString: string,
  cookieHeader: string
): Promise<ItemsResponse> {
  const res = await fetch(`${API}/items${queryString}`, {
    cache: "no-store",
    headers: {
      cookie: cookieHeader
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch items (${res.status}): ${text}`);
  }

  return res.json();
}

async function getItemSnapshots(
  id: string,
  cookieHeader: string
): Promise<Snapshot[]> {
  try {
    const res = await fetch(`${API}/items/${id}/snapshots`, {
      cache: "no-store",
      headers: {
        cookie: cookieHeader
      }
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function buildSummaryFromItems(items: Item[]): Summary {
  return {
    totalItems: items.length,
    totalUnits: items.reduce(
      (acc, item) => acc + (Number(item.quantity) || 0),
      0
    ),
    totalValue: items.reduce(
      (acc, item) =>
        acc +
        (Number(item.estimatedPrice) || 0) * (Number(item.quantity) || 0),
      0
    )
  };
}

async function getSummary(
  queryString: string,
  cookieHeader: string,
  fallbackItems: Item[]
): Promise<Summary> {
  try {
    const res = await fetch(`${API}/stats/summary${queryString}`, {
      cache: "no-store",
      headers: {
        cookie: cookieHeader
      }
    });

    if (!res.ok) {
      return buildSummaryFromItems(fallbackItems);
    }

    return res.json();
  } catch {
    return buildSummaryFromItems(fallbackItems);
  }
}

async function getAchievements(cookieHeader: string): Promise<Achievement[]> {
  const res = await fetch(`${API}/achievements`, {
    cache: "no-store",
    headers: {
      cookie: cookieHeader
    }
  });

  if (!res.ok) {
    return [];
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function getMe(cookieHeader: string): Promise<Me | null> {
  const res = await fetch(`${API}/auth/me`, {
    cache: "no-store",
    headers: {
      cookie: cookieHeader
    }
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export default async function ItemsPage({
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
  const currentTheme = getThemeById(themeId);

  const sp =
    searchParams instanceof Promise ? await searchParams : searchParams ?? {};

  const locale = getLocale(sp);

  const q = typeof sp.q === "string" ? sp.q : undefined;
  const category = typeof sp.category === "string" ? sp.category : undefined;
  const sort = typeof sp.sort === "string" ? sp.sort : undefined;
  const minPrice = typeof sp.minPrice === "string" ? sp.minPrice : undefined;
  const maxPrice = typeof sp.maxPrice === "string" ? sp.maxPrice : undefined;

  const page = typeof sp.page === "string" ? Number(sp.page) : 1;
  const pageSize = typeof sp.pageSize === "string" ? Number(sp.pageSize) : 25;

  const chartRange = parseChartRange(
    typeof sp.chartRange === "string" ? sp.chartRange : undefined
  );
  const chartSeries = parseChartSeries(
    typeof sp.chartSeries === "string" ? sp.chartSeries : undefined
  );

  const params = new URLSearchParams();

  if (q) params.set("q", q);
  if (category) params.set("category", category);
  if (sort) params.set("sort", sort);
  if (minPrice) params.set("minPrice", minPrice);
  if (maxPrice) params.set("maxPrice", maxPrice);

  params.set("lang", locale);
  params.set("page", String(Number.isFinite(page) && page >= 1 ? page : 1));
  params.set(
    "pageSize",
    String(Number.isFinite(pageSize) && pageSize >= 5 ? pageSize : 25)
  );
  params.set("chartRange", chartRange);
  params.set("chartSeries", chartSeries);

  const queryString = `?${params.toString()}`;

  const [itemsRes, achievements, me] = await Promise.all([
    getItems(queryString, cookieHeader),
    getAchievements(cookieHeader),
    getMe(cookieHeader)
  ]);

  const [summary, snapshotEntries] = await Promise.all([
    getSummary(queryString, cookieHeader, itemsRes.items),
    Promise.all(
      itemsRes.items.map(async (item) => [
        item.id,
        await getItemSnapshots(item.id, cookieHeader)
      ] as const)
    )
  ]);

  const snapshotsByItemId = new Map<string, Snapshot[]>(snapshotEntries);

  const safeAchievements = Array.isArray(achievements) ? achievements : [];
  const unlockedAchievements = safeAchievements.filter((a) => a.unlocked).length;

  const collectorLevel = getCollectorLevelData({
    totalItems: summary.totalItems,
    unlockedAchievements,
    locale
  });

  const items = itemsRes.items;
  const totalPages = Math.max(1, Math.ceil(itemsRes.total / itemsRes.pageSize));
  const currentPage = Math.min(Math.max(1, itemsRes.page), totalPages);
  const marketProAccess = hasMarketProAccess(me?.plan);

  const baseParams = Object.fromEntries(params.entries());

  const prevHref = `/items?${new URLSearchParams({
    ...baseParams,
    page: String(Math.max(1, currentPage - 1))
  }).toString()}`;

  const nextHref = `/items?${new URLSearchParams({
    ...baseParams,
    page: String(Math.min(totalPages, currentPage + 1))
  }).toString()}`;

  const langEsHref = `/items?${new URLSearchParams({
    ...baseParams,
    lang: "es"
  }).toString()}`;

  const langEnHref = `/items?${new URLSearchParams({
    ...baseParams,
    lang: "en"
  }).toString()}`;

  const marketProHref = `/market-pro?${new URLSearchParams({
    lang: locale,
    ...(category ? { category } : {})
  }).toString()}`;

  const text = {
    dashboard:
      locale === "es" ? "Panel de colección" : "Collection dashboard",
    collectionControls:
      locale === "es" ? "Controles de colección" : "Collection controls",
    collectionItems:
      locale === "es" ? "Objetos de la colección" : "Collection items",
    totalRecords:
      locale === "es"
        ? `${itemsRes.total} registros totales`
        : `${itemsRes.total} total records`,
    showing:
      locale === "es"
        ? `Mostrando ${items.length} objeto(s) en esta página — ${itemsRes.total} en total`
        : `Showing ${items.length} item(s) on this page — ${itemsRes.total} total`,
    noItems:
      locale === "es"
        ? "No hay objetos que coincidan con estos filtros."
        : "No items match these filters.",
    prev: locale === "es" ? "Anterior" : "Prev",
    next: locale === "es" ? "Siguiente" : "Next",
    page: locale === "es" ? "Página" : "Page",
    items: locale === "es" ? "Objetos" : "Items",
    units: locale === "es" ? "Unidades" : "Units",
    totalValue: locale === "es" ? "Valor total" : "Total value",
    name: locale === "es" ? "Nombre" : "Name",
    category: locale === "es" ? "Categoría" : "Category",
    platform: locale === "es" ? "Plataforma" : "Platform",
    region: locale === "es" ? "Región" : "Region",
    condition: locale === "es" ? "Estado" : "Condition",
    completeness: locale === "es" ? "Completitud" : "Completeness",
    price: locale === "es" ? "Precio" : "Price",
    market: locale === "es" ? "Mercado" : "Market",
    qty: locale === "es" ? "Cant." : "Qty",
    created: locale === "es" ? "Creado" : "Created",
    actions: locale === "es" ? "Acciones" : "Actions",
    level: locale === "es" ? "Nivel" : "Level",
    pointsToNext:
      locale === "es" ? "pts para subir" : "pts to level up",
    marketProLocked: "Market Pro",
    marketProTitle:
      locale === "es"
        ? "Desbloquea movers, gaps y análisis avanzado"
        : "Unlock movers, gaps and advanced market insights",
    pro: "PRO",
    trend:
      locale === "es" ? "Tendencia del item" : "Item trend",
    noTrend:
      locale === "es" ? "Sin historial suficiente" : "Not enough history"
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: currentTheme.colors.bg,
        color: currentTheme.colors.text,
        fontFamily: "system-ui",
        padding: 24
      }}
    >
      <style>{`
        .items-shell {
          max-width: 1380px;
          margin: 0 auto;
        }

        .items-header {
          background: ${currentTheme.colors.black};
          color: white;
          border-radius: ${currentTheme.radius.xl}px;
          padding: 16px 20px;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          box-shadow: ${currentTheme.shadow.card};
        }

        .items-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .items-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
          align-items: start;
        }

        .items-sidebar {
          position: static;
          top: auto;
        }

        .items-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
          margin-bottom: 14px;
        }

        .items-controls-row {
          margin-top: 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .items-controls-actions {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }

        .items-table-head {
          padding: 14px 16px;
          border-bottom: 1px solid ${currentTheme.colors.border};
          background: ${currentTheme.colors.surfaceAlt};
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .item-chart-row td {
          padding: 0 12px 12px 12px;
          background: ${currentTheme.colors.surface};
          border-bottom: 1px solid ${currentTheme.colors.border};
        }

        .items-pagination {
          display: flex;
          gap: 12px;
          align-items: center;
          justify-content: center;
          margin-top: 16px;
          flex-wrap: wrap;
        }

        @media (min-width: 1024px) {
          .items-layout {
            grid-template-columns: minmax(0, 1fr) minmax(280px, 320px);
          }

          .items-sidebar {
            position: sticky;
            top: 16px;
          }
        }

        @media (max-width: 767px) {
          .items-shell {
            max-width: 100%;
          }

          .items-header {
            padding: 14px;
            border-radius: ${currentTheme.radius.lg}px;
            align-items: flex-start;
            flex-direction: column;
          }

          .items-header-right {
            width: 100%;
            justify-content: flex-start;
          }

          .items-table-head {
            align-items: flex-start;
            flex-direction: column;
          }

          .items-controls-row {
            align-items: flex-start;
            flex-direction: column;
          }

          .items-controls-actions {
            width: 100%;
          }

          .items-pagination {
            justify-content: flex-start;
          }
        }
      `}</style>

      <div className="items-shell">
        <div className="items-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 999,
                background: currentTheme.colors.gold,
                color: currentTheme.colors.black,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 18,
                flexShrink: 0
              }}
            >
              D
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap"
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 18 }}>DrakoryVault</div>

                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "5px 10px",
                    borderRadius: 999,
                    background: currentTheme.colors.gold,
                    color: currentTheme.colors.black,
                    fontWeight: 900,
                    fontSize: 12
                  }}
                >
                  {text.level} {collectorLevel.level}
                </span>
              </div>

              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.78)" }}>
                {collectorLevel.currentTitle}
                {collectorLevel.nextLevel
                  ? ` · ${collectorLevel.pointsToNext} ${text.pointsToNext}`
                  : ""}
              </div>
            </div>
          </div>

          <div className="items-header-right">
            <UserBadge />

            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.78)",
                padding: "6px 10px",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 999
              }}
            >
              {text.dashboard}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <a
                href={langEnHref}
                style={{
                  ...langSwitchLink,
                  background:
                    locale === "en"
                      ? "rgba(255,255,255,0.14)"
                      : "transparent",
                  color: "white",
                  border:
                    locale === "en"
                      ? "1px solid rgba(255,255,255,0.18)"
                      : "1px solid rgba(255,255,255,0.10)"
                }}
              >
                EN
              </a>

              <a
                href={langEsHref}
                style={{
                  ...langSwitchLink,
                  background:
                    locale === "es"
                      ? "rgba(255,255,255,0.14)"
                      : "transparent",
                  color: "white",
                  border:
                    locale === "es"
                      ? "1px solid rgba(255,255,255,0.18)"
                      : "1px solid rgba(255,255,255,0.10)"
                }}
              >
                ES
              </a>
            </div>

            <a
              href={`/wishlist?lang=${locale}`}
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
              Wishlist
            </a>

            <a
              href={marketProHref}
              title={!marketProAccess ? text.marketProTitle : undefined}
              style={{
                textDecoration: "none",
                borderRadius: 999,
                padding: "8px 12px",
                background: marketProAccess
                  ? currentTheme.colors.gold
                  : "linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(255,255,255,0.06) 100%)",
                color: marketProAccess
                  ? currentTheme.colors.black
                  : "white",
                fontWeight: 900,
                border: marketProAccess
                  ? "1px solid rgba(255,255,255,0.12)"
                  : "1px solid rgba(212,175,55,0.26)",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow: marketProAccess
                  ? "none"
                  : "inset 0 1px 0 rgba(255,255,255,0.08)"
              }}
            >
              <span>{text.marketProLocked}</span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 900,
                  padding: "4px 6px",
                  borderRadius: 999,
                  background: marketProAccess
                    ? "rgba(0,0,0,0.10)"
                    : "rgba(212,175,55,0.18)",
                  color: marketProAccess
                    ? currentTheme.colors.black
                    : currentTheme.colors.gold,
                  letterSpacing: 0.4
                }}
              >
                {text.pro}
              </span>
              {!marketProAccess && (
                <span style={{ fontSize: 12, opacity: 0.86 }}>🔒</span>
              )}
            </a>

            <a
              href={`/profile?lang=${locale}`}
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
              {locale === "es" ? "Perfil" : "Profile"}
            </a>

            <LogoutButton />
          </div>
        </div>

        <div className="items-layout">
          <div>
            <ActiveFilters
              q={q}
              category={category}
              minPrice={minPrice}
              maxPrice={maxPrice}
              locale={locale}
            />

            <div className="items-stats">
              <StatCard
                label={text.items}
                value={summary.totalItems}
                currentTheme={currentTheme}
              />
              <StatCard
                label={text.units}
                value={summary.totalUnits}
                currentTheme={currentTheme}
              />
              <StatCard
                label={text.totalValue}
                value={`${summary.totalValue.toFixed(2)} €`}
                currentTheme={currentTheme}
              />
            </div>

            <CollectionValueChart
              category={category}
              locale={locale}
              initialChartRange={chartRange}
              initialChartSeries={chartSeries}
            />
            <TrendingItems category={category} locale={locale} />
            <CategoryStats locale={locale} />

            <p
              style={{
                color: currentTheme.colors.textMuted,
                margin: "14px 0 0 0",
                fontSize: 14
              }}
            >
              {text.showing}
            </p>
          </div>

          <div className="items-sidebar">
            <TopItems category={category} locale={locale} />
          </div>
        </div>

        <div className="items-controls-row">
          <div
            style={{
              fontWeight: 800,
              fontSize: 15,
              color: currentTheme.colors.text
            }}
          >
            {text.collectionControls}
          </div>

          <div className="items-controls-actions">
            <ValuateAllButton locale={locale} />
            <ImportCsvButton />
            <ExportCsvButton />
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <Filters />
        </div>

        <div style={{ marginTop: 12 }}>
          <AddItemForm
            locale={locale}
            plan={me?.plan ?? "free"}
            currentCount={summary.totalItems}
          />
        </div>

        <section
          style={{
            marginTop: 18,
            background: currentTheme.colors.surface,
            border: `1px solid ${currentTheme.colors.border}`,
            borderRadius: currentTheme.radius.xl,
            overflow: "hidden",
            boxShadow: currentTheme.shadow.card
          }}
        >
          <div className="items-table-head">
            <div style={{ fontWeight: 800, fontSize: 15 }}>
              {text.collectionItems}
            </div>
            <div style={{ fontSize: 12, color: currentTheme.colors.textMuted }}>
              {text.totalRecords}
            </div>
          </div>

          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <table
              style={{ width: "100%", borderCollapse: "collapse", minWidth: 980 }}
            >
              <thead>
                <tr>
                  <Th currentTheme={currentTheme}>{text.name}</Th>
                  <Th currentTheme={currentTheme}>{text.category}</Th>
                  <Th currentTheme={currentTheme}>{text.platform}</Th>
                  <Th currentTheme={currentTheme}>{text.region}</Th>
                  <Th currentTheme={currentTheme}>{text.condition}</Th>
                  <Th currentTheme={currentTheme}>{text.completeness}</Th>
                  <Th align="right" currentTheme={currentTheme}>
                    {text.price}
                  </Th>
                  <Th align="right" currentTheme={currentTheme}>
                    {text.market}
                  </Th>
                  <Th align="right" currentTheme={currentTheme}>
                    Δ
                  </Th>
                  <Th align="right" currentTheme={currentTheme}>
                    {text.qty}
                  </Th>
                  <Th currentTheme={currentTheme}>{text.created}</Th>
                  <Th align="right" currentTheme={currentTheme}>
                    {text.actions}
                  </Th>
                </tr>
              </thead>

              <tbody>
                {items.map((it) => {
                  const snapshots = snapshotsByItemId.get(it.id) ?? [];
                  const categoryVisual = getCategoryVisual(it.category);
                  const categoryLabel = getCategoryLabel(it.category, locale);

                  return (
                    <Fragment key={it.id}>
                      <tr>
                        <Td currentTheme={currentTheme}>
                          <a
                            href={`/items/${it.id}?lang=${locale}`}
                            style={{
                              color: currentTheme.colors.text,
                              textDecoration: "none",
                              fontWeight: 800,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 9,
                              minWidth: 0
                            }}
                          >
                            <span
                              aria-hidden="true"
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: 10,
                                background: categoryVisual.background,
                                color: categoryVisual.color,
                                border: `1px solid ${categoryVisual.color}33`,
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 16,
                                flexShrink: 0
                              }}
                            >
                              {categoryVisual.icon}
                            </span>

                            <span>{it.name}</span>
                          </a>
                        </Td>

                        <Td currentTheme={currentTheme}>
                          <CategoryBadge
                            category={it.category}
                            label={categoryLabel}
                            currentTheme={currentTheme}
                          />
                        </Td>

                        <Td currentTheme={currentTheme}>{it.platform || "—"}</Td>
                        <Td currentTheme={currentTheme}>{it.region || "—"}</Td>

                        <Td currentTheme={currentTheme}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "4px 8px",
                              borderRadius: 999,
                              background: currentTheme.colors.surfaceAlt,
                              fontSize: 12,
                              color: currentTheme.colors.textMuted,
                              border: `1px solid ${currentTheme.colors.border}`
                            }}
                          >
                            {formatCondition(it.condition)}
                          </span>
                        </Td>

                        <Td currentTheme={currentTheme}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "4px 8px",
                              borderRadius: 999,
                              background: currentTheme.colors.surfaceAlt,
                              fontSize: 12,
                              color: currentTheme.colors.textMuted,
                              border: `1px solid ${currentTheme.colors.border}`
                            }}
                          >
                            {formatCompleteness(it.completeness)}
                          </span>
                        </Td>

                        <Td align="right" currentTheme={currentTheme}>
                          {Number(it.estimatedPrice).toFixed(2)} €
                        </Td>

                        <Td align="right" currentTheme={currentTheme}>
                          {it.marketValue != null
                            ? `${Number(it.marketValue).toFixed(2)} €`
                            : "—"}
                        </Td>

                        <Td align="right" currentTheme={currentTheme}>
                          <DeltaBadge
                            estimatedPrice={Number(it.estimatedPrice)}
                            marketValue={
                              it.marketValue != null ? Number(it.marketValue) : null
                            }
                            currentTheme={currentTheme}
                          />
                        </Td>

                        <Td align="right" currentTheme={currentTheme}>
                          {it.quantity}
                        </Td>

                        <Td currentTheme={currentTheme}>
                          {new Date(it.createdAt).toLocaleString()}
                        </Td>

                        <Td align="right" currentTheme={currentTheme}>
                          <ItemActions
                            id={it.id}
                            category={it.category}
                            initialQty={it.quantity}
                            initialPrice={Number(it.estimatedPrice)}
                            initialCondition={it.condition}
                            initialPlatform={it.platform}
                            initialCompleteness={it.completeness}
                            initialRegion={it.region}
                            initialNotes={it.notes}
                            locale={locale}
                          />
                        </Td>
                      </tr>

                      <tr className="item-chart-row">
                        <td colSpan={12}>
                          <MiniItemTrendChart
                            snapshots={snapshots}
                            currentTheme={currentTheme}
                            locale={locale}
                            title={text.trend}
                            emptyLabel={text.noTrend}
                          />
                        </td>
                      </tr>
                    </Fragment>
                  );
                })}

                {items.length === 0 && (
                  <tr>
                    <td
                      colSpan={12}
                      style={{
                        padding: 18,
                        color: currentTheme.colors.textMuted
                      }}
                    >
                      {text.noItems}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="items-pagination">
          <a
            href={prevHref}
            style={{
              pointerEvents: currentPage === 1 ? "none" : "auto",
              opacity: currentPage === 1 ? 0.4 : 1,
              textDecoration: "none",
              color: currentTheme.colors.text,
              padding: "8px 12px",
              borderRadius: currentTheme.radius.sm,
              border: `1px solid ${currentTheme.colors.border}`,
              background: currentTheme.colors.surface
            }}
          >
            {text.prev}
          </a>

          <div style={{ color: currentTheme.colors.textMuted, fontSize: 14 }}>
            {text.page} {currentPage} / {totalPages}
          </div>

          <a
            href={nextHref}
            style={{
              pointerEvents: currentPage === totalPages ? "none" : "auto",
              opacity: currentPage === totalPages ? 0.4 : 1,
              textDecoration: "none",
              color: currentTheme.colors.text,
              padding: "8px 12px",
              borderRadius: currentTheme.radius.sm,
              border: `1px solid ${currentTheme.colors.border}`,
              background: currentTheme.colors.surface
            }}
          >
            {text.next}
          </a>
        </div>
      </div>
    </main>
  );
}

function CategoryBadge({
  category,
  label,
  currentTheme
}: {
  category: string;
  label: string;
  currentTheme: ReturnType<typeof getThemeById>;
}) {
  const visual = getCategoryVisual(category);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 9px",
        borderRadius: 999,
        background: visual.background,
        color: visual.color,
        border: `1px solid ${visual.color}33`,
        fontSize: 12,
        fontWeight: 900,
        whiteSpace: "nowrap",
        boxShadow: `inset 0 1px 0 ${currentTheme.colors.surface}`
      }}
    >
      <span aria-hidden="true">{visual.icon}</span>
      <span>{label}</span>
    </span>
  );
}

function StatCard({
  label,
  value,
  currentTheme
}: {
  label: string;
  value: string | number;
  currentTheme: ReturnType<typeof getThemeById>;
}) {
  return (
    <div
      style={{
        background: currentTheme.colors.surface,
        border: `1px solid ${currentTheme.colors.border}`,
        borderRadius: currentTheme.radius.lg,
        padding: "16px 18px",
        boxShadow: currentTheme.shadow.soft,
        minWidth: 0
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
          fontSize: 24,
          fontWeight: 800,
          color: currentTheme.colors.text,
          wordBreak: "break-word"
        }}
      >
        {value}
      </div>
    </div>
  );
}

function MiniItemTrendChart({
  snapshots,
  currentTheme,
  locale,
  title,
  emptyLabel
}: {
  snapshots: Snapshot[];
  currentTheme: ReturnType<typeof getThemeById>;
  locale: "en" | "es";
  title: string;
  emptyLabel: string;
}) {
  const points = [...snapshots]
    .sort(
      (a, b) =>
        new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
    )
    .map((snapshot) => ({
      value: Number(snapshot.marketValue),
      date: snapshot.recordedAt,
      source: snapshot.source
    }))
    .filter((point) => Number.isFinite(point.value));

  const latest = points.at(-1);
  const first = points[0];
  const delta = latest && first ? latest.value - first.value : null;
  const positive = delta != null && delta > 0;
  const negative = delta != null && delta < 0;

  const color = positive
    ? currentTheme.colors.success
    : negative
      ? currentTheme.colors.danger
      : currentTheme.colors.gold;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(180px, 240px) minmax(260px, 1fr)",
        gap: 12,
        alignItems: "center",
        border: `1px solid ${currentTheme.colors.border}`,
        borderRadius: currentTheme.radius.lg,
        padding: 12,
        background:
          "linear-gradient(180deg, rgba(200,164,77,0.08) 0%, rgba(255,255,255,0) 100%)"
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            color: currentTheme.colors.textMuted,
            fontWeight: 800,
            marginBottom: 6
          }}
        >
          {title}
        </div>

        {latest ? (
          <>
            <div
              style={{
                fontSize: 18,
                fontWeight: 900,
                color: currentTheme.colors.text
              }}
            >
              {latest.value.toFixed(2)} €
            </div>

            <div
              style={{
                marginTop: 6,
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                alignItems: "center"
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "4px 8px",
                  borderRadius: 999,
                  background: positive
                    ? "rgba(34,197,94,0.14)"
                    : negative
                      ? "rgba(244,63,94,0.14)"
                      : currentTheme.colors.surfaceAlt,
                  color,
                  border: `1px solid ${currentTheme.colors.border}`,
                  fontSize: 12,
                  fontWeight: 900
                }}
              >
                {delta != null
                  ? `${delta > 0 ? "+" : ""}${delta.toFixed(2)} €`
                  : "—"}
              </span>

              <span
                style={{
                  color: currentTheme.colors.textMuted,
                  fontSize: 12
                }}
              >
                {points.length} pts · {formatShortDate(latest.date, locale)}
              </span>
            </div>
          </>
        ) : (
          <div
            style={{
              color: currentTheme.colors.textMuted,
              fontSize: 13
            }}
          >
            {emptyLabel}
          </div>
        )}
      </div>

      <MiniSparkline
        points={points}
        color={color}
        currentTheme={currentTheme}
      />
    </div>
  );
}

function MiniSparkline({
  points,
  color,
  currentTheme
}: {
  points: { value: number; date: string; source: string }[];
  color: string;
  currentTheme: ReturnType<typeof getThemeById>;
}) {
  const width = 520;
  const height = 92;
  const paddingX = 10;
  const paddingY = 12;

  if (points.length < 2) {
    return (
      <div
        style={{
          height,
          borderRadius: currentTheme.radius.md,
          border: `1px dashed ${currentTheme.colors.border}`,
          background: currentTheme.colors.surface,
          display: "grid",
          placeItems: "center",
          color: currentTheme.colors.textMuted,
          fontSize: 12
        }}
      >
        —
      </div>
    );
  }

  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const coordinates = points.map((point, index) => {
    const x =
      paddingX + (index / (points.length - 1)) * (width - paddingX * 2);
    const y =
      paddingY +
      ((max - point.value) / range) * (height - paddingY * 2);

    return { ...point, x, y };
  });

  const linePath = coordinates
    .map((point, index) =>
      index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`
    )
    .join(" ");

  const areaPath = `${linePath} L ${
    coordinates[coordinates.length - 1].x
  } ${height - paddingY} L ${coordinates[0].x} ${height - paddingY} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Mini item valuation chart"
      style={{
        display: "block",
        width: "100%",
        height,
        borderRadius: currentTheme.radius.md,
        background: currentTheme.colors.surface,
        border: `1px solid ${currentTheme.colors.border}`
      }}
    >
      <defs>
        <linearGradient id="miniItemArea" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {[0, 1, 2].map((line) => {
        const y = paddingY + (line / 2) * (height - paddingY * 2);

        return (
          <line
            key={line}
            x1={paddingX}
            x2={width - paddingX}
            y1={y}
            y2={y}
            stroke={currentTheme.colors.border}
            strokeDasharray="4 7"
            strokeOpacity="0.7"
          />
        );
      })}

      <path d={areaPath} fill="url(#miniItemArea)" />

      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {coordinates.map((point, index) => (
        <circle
          key={`${point.date}-${index}`}
          cx={point.x}
          cy={point.y}
          r={index === coordinates.length - 1 ? 4.5 : 3}
          fill={currentTheme.colors.surface}
          stroke={color}
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}

function Th({
  children,
  align,
  currentTheme
}: {
  children: ReactNode;
  align?: "left" | "right";
  currentTheme: ReturnType<typeof getThemeById>;
}) {
  return (
    <th
      style={{
        textAlign: align ?? "left",
        padding: 12,
        fontSize: 12,
        color: currentTheme.colors.textMuted,
        borderBottom: `1px solid ${currentTheme.colors.border}`,
        background: currentTheme.colors.surfaceAlt,
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
  currentTheme
}: {
  children: ReactNode;
  align?: "left" | "right";
  currentTheme: ReturnType<typeof getThemeById>;
}) {
  return (
    <td
      style={{
        textAlign: align ?? "left",
        padding: 12,
        borderBottom: `1px solid ${currentTheme.colors.border}`,
        background: currentTheme.colors.surface,
        verticalAlign: "top",
        whiteSpace: "nowrap"
      }}
    >
      {children}
    </td>
  );
}

function formatCondition(value?: string | null) {
  if (!value) return "—";

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatCompleteness(value?: string | null) {
  if (!value) return "—";

  return value.toUpperCase();
}

function formatShortDate(value: string, locale: "en" | "es") {
  return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-GB", {
    day: "2-digit",
    month: "short"
  }).format(new Date(value));
}

function DeltaBadge({
  estimatedPrice,
  marketValue,
  currentTheme
}: {
  estimatedPrice: number;
  marketValue: number | null;
  currentTheme: ReturnType<typeof getThemeById>;
}) {
  if (marketValue == null) {
    return <span style={{ color: currentTheme.colors.textMuted }}>—</span>;
  }

  const delta = marketValue - estimatedPrice;
  const positive = delta > 0;
  const negative = delta < 0;

  const bg = positive
    ? "rgba(34,197,94,0.14)"
    : negative
      ? "rgba(244,63,94,0.14)"
      : currentTheme.colors.surfaceAlt;

  const color = positive
    ? currentTheme.colors.success
    : negative
      ? currentTheme.colors.danger
      : currentTheme.colors.textMuted;

  const prefix = positive ? "+" : "";

  return (
    <span
      style={{
        display: "inline-block",
        minWidth: 70,
        textAlign: "center",
        padding: "4px 8px",
        borderRadius: 999,
        background: bg,
        color,
        fontSize: 12,
        fontWeight: 700,
        border: `1px solid ${currentTheme.colors.border}`
      }}
    >
      {prefix}
      {delta.toFixed(2)} €
    </span>
  );
}

const langSwitchLink: React.CSSProperties = {
  textDecoration: "none",
  padding: "8px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 800
};