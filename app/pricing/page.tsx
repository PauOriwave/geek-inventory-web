import PublicSiteShell from "../components/PublicSiteShell";
import { availableThemes, theme } from "../theme";
import { getLocale } from "../i18n";

export default async function PricingPage({
  searchParams
}: {
  searchParams?:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
}) {
  const sp =
    searchParams instanceof Promise ? await searchParams : searchParams ?? {};

  const locale = getLocale(sp);
  const premiumThemes = availableThemes.filter((item) => item.premium);

  const text = {
    badge: locale === "es" ? "Precios" : "Pricing",
    title:
      locale === "es"
        ? "Empieza gratis. Mejora cuando necesites más profundidad."
        : "Start free. Upgrade when you want deeper insights.",
    subtitle:
      locale === "es"
        ? "DrakoryVault está pensado para ser útil desde el primer día, con planes premium que desbloquean histórico de valoraciones, insights avanzados, temas por fidelización y futuras automatizaciones."
        : "DrakoryVault is built to be useful from day one, with premium plans unlocking valuation history, advanced insights, loyalty themes and future automation.",

    freeTitle: "Free",
    freePrice: "0€",
    freeSubtitle:
      locale === "es"
        ? "Para empezar tu vault"
        : "For starting your vault",
    freeFeatures:
      locale === "es"
        ? [
            "Hasta 100 objetos",
            "Dashboard básico",
            "Importación/exportación CSV",
            "Valoración manual",
            "Tema por defecto",
            "Gestión base de colección"
          ]
        : [
            "Up to 100 items",
            "Basic dashboard",
            "CSV import/export",
            "Manual valuation",
            "Default theme",
            "Core collection management"
          ],
    freeCta: locale === "es" ? "Empezar gratis" : "Start free",

    proTitle: "Pro",
    proPrice: "4.99€ / month",
    proSubtitle:
      locale === "es"
        ? "Para coleccionistas activos"
        : "For active collectors",
    proFeatures:
      locale === "es"
        ? [
            "Objetos ilimitados",
            "Dashboard avanzado",
            "Historial de valoraciones",
            "Top movers y tendencias por categoría",
            "Evolución del valor de la colección",
            "Temas premium y ruta de desbloqueo por fidelización",
            "Futuras valoraciones automáticas"
          ]
        : [
            "Unlimited items",
            "Advanced dashboard",
            "Valuation history",
            "Top movers and category trends",
            "Collection value evolution",
            "Premium themes and loyalty unlock path",
            "Future automatic valuations"
          ],
    proCta: locale === "es" ? "Elegir Pro" : "Choose Pro",
    proBadge:
      locale === "es" ? "Más equilibrado" : "Most balanced",

    collectorTitle: "Collector",
    collectorPrice: "9.99€ / month",
    collectorSubtitle:
      locale === "es"
        ? "Para power users y early adopters"
        : "For power users and early adopters",
    collectorFeatures:
      locale === "es"
        ? [
            "Todo lo incluido en Pro",
            "Acceso prioritario a nuevas funciones",
            "Futuras fuentes de valoración más profundas",
            "Cosméticos premium e identidad de supporter",
            "Mayores límites de automatización en el futuro",
            "Recompensas por fidelización"
          ]
        : [
            "Everything in Pro",
            "Priority feature access",
            "Deeper future valuation sources",
            "Premium cosmetics and supporter identity",
            "Higher future automation limits",
            "Long-term loyalty rewards"
          ],
    collectorCta:
      locale === "es" ? "Hazte Collector" : "Become Collector",

    loyaltyEyebrow:
      locale === "es" ? "Estéticas por fidelidad" : "Loyalty aesthetics",
    loyaltyTitle:
      locale === "es"
        ? "Los temas forman parte del producto, no son un añadido"
        : "Themes are part of the product, not an afterthought",
    loyaltyText:
      locale === "es"
        ? "DrakoryVault está construido con una arquitectura multi-theme para que los planes premium y los supporters de largo plazo puedan desbloquear estilos visuales distintos en toda la app."
        : "DrakoryVault is built with a multi-theme architecture so premium plans and long-term supporters can unlock different visual styles across the whole app.",
    createAccount:
      locale === "es" ? "Crear cuenta" : "Create account",

    includedTitle:
      locale === "es"
        ? "Lo que ya forma parte de la dirección del producto"
        : "What is already included in the product direction",
    includedItems:
      locale === "es"
        ? [
            "Inventario de colección con estructura por categorías",
            "Flujos de importación y exportación CSV",
            "Snapshots de valor de mercado y gráficos históricos",
            "Tendencias por categoría y top movers",
            "Arquitectura de temas lista para desbloqueos premium",
            "Roadmap futuro para logros, fidelización y mejores proveedores de valoración"
          ]
        : [
            "Collection inventory with category-aware structure",
            "CSV import and export workflows",
            "Market value snapshots and historical charts",
            "Category trends and top movers",
            "Theme system architecture ready for premium unlocks",
            "Future roadmap for achievements, loyalty rewards and better valuation providers"
          ],

    startEyebrow:
      locale === "es" ? "Empieza ahora" : "Get started",
    startTitle:
      locale === "es"
        ? "Construye tu vault ahora y evoluciona a Pro cuando necesites más profundidad."
        : "Build your vault now and grow into Pro when you need more depth.",
    startFree:
      locale === "es" ? "Empezar gratis" : "Start free",
    login: locale === "es" ? "Entrar" : "Login",

    defaultTheme: locale === "es" ? "por defecto" : "default"
  };

  return (
    <PublicSiteShell compact>
      <section
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "34px 24px 28px 24px"
        }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: 760,
            margin: "0 auto"
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "6px 12px",
              borderRadius: 999,
              background: theme.colors.surfaceAlt,
              border: `1px solid ${theme.colors.border}`,
              color: theme.colors.link,
              fontWeight: 800,
              fontSize: 12,
              marginBottom: 14
            }}
          >
            {text.badge}
          </div>

          <h1
            style={{
              fontSize: 42,
              lineHeight: 1.08,
              margin: 0,
              fontWeight: 900
            }}
          >
            {text.title}
          </h1>

          <p
            style={{
              marginTop: 16,
              color: theme.colors.textMuted,
              fontSize: 17,
              lineHeight: 1.7
            }}
          >
            {text.subtitle}
          </p>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "0 24px 18px 24px"
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 18
          }}
        >
          <PlanCard
            title={text.freeTitle}
            price={text.freePrice}
            subtitle={text.freeSubtitle}
            features={text.freeFeatures}
            cta={text.freeCta}
            href={`/register?lang=${locale}`}
          />

          <PlanCard
            title={text.proTitle}
            price={text.proPrice}
            subtitle={text.proSubtitle}
            features={text.proFeatures}
            cta={text.proCta}
            href={`/register?lang=${locale}`}
            highlight
            badge={text.proBadge}
          />

          <PlanCard
            title={text.collectorTitle}
            price={text.collectorPrice}
            subtitle={text.collectorSubtitle}
            features={text.collectorFeatures}
            cta={text.collectorCta}
            href={`/register?lang=${locale}`}
          />
        </div>
      </section>

      <section
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "16px 24px 18px 24px"
        }}
      >
        <div
          style={{
            background: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: 28,
            padding: 24,
            boxShadow: theme.shadow.card
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
            <div style={{ maxWidth: 760 }}>
              <div
                style={{
                  color: theme.colors.link,
                  fontWeight: 800,
                  fontSize: 13,
                  marginBottom: 8
                }}
              >
                {text.loyaltyEyebrow}
              </div>

              <h2
                style={{
                  margin: 0,
                  fontSize: 30
                }}
              >
                {text.loyaltyTitle}
              </h2>

              <p
                style={{
                  marginTop: 12,
                  marginBottom: 0,
                  color: theme.colors.textMuted,
                  lineHeight: 1.7
                }}
              >
                {text.loyaltyText}
              </p>
            </div>

            <a href={`/register?lang=${locale}`} style={secondaryCta}>
              {text.createAccount}
            </a>
          </div>

          <div
            style={{
              marginTop: 18,
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 12
            }}
          >
            {premiumThemes.map((item) => (
              <div
                key={item.id}
                style={{
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: 22,
                  padding: 16,
                  background: theme.colors.surfaceAlt
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    alignItems: "center"
                  }}
                >
                  <div style={{ fontWeight: 800 }}>{item.label}</div>

                  <span
                    style={{
                      fontSize: 11,
                      borderRadius: 999,
                      padding: "4px 8px",
                      background: theme.colors.black,
                      color: "white"
                    }}
                  >
                    {item.loyaltyMonthsRequired}m+
                  </span>
                </div>

                <div
                  style={{
                    marginTop: 8,
                    color: theme.colors.textMuted,
                    fontSize: 13,
                    minHeight: 36
                  }}
                >
                  {item.description}
                </div>

                <div
                  style={{
                    marginTop: 12,
                    display: "flex",
                    gap: 6
                  }}
                >
                  <Swatch color={item.colors.bg} />
                  <Swatch color={item.colors.surface} />
                  <Swatch color={item.colors.gold} />
                  <Swatch color={item.colors.black} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "16px 24px 72px 24px"
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: 18
          }}
        >
          <div
            style={{
              background: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: 24,
              padding: 20,
              boxShadow: theme.shadow.soft
            }}
          >
            <div
              style={{
                fontWeight: 800,
                fontSize: 18,
                marginBottom: 10
              }}
            >
              {text.includedTitle}
            </div>

            <div
              style={{
                display: "grid",
                gap: 10,
                color: theme.colors.textMuted,
                lineHeight: 1.7,
                fontSize: 14
              }}
            >
              {text.includedItems.map((item) => (
                <div key={item}>• {item}</div>
              ))}
            </div>
          </div>

          <div
            style={{
              background: theme.colors.black,
              color: "white",
              borderRadius: 24,
              padding: 20,
              boxShadow: theme.shadow.card
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.72)",
                marginBottom: 8,
                fontWeight: 800
              }}
            >
              {text.startEyebrow}
            </div>

            <h3
              style={{
                margin: 0,
                fontSize: 28,
                lineHeight: 1.15
              }}
            >
              {text.startTitle}
            </h3>

            <div
              style={{
                marginTop: 18,
                display: "flex",
                gap: 10,
                flexWrap: "wrap"
              }}
            >
              <a href={`/register?lang=${locale}`} style={primaryCta}>
                {text.startFree}
              </a>
              <a href={`/login?lang=${locale}`} style={ghostCta}>
                {text.login}
              </a>
            </div>
          </div>
        </div>
      </section>
    </PublicSiteShell>
  );
}

function PlanCard({
  title,
  price,
  subtitle,
  features,
  cta,
  href,
  highlight = false,
  badge
}: {
  title: string;
  price: string;
  subtitle: string;
  features: string[];
  cta: string;
  href: string;
  highlight?: boolean;
  badge?: string;
}) {
  return (
    <div
      style={{
        border: highlight
          ? `2px solid ${theme.colors.gold}`
          : `1px solid ${theme.colors.border}`,
        borderRadius: 26,
        padding: 22,
        background: theme.colors.surface,
        boxShadow: highlight ? theme.shadow.card : theme.shadow.soft,
        position: "relative"
      }}
    >
      {highlight && badge && (
        <div
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            fontSize: 11,
            fontWeight: 800,
            borderRadius: 999,
            padding: "5px 8px",
            background: theme.colors.gold,
            color: theme.colors.black
          }}
        >
          {badge}
        </div>
      )}

      <div
        style={{
          fontSize: 22,
          fontWeight: 900
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: 6,
          color: theme.colors.textMuted,
          fontSize: 14
        }}
      >
        {subtitle}
      </div>

      <div
        style={{
          marginTop: 18,
          fontSize: 34,
          fontWeight: 900
        }}
      >
        {price}
      </div>

      <div
        style={{
          marginTop: 18,
          display: "grid",
          gap: 10,
          color: theme.colors.textMuted,
          fontSize: 14,
          lineHeight: 1.6
        }}
      >
        {features.map((feature) => (
          <div key={feature}>• {feature}</div>
        ))}
      </div>

      <a
        href={href}
        style={{
          display: "inline-block",
          marginTop: 22,
          textDecoration: "none",
          background: highlight ? theme.colors.gold : theme.colors.black,
          color: highlight ? theme.colors.black : "white",
          padding: "12px 16px",
          borderRadius: 999,
          fontWeight: 800
        }}
      >
        {cta}
      </a>
    </div>
  );
}

function Swatch({ color }: { color: string }) {
  return (
    <span
      style={{
        width: 20,
        height: 20,
        borderRadius: 999,
        display: "inline-block",
        background: color,
        border: "1px solid rgba(0,0,0,0.08)"
      }}
    />
  );
}

const secondaryCta: React.CSSProperties = {
  textDecoration: "none",
  border: `1px solid ${theme.colors.border}`,
  color: theme.colors.text,
  padding: "11px 16px",
  borderRadius: 999,
  fontWeight: 800,
  background: theme.colors.surfaceAlt
};

const primaryCta: React.CSSProperties = {
  textDecoration: "none",
  background: theme.colors.gold,
  color: theme.colors.black,
  padding: "12px 18px",
  borderRadius: 999,
  fontWeight: 800
};

const ghostCta: React.CSSProperties = {
  textDecoration: "none",
  border: "1px solid rgba(255,255,255,0.16)",
  color: "white",
  padding: "12px 18px",
  borderRadius: 999,
  fontWeight: 800
};