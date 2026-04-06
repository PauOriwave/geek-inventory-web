import type { ReactNode } from "react";
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
import { AppThemeId, getThemeById } from "../theme";

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

const API = process.env.NEXT_PUBLIC_API_URL!;

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

async function getSummary(
  queryString: string,
  cookieHeader: string
): Promise<Summary> {
  const res = await fetch(`${API}/stats/summary${queryString}`, {
    cache: "no-store",
    headers: {
      cookie: cookieHeader
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch summary (${res.status}): ${text}`);
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

  const queryString = `?${params.toString()}`;

  const [itemsRes, summary] = await Promise.all([
    getItems(queryString, cookieHeader),
    getSummary(queryString, cookieHeader)
  ]);

  const items = itemsRes.items;
  const totalPages = Math.max(1, Math.ceil(itemsRes.total / itemsRes.pageSize));
  const currentPage = Math.min(Math.max(1, itemsRes.page), totalPages);

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
    actions: locale === "es" ? "Acciones" : "Actions"
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
      <div
        style={{
          maxWidth: 1380,
          margin: "0 auto"
        }}
      >
        <div
          style={{
            background: currentTheme.colors.black,
            color: "white",
            borderRadius: currentTheme.radius.xl,
            padding: "16px 20px",
            marginBottom: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            boxShadow: currentTheme.shadow.card
          }}
        >
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
              <div style={{ fontWeight: 800, fontSize: 18 }}>DrakoryVault</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.78)" }}>
                {locale === "es"
                  ? "El rastreador universal de colecciones"
                  : "The Universal Collection Tracker"}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
              justifyContent: "flex-end"
            }}
          >
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

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 320px)",
            gap: 18,
            alignItems: "start"
          }}
        >
          <div>
            <ActiveFilters
              q={q}
              category={category}
              minPrice={minPrice}
              maxPrice={maxPrice}
              locale={locale}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(160px, 1fr))",
                gap: 12,
                marginBottom: 14
              }}
            >
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

            <CollectionValueChart category={category} locale={locale} />
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

          <div style={{ position: "sticky", top: 16 }}>
            <TopItems category={category} locale={locale} />
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap"
          }}
        >
          <div
            style={{
              fontWeight: 800,
              fontSize: 15,
              color: currentTheme.colors.text
            }}
          >
            {text.collectionControls}
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap"
            }}
          >
            <ValuateAllButton />
            <ImportCsvButton />
            <ExportCsvButton />
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <Filters />
        </div>

        <div style={{ marginTop: 12 }}>
          <AddItemForm />
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
          <div
            style={{
              padding: "14px 16px",
              borderBottom: `1px solid ${currentTheme.colors.border}`,
              background: currentTheme.colors.surfaceAlt,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 15 }}>
              {text.collectionItems}
            </div>
            <div style={{ fontSize: 12, color: currentTheme.colors.textMuted }}>
              {text.totalRecords}
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
                {items.map((it) => (
                  <tr key={it.id}>
                    <Td currentTheme={currentTheme}>
                      <a
                        href={`/items/${it.id}?lang=${locale}`}
                        style={{
                          color: currentTheme.colors.text,
                          textDecoration: "none",
                          fontWeight: 700
                        }}
                      >
                        {it.name}
                      </a>
                    </Td>

                    <Td currentTheme={currentTheme}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 8px",
                          borderRadius: 999,
                          background: currentTheme.colors.surfaceAlt,
                          fontSize: 12,
                          color: currentTheme.colors.textMuted
                        }}
                      >
                        {getCategoryLabel(it.category, locale)}
                      </span>
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
                        initialQty={it.quantity}
                        initialPrice={Number(it.estimatedPrice)}
                        initialCondition={it.condition}
                        initialPlatform={it.platform}
                        initialCompleteness={it.completeness}
                        initialRegion={it.region}
                        initialNotes={it.notes}
                      />
                    </Td>
                  </tr>
                ))}

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

        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 16
          }}
        >
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
        boxShadow: currentTheme.shadow.soft
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
          color: currentTheme.colors.text
        }}
      >
        {value}
      </div>
    </div>
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
        background: currentTheme.colors.surfaceAlt
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
        verticalAlign: "top"
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