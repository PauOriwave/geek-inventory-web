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

async function getSnapshots(
  id: string,
  cookieHeader: string
): Promise<Snapshot[]> {
  const res = await fetch(`${API}/items/${id}/snapshots`, {
    cache: "no-store",
    headers: {
      cookie: cookieHeader
    }
  });

  if (!res.ok) {
    throw new Error("Failed to fetch snapshots");
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

  const [item, snapshots] = await Promise.all([
    getItem(resolvedParams.id, cookieHeader),
    getSnapshots(resolvedParams.id, cookieHeader)
  ]);

  const totalValue = Number(item.estimatedPrice) * item.quantity;
  const marketValue =
    item.marketValue != null ? Number(item.marketValue) : null;
  const marketDelta =
    marketValue != null ? marketValue - Number(item.estimatedPrice) : null;

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
            <InfoCard
              label="Market value"
              value={marketValue != null ? `${marketValue.toFixed(2)} €` : "—"}
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
            <InfoCard
              label="Valuation delta"
              value={
                marketDelta != null
                  ? `${marketDelta > 0 ? "+" : ""}${marketDelta.toFixed(2)} €`
                  : "—"
              }
            />
            <InfoCard label="Valuation source" value={item.valuationSource || "—"} />
            <InfoCard
              label="Confidence"
              value={
                item.valuationConfidence != null
                  ? `${Math.round(item.valuationConfidence * 100)}%`
                  : "—"
              }
            />
            <InfoCard
              label="Last valuation"
              value={
                item.lastValuationAt
                  ? new Date(item.lastValuationAt).toLocaleString()
                  : "—"
              }
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

        <section
          style={{
            marginTop: 18,
            background: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.radius.xl,
            padding: 22,
            boxShadow: theme.shadow.card
          }}
        >
          <div
            style={{
              fontWeight: 800,
              fontSize: 18,
              marginBottom: 14
            }}
          >
            Valuation history
          </div>

          {snapshots.length === 0 ? (
            <div style={{ color: theme.colors.textMuted }}>
              No valuation history yet.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {snapshots.map((snapshot, index) => {
                const currentValue = Number(snapshot.marketValue);
                const previousValue =
                  index < snapshots.length - 1
                    ? Number(snapshots[index + 1].marketValue)
                    : null;

                const delta =
                  previousValue != null ? currentValue - previousValue : null;

                return (
                  <div
                    key={snapshot.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto auto auto",
                      gap: 12,
                      alignItems: "center",
                      padding: "12px 14px",
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: theme.radius.lg,
                      background: theme.colors.surfaceAlt
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>
                        {new Date(snapshot.recordedAt).toLocaleString()}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: theme.colors.textMuted,
                          marginTop: 2
                        }}
                      >
                        Source: {snapshot.source}
                        {snapshot.confidence != null
                          ? ` · ${Math.round(snapshot.confidence * 100)}% confidence`
                          : ""}
                      </div>
                    </div>

                    <div
                      style={{
                        fontWeight: 800,
                        minWidth: 90,
                        textAlign: "right"
                      }}
                    >
                      {currentValue.toFixed(2)} €
                    </div>

                    <div style={{ minWidth: 80, textAlign: "right" }}>
                      <SnapshotDeltaBadge delta={delta} />
                    </div>

                    <div
                      style={{
                        fontSize: 12,
                        color: theme.colors.textMuted,
                        minWidth: 70,
                        textAlign: "right"
                      }}
                    >
                      #{snapshots.length - index}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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

function SnapshotDeltaBadge({ delta }: { delta: number | null }) {
  if (delta == null) {
    return <span style={{ color: theme.colors.textMuted }}>—</span>;
  }

  const positive = delta > 0;
  const negative = delta < 0;

  const bg = positive ? "#ECFDF3" : negative ? "#FEF3F2" : "#F9FAFB";

  const color = positive
    ? "#027A48"
    : negative
      ? "#B42318"
      : theme.colors.textMuted;

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
        border: `1px solid ${theme.colors.border}`
      }}
    >
      {prefix}
      {delta.toFixed(2)} €
    </span>
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