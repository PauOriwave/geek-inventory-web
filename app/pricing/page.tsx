import { theme } from "../theme";

export default function PricingPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: theme.colors.bg,
        color: theme.colors.text,
        fontFamily: "system-ui",
        padding: "40px 24px"
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 10 }}>
          Pricing
        </h1>

        <p style={{ color: theme.colors.textMuted, marginBottom: 30 }}>
          Start free. Upgrade when you want deeper insights, themes and valuation tools.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20
          }}
        >
          {/* FREE */}
          <PlanCard
            title="Free"
            price="0€"
            features={[
              "Up to 100 items",
              "Basic dashboard",
              "CSV import/export",
              "Manual valuation",
              "Default theme"
            ]}
            cta="Start free"
          />

          {/* PRO */}
          <PlanCard
            title="Pro"
            price="4.99€ / month"
            highlight
            features={[
              "Unlimited items",
              "Advanced dashboard",
              "Top items & trends",
              "Valuation history",
              "Auto valuation (future)",
              "Theme unlocks",
              "Priority features"
            ]}
            cta="Go Pro"
          />

          {/* COLLECTOR */}
          <PlanCard
            title="Collector"
            price="9.99€ / month"
            features={[
              "Everything in Pro",
              "Premium themes",
              "Early feature access",
              "Advanced valuation sources",
              "Collection insights AI (future)",
              "Loyalty rewards"
            ]}
            cta="Become Collector"
          />
        </div>
      </div>
    </main>
  );
}

function PlanCard({
  title,
  price,
  features,
  cta,
  highlight
}: {
  title: string;
  price: string;
  features: string[];
  cta: string;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        border: highlight
          ? `2px solid ${theme.colors.gold}`
          : `1px solid ${theme.colors.border}`,
        borderRadius: 20,
        padding: 20,
        background: theme.colors.surface,
        boxShadow: theme.shadow.card
      }}
    >
      <h2 style={{ fontSize: 22, fontWeight: 800 }}>{title}</h2>

      <div
        style={{
          fontSize: 26,
          fontWeight: 900,
          margin: "10px 0"
        }}
      >
        {price}
      </div>

      <ul style={{ paddingLeft: 18, marginBottom: 20 }}>
        {features.map((f) => (
          <li key={f} style={{ marginBottom: 6 }}>
            {f}
          </li>
        ))}
      </ul>

      <a
        href="/register"
        style={{
          display: "inline-block",
          textDecoration: "none",
          background: highlight ? theme.colors.gold : theme.colors.black,
          color: highlight ? theme.colors.black : "white",
          padding: "10px 14px",
          borderRadius: 999,
          fontWeight: 700
        }}
      >
        {cta}
      </a>
    </div>
  );
}