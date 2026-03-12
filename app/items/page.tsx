import type { ReactNode } from "react";
import Filters from "./Filters";
import AddItemForm from "./AddItemForm";
import ItemActions from "./ItemActions";
import ActiveFilters from "./ActiveFilters";
import TopItems from "./TopItems";
import CategoryStats from "./CategoryStats";
import { theme } from "../theme";

type Item = {
  id: string;
  name: string;
  category: string;
  estimatedPrice: string | number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
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

async function getItems(queryString: string): Promise<ItemsResponse> {
  const res = await fetch(`${API}/items${queryString}`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error("Failed to fetch items");
  }

  return res.json();
}

async function getSummary(queryString: string): Promise<Summary> {
  const res = await fetch(`${API}/stats/summary${queryString}`, {
    cache: "no-store"
  });

  if (!res.ok) {
    throw new Error("Failed to fetch summary");
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
  const sp =
    searchParams instanceof Promise ? await searchParams : searchParams ?? {};

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

  params.set("page", String(Number.isFinite(page) && page >= 1 ? page : 1));
  params.set(
    "pageSize",
    String(Number.isFinite(pageSize) && pageSize >= 5 ? pageSize : 25)
  );

  const queryString = `?${params.toString()}`;

  const [itemsRes, summary] = await Promise.all([
    getItems(queryString),
    getSummary(queryString)
  ]);

  const items = itemsRes.items;

  const totalPages = Math.max(
    1,
    Math.ceil(itemsRes.total / itemsRes.pageSize)
  );

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
      <div
        style={{
          background: theme.colors.black,
          color: "white",
          borderRadius: theme.radius.xl,
          padding: "16px 20px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 12,
          boxShadow: theme.shadow.card
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 999,
            background: theme.colors.gold,
            color: theme.colors.black,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 18
          }}
        >
          D
        </div>

        <div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>DrakoryVault</div>
          <div style={{ fontSize: 12, color: "#D1D5DB" }}>
            The Universal Collection Tracker
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 320px",
          gap: 16,
          alignItems: "start"
        }}
      >
        <div>
          <ActiveFilters
            q={q}
            category={category}
            minPrice={minPrice}
            maxPrice={maxPrice}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(140px, 1fr))",
              gap: 12,
              marginBottom: 12
            }}
          >
            <Stat label="Items" value={summary.totalItems} />
            <Stat label="Units" value={summary.totalUnits} />
            <Stat
              label="Total value"
              value={`${summary.totalValue.toFixed(2)} €`}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <CategoryStats />
          </div>

          <p
            style={{
              color: theme.colors.textMuted,
              margin: "0 0 14px 0",
              fontSize: 14
            }}
          >
            Showing {items.length} item(s) on this page — {itemsRes.total} total
          </p>
        </div>

        <div style={{ position: "sticky", top: 16 }}>
          <TopItems />
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <Filters />
      </div>

      <div style={{ marginTop: 12 }}>
        <AddItemForm />
      </div>

      <section
        style={{
          marginTop: 18,
          background: theme.colors.surface,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radius.lg,
          overflow: "hidden",
          boxShadow: theme.shadow.card
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Category</Th>
                <Th align="right">Price</Th>
                <Th align="right">Qty</Th>
                <Th>Created</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>

            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <Td>
                    <a
                      href={`/items/${it.id}`}
                      style={{
                        color: theme.colors.text,
                        textDecoration: "none",
                        fontWeight: 700
                      }}
                    >
                      {it.name}
                    </a>
                  </Td>

                  <Td>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 8px",
                        borderRadius: 999,
                        background: "#F3F4F6",
                        fontSize: 12,
                        color: theme.colors.textMuted
                      }}
                    >
                      {it.category}
                    </span>
                  </Td>

                  <Td align="right">
                    {Number(it.estimatedPrice).toFixed(2)} €
                  </Td>

                  <Td align="right">{it.quantity}</Td>

                  <Td>{new Date(it.createdAt).toLocaleString()}</Td>

                  <Td align="right">
                    <ItemActions
                      id={it.id}
                      initialQty={it.quantity}
                      initialPrice={Number(it.estimatedPrice)}
                    />
                  </Td>
                </tr>
              ))}

              {items.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: 18,
                      color: theme.colors.textMuted
                    }}
                  >
                    No items match these filters.
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
            color: theme.colors.text,
            padding: "8px 12px",
            borderRadius: theme.radius.sm,
            border: `1px solid ${theme.colors.border}`,
            background: theme.colors.surface
          }}
        >
          Prev
        </a>

        <div style={{ color: theme.colors.textMuted, fontSize: 14 }}>
          Page {currentPage} / {totalPages}
        </div>

        <a
          href={nextHref}
          style={{
            pointerEvents: currentPage === totalPages ? "none" : "auto",
            opacity: currentPage === totalPages ? 0.4 : 1,
            textDecoration: "none",
            color: theme.colors.text,
            padding: "8px 12px",
            borderRadius: theme.radius.sm,
            border: `1px solid ${theme.colors.border}`,
            background: theme.colors.surface
          }}
        >
          Next
        </a>
      </div>
    </main>
  );
}

function Stat({
  label,
  value
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div
      style={{
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.lg,
        padding: "14px 16px",
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
          fontSize: 22,
          fontWeight: 800,
          color: theme.colors.text
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Th({
  children,
  align
}: {
  children: ReactNode;
  align?: "left" | "right";
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
  align
}: {
  children: ReactNode;
  align?: "left" | "right";
}) {
  return (
    <td
      style={{
        textAlign: align ?? "left",
        padding: 12,
        borderBottom: "1px solid #F3F4F6",
        background: theme.colors.surface,
        verticalAlign: "top"
      }}
    >
      {children}
    </td>
  );
}