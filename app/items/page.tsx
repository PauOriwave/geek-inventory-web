import type { ReactNode } from "react";
import Filters from "./Filters";
import AddItemForm from "./AddItemForm";
import ItemActions from "./ItemActions";
import CategoryStats from "./CategoryStats";
import ActiveFilters from "./ActiveFilters";
import TopItems from "./TopItems";

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
  if (!res.ok) throw new Error("Failed to fetch items");
  return res.json();
}

async function getSummary(queryString: string): Promise<Summary> {
  const res = await fetch(`${API}/stats/summary${queryString}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch summary");
  return res.json();
}

export default async function ItemsPage({
  searchParams
}: {
  searchParams?:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
}) {
  const sp = searchParams instanceof Promise ? await searchParams : searchParams ?? {};

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
  params.set("pageSize", String(Number.isFinite(pageSize) && pageSize >= 5 ? pageSize : 25));

  const queryString = `?${params.toString()}`;

  const [itemsRes, summary] = await Promise.all([
    getItems(queryString),
    getSummary(queryString)
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

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 360px",
          gap: 16,
          alignItems: "start"
        }}
      >
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
            Geek Inventory
          </h1>

          <ActiveFilters
            q={q}
            category={category}
            minPrice={minPrice}
            maxPrice={maxPrice}
          />

          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 10,
              flexWrap: "wrap"
            }}
          >
            <Stat label="Items" value={summary.totalItems} />
            <Stat label="Units" value={summary.totalUnits} />
            <Stat label="Total value" value={`${summary.totalValue.toFixed(2)} €`} />
          </div>

          <p style={{ color: "#6b7280", marginTop: 6 }}>
            Showing {items.length} item(s) on this page — {itemsRes.total} total
          </p>

          <CategoryStats />
        </div>

        <div style={{ position: "sticky", top: 16 }}>
          <TopItems />
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <Filters />
        <AddItemForm />
      </div>

      <div style={{ marginTop: 16, overflowX: "auto" }}>
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
                      color: "#111827",
                      textDecoration: "none",
                      fontWeight: 700
                    }}
                  >
                    {it.name}
                  </a>
                </Td>

                <Td>{it.category}</Td>

                <Td align="right">{Number(it.estimatedPrice).toFixed(2)} €</Td>

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
                <td colSpan={6} style={{ padding: 12, color: "#6b7280" }}>
                  No items match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 14 }}>
        <a
          href={prevHref}
          style={{
            pointerEvents: currentPage === 1 ? "none" : "auto",
            opacity: currentPage === 1 ? 0.4 : 1
          }}
        >
          Prev
        </a>

        <div style={{ color: "#6b7280" }}>
          Page {currentPage} / {totalPages} — pageSize {itemsRes.pageSize}
        </div>

        <a
          href={nextHref}
          style={{
            pointerEvents: currentPage === totalPages ? "none" : "auto",
            opacity: currentPage === totalPages ? 0.4 : 1
          }}
        >
          Next
        </a>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: "10px 12px",
        minWidth: 140
      }}
    >
      <div style={{ fontSize: 12, color: "#6b7280" }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>{value}</div>
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
        borderBottom: "1px solid #e5e7eb",
        padding: 10,
        fontSize: 12,
        color: "#6b7280"
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
        borderBottom: "1px solid #f3f4f6",
        padding: 10,
        verticalAlign: "top"
      }}
    >
      {children}
    </td>
  );
}