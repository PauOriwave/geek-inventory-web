import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale } from "../../i18n";
import { getCategoryLabel } from "../categoryLabels";
import ItemSnapshotsPanel from "./ItemSnapshotsPanel";
import { AppThemeId, getThemeById } from "../../theme";

type ItemDetail = {
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

const API = process.env.NEXT_PUBLIC_API_URL!;

async function getItem(id: string, cookieHeader: string): Promise<ItemDetail> {
  const res = await fetch(`${API}/items/${id}`, {
    cache: "no-store",
    headers: {
      cookie: cookieHeader
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch item (${res.status}): ${text}`);
  }

  return res.json();
}

export default async function ItemDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }> | { id: string };
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

  const resolvedParams = params instanceof Promise ? await params : params;
  const sp =
    searchParams instanceof Promise ? await searchParams : searchParams ?? {};

  const locale = getLocale(sp);
  const item = await getItem(resolvedParams.id, cookieHeader);

  const backHref = `/items?lang=${locale}`;
  const langEsHref = `/items/${item.id}?lang=es`;
  const langEnHref = `/items/${item.id}?lang=en`;

  const estimatedPrice = Number(item.estimatedPrice);
  const marketValue =
    item.marketValue != null ? Number(item.marketValue) : null;
  const delta = marketValue != null ? marketValue - estimatedPrice : null;

  const text = {
    back: locale === "es" ? "← Volver a colección" : "← Back to collection",
    dashboard:
      locale === "es" ? "Detalle del objeto" : "Item detail",
    metadata: locale === "es" ? "Metadatos" : "Metadata",
    valuation: locale === "es" ? "Valoración" : "Valuation",
    notes: locale === "es" ? "Notas" : "Notes",
    name: locale === "es" ? "Nombre" : "Name",
    category: locale === "es" ? "Categoría" : "Category",
    price: locale === "es" ? "Precio estimado" : "Estimated price",
    market: locale === "es" ? "Valor de mercado" : "Market value",
    delta: locale === "es" ? "Diferencia" : "Delta",
    qty: locale === "es" ? "Cantidad" : "Quantity",
    platform: locale === "es" ? "Plataforma" : "Platform",
    region: locale === "es" ? "Región" : "Region",
    condition: locale === "es" ? "Estado" : "Condition",
    completeness: locale === "es" ? "Completitud" : "Completeness",
    source: locale === "es" ? "Fuente" : "Source",
    confidence: locale === "es" ? "Confianza" : "Confidence",
    lastValuation:
      locale === "es" ? "Última valoración" : "Last valuation",
    created: locale === "es" ? "Creado" : "Created",
    updated: locale === "es" ? "Actualizado" : "Updated",
    tracker:
      locale === "es"
        ? "El rastreador universal de colecciones"
        : "The Universal Collection Tracker",
    noNotes:
      locale === "es"
        ? "No hay notas para este objeto."
        : "No notes for this item.",
    notAvailable: "—"
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
          maxWidth: 1180,
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
            boxShadow: currentTheme.shadow.card,
            flexWrap: "wrap"
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
                {text.tracker}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap"
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
          </div>
        </div>

        <a
          href={backHref}
          style={{
            display: "inline-block",
            marginBottom: 14,
            color: currentTheme.colors.text,
            textDecoration: "none",
            fontWeight: 800
          }}
        >
          {text.back}
        </a>

        <section
          style={{
            background: currentTheme.colors.surface,
            border: `1px solid ${currentTheme.colors.border}`,
            borderRadius: currentTheme.radius.xl,
            padding: 20,
            boxShadow: currentTheme.shadow.card
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 18,
              alignItems: "flex-start",
              flexWrap: "wrap"
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-block",
                  padding: "5px 10px",
                  borderRadius: 999,
                  background: currentTheme.colors.surfaceAlt,
                  border: `1px solid ${currentTheme.colors.border}`,
                  fontSize: 12,
                  color: currentTheme.colors.textMuted,
                  marginBottom: 12
                }}
              >
                {getCategoryLabel(item.category, locale)}
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: 34,
                  lineHeight: 1.08,
                  color: currentTheme.colors.text
                }}
              >
                {item.name}
              </h1>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(140px, 1fr))",
                gap: 10,
                minWidth: "min(100%, 640px)"
              }}
            >
              <StatCard
                label={text.price}
                value={`${estimatedPrice.toFixed(2)} €`}
                currentTheme={currentTheme}
              />
              <StatCard
                label={text.market}
                value={
                  marketValue != null
                    ? `${marketValue.toFixed(2)} €`
                    : text.notAvailable
                }
                currentTheme={currentTheme}
              />
              <StatCard
                label={text.delta}
                value={
                  delta != null
                    ? `${delta > 0 ? "+" : ""}${delta.toFixed(2)} €`
                    : text.notAvailable
                }
                accent={delta}
                currentTheme={currentTheme}
              />
              <StatCard
                label={text.qty}
                value={String(item.quantity)}
                currentTheme={currentTheme}
              />
            </div>
          </div>

          <div
            style={{
              marginTop: 18,
              display: "grid",
              gridTemplateColumns: "1.1fr 0.9fr",
              gap: 18
            }}
          >
            <section
              style={{
                background: currentTheme.colors.surfaceAlt,
                border: `1px solid ${currentTheme.colors.border}`,
                borderRadius: currentTheme.radius.lg,
                padding: 16
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 15,
                  marginBottom: 12,
                  color: currentTheme.colors.text
                }}
              >
                {text.metadata}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 12
                }}
              >
                <InfoRow label={text.name} value={item.name} currentTheme={currentTheme} />
                <InfoRow
                  label={text.category}
                  value={getCategoryLabel(item.category, locale)}
                  currentTheme={currentTheme}
                />
                <InfoRow label={text.platform} value={item.platform} currentTheme={currentTheme} />
                <InfoRow label={text.region} value={item.region} currentTheme={currentTheme} />
                <InfoRow
                  label={text.condition}
                  value={formatCondition(item.condition)}
                  currentTheme={currentTheme}
                />
                <InfoRow
                  label={text.completeness}
                  value={formatCompleteness(item.completeness)}
                  currentTheme={currentTheme}
                />
                <InfoRow
                  label={text.created}
                  value={formatDate(item.createdAt, locale)}
                  currentTheme={currentTheme}
                />
                <InfoRow
                  label={text.updated}
                  value={formatDate(item.updatedAt, locale)}
                  currentTheme={currentTheme}
                />
              </div>
            </section>

            <section
              style={{
                background: currentTheme.colors.surfaceAlt,
                border: `1px solid ${currentTheme.colors.border}`,
                borderRadius: currentTheme.radius.lg,
                padding: 16
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 15,
                  marginBottom: 12,
                  color: currentTheme.colors.text
                }}
              >
                {text.valuation}
              </div>

              <div
                style={{
                  display: "grid",
                  gap: 12
                }}
              >
                <InfoRow
                  label={text.price}
                  value={`${estimatedPrice.toFixed(2)} €`}
                  currentTheme={currentTheme}
                />
                <InfoRow
                  label={text.market}
                  value={
                    marketValue != null
                      ? `${marketValue.toFixed(2)} €`
                      : text.notAvailable
                  }
                  currentTheme={currentTheme}
                />
                <InfoRow
                  label={text.delta}
                  value={<DeltaBadge delta={delta} currentTheme={currentTheme} />}
                  currentTheme={currentTheme}
                />
                <InfoRow
                  label={text.source}
                  value={item.valuationSource || text.notAvailable}
                  currentTheme={currentTheme}
                />
                <InfoRow
                  label={text.confidence}
                  value={formatConfidence(item.valuationConfidence)}
                  currentTheme={currentTheme}
                />
                <InfoRow
                  label={text.lastValuation}
                  value={
                    item.lastValuationAt
                      ? formatDate(item.lastValuationAt, locale)
                      : text.notAvailable
                  }
                  currentTheme={currentTheme}
                />
              </div>
            </section>
          </div>

          <section
            style={{
              marginTop: 18,
              background: currentTheme.colors.surfaceAlt,
              border: `1px solid ${currentTheme.colors.border}`,
              borderRadius: currentTheme.radius.lg,
              padding: 16
            }}
          >
            <div
              style={{
                fontWeight: 800,
                fontSize: 15,
                marginBottom: 10,
                color: currentTheme.colors.text
              }}
            >
              {text.notes}
            </div>

            <div
              style={{
                color: item.notes ? currentTheme.colors.text : currentTheme.colors.textMuted,
                lineHeight: 1.7,
                whiteSpace: "pre-wrap"
              }}
            >
              {item.notes?.trim() || text.noNotes}
            </div>
          </section>
        </section>

        <ItemSnapshotsPanel id={item.id} locale={locale} />
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  accent,
  currentTheme
}: {
  label: string;
  value: string;
  accent?: number | null;
  currentTheme: ReturnType<typeof getThemeById>;
}) {
  const color =
    accent == null
      ? currentTheme.colors.text
      : accent > 0
        ? currentTheme.colors.success
        : accent < 0
          ? currentTheme.colors.danger
          : currentTheme.colors.text;

  const bg =
    accent == null
      ? currentTheme.colors.surfaceAlt
      : accent > 0
        ? "rgba(34,197,94,0.14)"
        : accent < 0
          ? "rgba(244,63,94,0.14)"
          : currentTheme.colors.surfaceAlt;

  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${currentTheme.colors.border}`,
        borderRadius: currentTheme.radius.lg,
        padding: "14px 16px"
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
          fontSize: 22,
          fontWeight: 800,
          color
        }}
      >
        {value}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  currentTheme
}: {
  label: string;
  value: React.ReactNode;
  currentTheme: ReturnType<typeof getThemeById>;
}) {
  return (
    <div
      style={{
        background: currentTheme.colors.surface,
        border: `1px solid ${currentTheme.colors.border}`,
        borderRadius: currentTheme.radius.md,
        padding: "12px 14px"
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: currentTheme.colors.textMuted,
          marginBottom: 6,
          fontWeight: 800
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: currentTheme.colors.text,
          fontSize: 14
        }}
      >
        {value || "—"}
      </div>
    </div>
  );
}

function DeltaBadge({
  delta,
  currentTheme
}: {
  delta: number | null;
  currentTheme: ReturnType<typeof getThemeById>;
}) {
  if (delta == null) {
    return <span style={{ color: currentTheme.colors.textMuted }}>—</span>;
  }

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

  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 8px",
        borderRadius: 999,
        background: bg,
        color,
        fontSize: 12,
        fontWeight: 800,
        border: `1px solid ${currentTheme.colors.border}`
      }}
    >
      {delta > 0 ? "+" : ""}
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

function formatDate(value: string, locale: "en" | "es") {
  return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatConfidence(value?: number | null) {
  if (typeof value !== "number") return "—";

  if (value <= 1) {
    return `${Math.round(value * 100)}%`;
  }

  return `${Math.round(value)}%`;
}

const langSwitchLink: React.CSSProperties = {
  textDecoration: "none",
  padding: "8px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 800
};