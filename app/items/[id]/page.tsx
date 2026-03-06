type Item = {
  id: string;
  name: string;
  category: string;
  estimatedPrice: string | number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
};

const API = process.env.NEXT_PUBLIC_API_URL!;

async function getItem(id: string): Promise<Item> {
  const res = await fetch(`${API}/items/${id}`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error("Failed to fetch item");
  }

  return res.json();
}

export default async function ItemDetailPage({
  params
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const item = await getItem(resolvedParams.id);

  const totalValue = Number(item.estimatedPrice) * item.quantity;

  return (
    <main
      style={{
        padding: 24,
        fontFamily: "system-ui",
        maxWidth: 900,
        margin: "0 auto"
      }}
    >
      <a
        href="/items"
        style={{
          display: "inline-block",
          marginBottom: 16,
          textDecoration: "none",
          color: "#2563eb"
        }}
      >
        ← Back to inventory
      </a>

      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          padding: 20,
          background: "white"
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: "#6b7280",
            marginBottom: 6
          }}
        >
          {item.category}
        </div>

        <h1
          style={{
            fontSize: 30,
            fontWeight: 800,
            marginBottom: 18
          }}
        >
          {item.name}
        </h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12
          }}
        >
          <InfoCard
            label="Price"
            value={`${Number(item.estimatedPrice).toFixed(2)} €`}
          />
          <InfoCard label="Quantity" value={item.quantity} />
          <InfoCard
            label="Total value"
            value={`${totalValue.toFixed(2)} €`}
          />
          <InfoCard label="Category" value={item.category} />
        </div>

        <div
          style={{
            marginTop: 20,
            color: "#6b7280",
            fontSize: 14
          }}
        >
          <div>Created: {new Date(item.createdAt).toLocaleString()}</div>
          <div>Updated: {new Date(item.updatedAt).toLocaleString()}</div>
          <div>ID: {item.id}</div>
        </div>
      </div>
    </main>
  );
}

function InfoCard({
  label,
  value
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 14
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: "#6b7280",
          marginBottom: 6
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 20,
          fontWeight: 800
        }}
      >
        {value}
      </div>
    </div>
  );
}