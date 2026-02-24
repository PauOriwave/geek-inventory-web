type Item = {
  id: string;
  name: string;
  category: string;
  estimatedPrice: string | number;
  quantity: number;
  createdAt: string;
};

type Summary = {
  totalItems: number;
  totalUnits: number;
  totalValue: number;
};

const API = process.env.NEXT_PUBLIC_API_URL!;

async function getItems(): Promise<Item[]> {
  const res = await fetch(`${API}/items`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch items");
  return res.json();
}

async function getSummary(): Promise<Summary> {
  const res = await fetch(`${API}/stats/summary`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch summary");
  return res.json();
}

export default async function ItemsPage() {
  const [items, summary] = await Promise.all([getItems(), getSummary()]);

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
        Geek Inventory
      </h1>

      <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
        <Stat label="Items" value={summary.totalItems} />
        <Stat label="Units" value={summary.totalUnits} />
        <Stat label="Total value" value={`${summary.totalValue.toFixed(2)} €`} />
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Category</Th>
              <Th align="right">Price</Th>
              <Th align="right">Qty</Th>
              <Th>Created</Th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <Td>{it.name}</Td>
                <Td>{it.category}</Td>
                <Td align="right">{Number(it.estimatedPrice).toFixed(2)} €</Td>
                <Td align="right">{it.quantity}</Td>
                <Td>{new Date(it.createdAt).toLocaleString()}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: "10px 12px",
      minWidth: 140
    }}>
      <div style={{ fontSize: 12, color: "#6b7280" }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function Th({ children, align }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th style={{
      textAlign: align ?? "left",
      borderBottom: "1px solid #e5e7eb",
      padding: 10,
      fontSize: 12,
      color: "#6b7280"
    }}>
      {children}
    </th>
  );
}

function Td({ children, align }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <td style={{
      textAlign: align ?? "left",
      borderBottom: "1px solid #f3f4f6",
      padding: 10
    }}>
      {children}
    </td>
  );
}