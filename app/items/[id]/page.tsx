import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { theme } from "../../theme";

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
};

const API = process.env.NEXT_PUBLIC_API_URL!;

async function getItem(id: string, cookieHeader: string): Promise<Item> {
  const res = await fetch(`${API}/items/${id}`, {
    cache: "no-store",
    headers: {
      cookie: cookieHeader
    }
  });

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
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const session = cookieStore.get("session")?.value;

  if (!session) {
    redirect("/login");
  }

  const resolvedParams = params instanceof Promise ? await params : params;
  const item = await getItem(resolvedParams.id, cookieHeader);

  const totalValue = Number(item.estimatedPrice) * item.quantity;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: theme.colors.bg,
        padding: 24,
        fontFamily: "system-ui",
        color: theme.colors.text
      }}
    >
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <a
          href="/items"
          style={{
            display: "inline-block",
            marginBottom: 16,
            textDecoration: "none",
            color: theme.colors.link,
            fontWeight: 700
          }}
        >
          ← Back to inventory
        </a>

        <section
          style={{
            background: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.radius.xl,
            padding: 22,
            boxShadow: theme.shadow.card
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "6px 10px",
              borderRadius: 999,
              background: "#F3F4F6",
              color: theme.colors.textMuted,
              fontSize: 12,
              marginBottom: 10
            }}
          >
            {item.category}
          </div>

          <h1
            style={{
              fontSize: 30,
              fontWeight: 800,
              margin: "0 0 18px 0"
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
              highlight
            />
            <InfoCard label="Category" value={item.category} />
          </div>

          <div
            style={{
              marginTop: 16,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12
            }}
          >
            <InfoCard label="Platform" value={item.platform || "—"} />
            <InfoCard label="Region" value={item.region || "—"} />
            <InfoCard label="Condition" value={formatCondition(item.condition)} />
            <InfoCard
              label="Completeness"
              value={formatCompleteness(item.completeness)}
            />
            <InfoCard label="Notes" value={item.notes?.trim() || "—"} />
          </div>

          <div
            style={{
              marginTop: 22,
              color: theme.colors.textMuted,
              fontSize: 14,
              lineHeight: 1.8,
              borderTop: `1px solid ${theme.colors.border}`,
              paddingTop: 16
            }}
          >
            <div>Created: {new Date(item.createdAt).toLocaleString()}</div>
            <div>Updated: {new Date(item.updatedAt).toLocaleString()}</div>
            <div>ID: {item.id}</div>
          </div>
        </section>
      </div>
    </main>
  );
}

function InfoCard({
  label,
  value,
  highlight = false
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.lg,
        padding: 14,
        background: theme.colors.surfaceAlt,
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
          color: highlight ? theme.colors.text : theme.colors.text
        }}
      >
        {value}
      </div>
    </div>
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