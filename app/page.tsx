import PublicSiteShell from "./components/PublicSiteShell";
import { availableThemes, theme } from "./theme";
import { getLocale } from "./i18n";
import { getServerTheme } from "./getServerTheme";

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
  const currentTheme = await getServerTheme();
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
      locale === "es" ? "Ver precios" : "See pricing"
  };

  return (
    <PublicSiteShell themeId={currentTheme.id}>
      <section
        style={{
          background:
            themeIdGradient(currentTheme.id),
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
                  background: currentTheme.colors.surface,
                  borderRadius: 22,
                  padding: 18,
                  color: currentTheme.colors.text
                }}
              >
                <div
                  style={{
                    fontWeight: 800,
                    marginBottom: 8
                  }}
                >
                  DrakoryVault
                </div>
                <div style={{ color: currentTheme.colors.textMuted }}>
                  {currentTheme.label} theme active
                </div>

                <div
                  style={{
                    marginTop: 14,
                    height: 10,
                    borderRadius: 999,
                    background: currentTheme.colors.surfaceAlt,
                    overflow: "hidden"
                  }}
                >
                  <div
                    style={{
                      width: "68%",
                      height: "100%",
                      background: currentTheme.colors.gold
                    }}
                  />
                </div>

                <div
                  style={{
                    marginTop: 16,
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 8
                  }}
                >
                  <Swatch color={currentTheme.colors.bg} />
                  <Swatch color={currentTheme.colors.surface} />
                  <Swatch color={currentTheme.colors.gold} />
                  <Swatch color={currentTheme.colors.black} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicSiteShell>
  );
}

function themeIdGradient(themeId: string) {
  if (themeId === "cyberpunk") {
    return "linear-gradient(135deg, #09090B 0%, #161228 52%, #00E5FF 140%)";
  }

  if (themeId === "fantasy") {
    return "linear-gradient(135deg, #2A2118 0%, #5B4127 50%, #B88746 140%)";
  }

  if (themeId === "retro") {
    return "linear-gradient(135deg, #2B2B1F 0%, #4A5C35 50%, #6AA84F 140%)";
  }

  return "linear-gradient(135deg, rgba(23,23,23,1) 0%, rgba(37,37,37,1) 55%, rgba(200,164,77,0.92) 140%)";
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
  background: "#C8A44D",
  color: "#171717",
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