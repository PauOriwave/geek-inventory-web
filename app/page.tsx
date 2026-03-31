import PublicSiteShell from "./components/PublicSiteShell";
import { availableThemes, theme } from "./theme";
import { getDictionary, getLocale } from "./i18n";

export default async function HomePage({
  searchParams
}: {
  searchParams?:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
}) {
  const sp =
    searchParams instanceof Promise ? await searchParams : searchParams ?? {};

  const locale = getLocale(sp);
  const t = getDictionary(locale);
  const featuredThemes = availableThemes.slice(0, 4);

  const text = {
    badge:
      locale === "es"
        ? "Tracking premium para coleccionistas"
        : "Premium tracking for collectors",

    heroTitle1:
      locale === "es" ? "Controla tu colección." : "Track your collection.",
    heroTitle2:
      locale === "es" ? "Entiende su valor." : "Understand its value.",
    heroTitle3:
      locale === "es" ? "Observa su evolución." : "Watch it evolve.",

    heroText:
      locale === "es"
        ? "DrakoryVault ayuda a coleccionistas a organizar videojuegos, libros, TCG, figuras y más, con valoraciones, snapshots históricos, tendencias por categoría y un dashboard premium pensado para colecciones reales."
        : "DrakoryVault helps collectors organize games, books, TCG, figures and more, with valuations, historical snapshots, category trends and a premium dashboard built for real collection tracking.",

    createAccount:
      locale === "es" ? "Crear cuenta" : "Create account",
    seePricing:
      locale === "es" ? "Ver precios" : "See pricing",

    pill1: locale === "es" ? "Multiusuario" : "Multi-user",
    pill2: locale === "es" ? "Importación/exportación CSV" : "CSV import/export",
    pill3: locale === "es" ? "Historial de valoraciones" : "Valuation history",
    pill4: locale === "es" ? "Tendencias por categoría" : "Category trends",

    previewItems: locale === "es" ? "Objetos" : "Items",
    previewCollection: locale === "es" ? "Colección" : "Collection",
    previewTrend: locale === "es" ? "Tendencia" : "Trend",
    previewChartTitle:
      locale === "es"
        ? "Tendencia de valor de la colección"
        : "Collection value trend",
    previewFirst:
      locale === "es" ? "Primer snapshot" : "First snapshot",
    previewLatest:
      locale === "es" ? "Última valoración" : "Latest valuation",
    risingCategories:
      locale === "es" ? "Categorías en subida" : "Rising categories",
    topMovers:
      locale === "es" ? "Principales movimientos" : "Top movers",

    whyEyebrow: locale === "es" ? "Por qué DrakoryVault" : "Why DrakoryVault",
    whyTitle:
      locale === "es"
        ? "Creado para coleccionistas, no solo para hojas de cálculo"
        : "Built for collectors, not just spreadsheets",
    whyText:
      locale === "es"
        ? "Controla lo que tienes, monitoriza el valor de mercado, explora tendencias por categoría y construye un dashboard de colección que realmente se sienta premium."
        : "Track what you own, monitor market value, explore category trends and build a collection dashboard that actually feels premium.",

    feature1Title:
      locale === "es"
        ? "Inventario que respeta al coleccionista"
        : "Inventory that respects collectors",
    feature1Text:
      locale === "es"
        ? "Guarda objetos con estado, plataforma, completitud, región, notas y organización por categoría."
        : "Store items with condition, platform, completeness, region, notes and category-aware organization.",

    feature2Title:
      locale === "es"
        ? "Valoraciones e histórico"
        : "Valuations and history",
    feature2Text:
      locale === "es"
        ? "Crea snapshots de valoración, compara tu precio con el valor de mercado y observa cómo evolucionan tus objetos."
        : "Create valuation snapshots, compare price vs market value and see how items evolve over time.",

    feature3Title:
      locale === "es"
        ? "Inteligencia por categoría"
        : "Category intelligence",
    feature3Text:
      locale === "es"
        ? "Entiende qué partes de tu colección están subiendo, bajando o empujando el valor total."
        : "Understand which parts of your collection are rising, dropping or driving total value.",

    feature4Title:
      locale === "es"
        ? "Importación y exportación CSV"
        : "CSV import and export",
    feature4Text:
      locale === "es"
        ? "Empieza rápido, mueve tus datos con facilidad y mantén tu colección portable."
        : "Start fast, move data easily and keep your collection portable without vendor lock-in.",

    feature5Title:
      locale === "es"
        ? "Sistema de temas preparado"
        : "Theme system ready",
    feature5Text:
      locale === "es"
        ? "Los temas premium y desbloqueables por fidelización forman parte de la dirección del producto desde el primer día."
        : "Premium and loyalty-based themes are built into the product direction from day one.",

    feature6Title:
      locale === "es"
        ? "Dashboard con señal real"
        : "Dashboard with real signal",
    feature6Text:
      locale === "es"
        ? "Consulta top items, movers, tendencia global y valor por categoría en un único espacio premium."
        : "See top items, movers, collection trend and value by category in one premium workspace.",

    loyaltyEyebrow:
      locale === "es" ? "Temas por fidelidad" : "Loyalty themes",
    loyaltyTitle:
      locale === "es"
        ? "Mantente suscrito y desbloquea nuevas estéticas"
        : "Stay subscribed, unlock new aesthetics",
    loyaltyText:
      locale === "es"
        ? "DrakoryVault está diseñado para soportar temas premium y desbloqueos por fidelización. El sistema de temas no es un añadido cosmético: forma parte de la arquitectura del producto."
        : "DrakoryVault is designed to support premium themes and loyalty unlocks. That means the theme system is not a cosmetic afterthought: it is part of the product architecture from the start.",
    explorePlans:
      locale === "es" ? "Explorar planes" : "Explore plans",
    defaultTheme: locale === "es" ? "por defecto" : "default",

    ctaEyebrow:
      locale === "es" ? "¿Listo para empezar?" : "Ready to start?",
    ctaTitle:
      locale === "es"
        ? "Construye tu vault de colección y empieza a seguir su valor de verdad."
        : "Build your collection vault and start tracking value properly.",
    ctaPrimary:
      locale === "es" ? "Empezar gratis" : "Start free",
    ctaSecondary: locale === "es" ? "Precios" : "Pricing"
  };

  return (
    <PublicSiteShell>
      <section
        style={{
          background:
            "linear-gradient(135deg, rgba(23,23,23,1) 0%, rgba(37,37,37,1) 55%, rgba(200,164,77,0.92) 140%)",
          color: "white"
        }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "38px 24px 72px 24px"
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.1fr) minmax(320px, 0.9fr)",
              gap: 28,
              alignItems: "center"
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 12px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.16)",
                  color: "rgba(255,255,255,0.82)",
                  fontSize: 12,
                  marginBottom: 16
                }}
              >
                {text.badge}
              </div>

              <h1
                style={{
                  fontSize: 54,
                  lineHeight: 1.04,
                  margin: 0,
                  fontWeight: 900,
                  maxWidth: 760
                }}
              >
                {text.heroTitle1}
                <br />
                {text.heroTitle2}
                <br />
                {text.heroTitle3}
              </h1>

              <p
                style={{
                  marginTop: 18,
                  marginBottom: 0,
                  maxWidth: 700,
                  fontSize: 18,
                  lineHeight: 1.65,
                  color: "rgba(255,255,255,0.78)"
                }}
              >
                {text.heroText}
              </p>

              <div
                style={{
                  marginTop: 26,
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap"
                }}
              >
                <a href={`/register?lang=${locale}`} style={heroPrimary}>
                  {text.createAccount}
                </a>
                <a href={`/pricing?lang=${locale}`} style={heroSecondary}>
                  {text.seePricing}
                </a>
              </div>

              <div
                style={{
                  marginTop: 22,
                  display: "flex",
                  gap: 20,
                  flexWrap: "wrap",
                  color: "rgba(255,255,255,0.76)",
                  fontSize: 13
                }}
              >
                <span>{text.pill1}</span>
                <span>{text.pill2}</span>
                <span>{text.pill3}</span>
                <span>{text.pill4}</span>
              </div>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 28,
                padding: 18,
                boxShadow: "0 18px 40px rgba(0,0,0,0.22)"
              }}
            >
              <div
                style={{
                  background: "#FFFDF8",
                  borderRadius: 22,
                  padding: 18,
                  color: "#171717"
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: 10
                  }}
                >
                  <PreviewStat label={text.previewItems} value="248" />
                  <PreviewStat label={text.previewCollection} value="12.4k€" />
                  <PreviewStat label={text.previewTrend} value="+8.2%" />
                </div>

                <div
                  style={{
                    marginTop: 14,
                    padding: 14,
                    borderRadius: 18,
                    border: `1px solid ${theme.colors.border}`,
                    background: theme.colors.surfaceAlt
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      color: theme.colors.textMuted,
                      marginBottom: 10
                    }}
                  >
                    {text.previewChartTitle}
                  </div>

                  <svg
                    viewBox="0 0 420 150"
                    style={{ width: "100%", height: "auto", display: "block" }}
                  >
                    <polyline
                      fill="none"
                      stroke={theme.colors.gold}
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points="16,122 82,110 148,104 214,88 280,78 346,56 404,34"
                    />
                    {[16, 82, 148, 214, 280, 346, 404].map((x, i) => {
                      const ys = [122, 110, 104, 88, 78, 56, 34];
                      return (
                        <circle
                          key={`${x}-${i}`}
                          cx={x}
                          cy={ys[i]}
                          r="4"
                          fill="#171717"
                        />
                      );
                    })}
                  </svg>

                  <div
                    style={{
                      marginTop: 10,
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12,
                      color: theme.colors.textMuted
                    }}
                  >
                    <span>{text.previewFirst}</span>
                    <span>{text.previewLatest}</span>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 14,
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 10
                  }}
                >
                  <MiniPanel
                    title={text.risingCategories}
                    lines={
                      locale === "es"
                        ? [
                            "Videojuegos  +42.50€",
                            "Figuras  +18.00€",
                            "Libros  +7.20€"
                          ]
                        : [
                            "Videogames  +42.50€",
                            "Figures  +18.00€",
                            "Books  +7.20€"
                          ]
                    }
                  />
                  <MiniPanel
                    title={text.topMovers}
                    lines={[
                      "Pokémon Azul  +12.00€",
                      "Chrono Trigger  +9.50€",
                      "Berserk Vol. 1  +4.10€"
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "54px 24px 24px 24px"
        }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: 800,
            margin: "0 auto 28px auto"
          }}
        >
          <div
            style={{
              color: theme.colors.link,
              fontWeight: 800,
              fontSize: 13,
              marginBottom: 10
            }}
          >
            {text.whyEyebrow}
          </div>

          <h2
            style={{
              margin: 0,
              fontSize: 36,
              lineHeight: 1.14
            }}
          >
            {text.whyTitle}
          </h2>

          <p
            style={{
              marginTop: 14,
              color: theme.colors.textMuted,
              fontSize: 16,
              lineHeight: 1.7
            }}
          >
            {text.whyText}
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 14
          }}
        >
          <FeatureCard title={text.feature1Title} text={text.feature1Text} />
          <FeatureCard title={text.feature2Title} text={text.feature2Text} />
          <FeatureCard title={text.feature3Title} text={text.feature3Text} />
          <FeatureCard title={text.feature4Title} text={text.feature4Text} />
          <FeatureCard title={text.feature5Title} text={text.feature5Text} />
          <FeatureCard title={text.feature6Title} text={text.feature6Text} />
        </div>
      </section>

      <section
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "30px 24px 24px 24px"
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
              alignItems: "flex-start",
              gap: 20,
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

              <h3
                style={{
                  margin: 0,
                  fontSize: 30
                }}
              >
                {text.loyaltyTitle}
              </h3>

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

            <a href={`/pricing?lang=${locale}`} style={secondaryCtaLight}>
              {text.explorePlans}
            </a>
          </div>

          <div
            style={{
              marginTop: 18,
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: 12
            }}
          >
            {featuredThemes.map((item) => (
              <div
                key={item.id}
                style={{
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: 20,
                  padding: 14,
                  background: theme.colors.surfaceAlt
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 8,
                    alignItems: "center"
                  }}
                >
                  <div style={{ fontWeight: 800 }}>{item.label}</div>
                  <span
                    style={{
                      fontSize: 11,
                      borderRadius: 999,
                      padding: "4px 8px",
                      background: item.premium ? "#171717" : "#F3F4F6",
                      color: item.premium ? "white" : theme.colors.textMuted
                    }}
                  >
                    {item.premium
                      ? `${item.loyaltyMonthsRequired}m+`
                      : text.defaultTheme}
                  </span>
                </div>

                <div
                  style={{
                    marginTop: 8,
                    fontSize: 13,
                    color: theme.colors.textMuted,
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
          maxWidth: 1240,
          margin: "0 auto",
          padding: "30px 24px 72px 24px"
        }}
      >
        <div
          style={{
            background: theme.colors.black,
            color: "white",
            borderRadius: 28,
            padding: 28,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
            boxShadow: theme.shadow.card
          }}
        >
          <div style={{ maxWidth: 740 }}>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.72)",
                marginBottom: 8,
                fontWeight: 800
              }}
            >
              {text.ctaEyebrow}
            </div>

            <h3
              style={{
                margin: 0,
                fontSize: 32,
                lineHeight: 1.15
              }}
            >
              {text.ctaTitle}
            </h3>
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap"
            }}
          >
            <a href={`/register?lang=${locale}`} style={footerPrimary}>
              {text.ctaPrimary}
            </a>
            <a href={`/pricing?lang=${locale}`} style={footerSecondary}>
              {text.ctaSecondary}
            </a>
          </div>
        </div>
      </section>
    </PublicSiteShell>
  );
}

function PreviewStat({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        border: `1px solid ${theme.colors.border}`,
        borderRadius: 16,
        padding: 12,
        background: theme.colors.surfaceAlt
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
          fontWeight: 800
        }}
      >
        {value}
      </div>
    </div>
  );
}

function MiniPanel({
  title,
  lines
}: {
  title: string;
  lines: string[];
}) {
  return (
    <div
      style={{
        border: `1px solid ${theme.colors.border}`,
        borderRadius: 16,
        padding: 12,
        background: "#FFFFFF"
      }}
    >
      <div
        style={{
          fontWeight: 800,
          fontSize: 13,
          marginBottom: 8
        }}
      >
        {title}
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {lines.map((line) => (
          <div
            key={line}
            style={{
              fontSize: 13,
              color: theme.colors.textMuted
            }}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  text
}: {
  title: string;
  text: string;
}) {
  return (
    <div
      style={{
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: 22,
        padding: 18,
        boxShadow: theme.shadow.soft
      }}
    >
      <div
        style={{
          fontWeight: 800,
          fontSize: 17,
          marginBottom: 10
        }}
      >
        {title}
      </div>

      <div
        style={{
          color: theme.colors.textMuted,
          lineHeight: 1.7,
          fontSize: 14
        }}
      >
        {text}
      </div>
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

const heroPrimary: React.CSSProperties = {
  textDecoration: "none",
  background: theme.colors.gold,
  color: theme.colors.black,
  padding: "12px 18px",
  borderRadius: 999,
  fontWeight: 800
};

const heroSecondary: React.CSSProperties = {
  textDecoration: "none",
  border: "1px solid rgba(255,255,255,0.18)",
  color: "white",
  padding: "12px 18px",
  borderRadius: 999,
  fontWeight: 800
};

const secondaryCtaLight: React.CSSProperties = {
  textDecoration: "none",
  border: `1px solid ${theme.colors.border}`,
  color: theme.colors.text,
  padding: "11px 16px",
  borderRadius: 999,
  fontWeight: 800,
  background: theme.colors.surfaceAlt
};

const footerPrimary: React.CSSProperties = {
  textDecoration: "none",
  background: theme.colors.gold,
  color: theme.colors.black,
  padding: "12px 18px",
  borderRadius: 999,
  fontWeight: 800
};

const footerSecondary: React.CSSProperties = {
  textDecoration: "none",
  border: "1px solid rgba(255,255,255,0.16)",
  color: "white",
  padding: "12px 18px",
  borderRadius: 999,
  fontWeight: 800
};