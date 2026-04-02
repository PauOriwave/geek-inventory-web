import { cookies } from "next/headers";
import { theme } from "../../theme";

type Snapshot = {
  id: string;
  source: string;
  marketValue: string | number;
  confidence?: number | null;
  recordedAt: string;
};

const API = process.env.NEXT_PUBLIC_API_URL!;

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
    throw new Error("Failed to fetch item snapshots");
  }

  return res.json();
}

export default async function ItemSnapshotsPanel({
  id,
  locale = "en"
}: {
  id: string;
  locale?: "en" | "es";
}) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const snapshots = await getSnapshots(id, cookieHeader);

  const text = {
    title: locale === "es" ? "Historial de valoraciones" : "Valuation history",
    subtitle:
      locale === "es"
        ? "Snapshots reales guardados cada vez que valoras el objeto"
        : "Real snapshots saved each time you valuate the item",
    noData:
      locale === "es"
        ? "Todavía no hay snapshots para este objeto."
        : "There are no snapshots for this item yet.",
    source: locale === "es" ? "Fuente" : "Source",
    value: locale === "es" ? "Valor" : "Value",
    confidence: locale === "es" ? "Confianza" : "Confidence",
    date: locale === "es" ? "Fecha" : "Date"
  };

  return (
    <section
      style={{
        marginTop: 18,
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.xl,
        padding: 18,
        boxShadow: theme.shadow.card
      }}
    >
      <div
        style={{
          marginBottom: 14
        }}
      >
        <div
          style={{
            fontWeight: 800,
            fontSize: 16,
            color: theme.colors.text
          }}
        >
          {text.title}
        </div>

        <div
          style={{
            marginTop: 4,
            fontSize: 12,
            color: theme.colors.textMuted
          }}
        >
          {text.subtitle}
        </div>
      </div>

      {snapshots.length === 0 ? (
        <div
          style={{
            border: `1px dashed ${theme.colors.border}`,
            borderRadius: theme.radius.lg,
            padding: 20,
            background: theme.colors.surfaceAlt,
            color: theme.colors.textMuted,
            textAlign: "center"
          }}
        >
          {text.noData}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: 10
          }}
        >
          {snapshots.map((snapshot, index) => {
            const value = Number(snapshot.marketValue);
            const confidence =
              typeof snapshot.confidence === "number"
                ? snapshot.confidence
                : null;

            return (
              <div
                key={snapshot.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "56px 1fr auto",
                  gap: 12,
                  alignItems: "center",
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.radius.lg,
                  padding: 12,
                  background:
                    index === 0 ? theme.colors.surfaceAlt : theme.colors.surface
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 999,
                    background: theme.colors.gold,
                    color: theme.colors.black,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: 12
                  }}
                >
                  #{snapshots.length - index}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                      alignItems: "center"
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color: theme.colors.textMuted
                      }}
                    >
                      {text.source}:
                    </span>

                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 8px",
                        borderRadius: 999,
                        background: theme.colors.surfaceAlt,
                        border: `1px solid ${theme.colors.border}`,
                        fontSize: 12,
                        fontWeight: 800,
                        color: theme.colors.text
                      }}
                    >
                      {snapshot.source}
                    </span>

                    {confidence !== null && (
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 8px",
                          borderRadius: 999,
                          background: "#F9FAFB",
                          border: `1px solid ${theme.colors.border}`,
                          fontSize: 12,
                          fontWeight: 700,
                          color: theme.colors.textMuted
                        }}
                      >
                        {text.confidence}: {formatConfidence(confidence)}
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      color: theme.colors.textMuted
                    }}
                  >
                    {text.date}: {formatDate(snapshot.recordedAt, locale)}
                  </div>
                </div>

                <div
                  style={{
                    fontWeight: 900,
                    fontSize: 18,
                    color: theme.colors.text,
                    whiteSpace: "nowrap"
                  }}
                >
                  {value.toFixed(2)} €
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function formatDate(value: string, locale: "en" | "es") {
  return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatConfidence(value: number) {
  if (value <= 1) {
    return `${Math.round(value * 100)}%`;
  }

  return `${Math.round(value)}%`;
}