import PublicSiteShell from "../components/PublicSiteShell";
import { getLocale } from "../i18n";
import { getServerTheme } from "../getServerTheme";
import RegisterForm from "./register-form";

export default async function RegisterPage({
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

  const text = {
    eyebrow:
      locale === "es" ? "Empieza gratis" : "Start free",
    title:
      locale === "es"
        ? "Crea tu vault de coleccionista"
        : "Create your collector vault",
    subtitle:
      locale === "es"
        ? "Organiza tu colección, sigue su evolución y construye una identidad propia dentro de DrakoryVault."
        : "Organize your collection, track its evolution and build your own identity inside DrakoryVault.",
    includedTitle:
      locale === "es" ? "Lo que obtienes desde el primer día" : "What you get from day one",
    included:
      locale === "es"
        ? [
            "Inventario estructurado por categorías",
            "Valoraciones, snapshots e histórico",
            "Dashboard premium con métricas y tendencias",
            "Base para temas, logros y perfil público"
          ]
        : [
            "Category-aware collection inventory",
            "Valuations, snapshots and history",
            "Premium dashboard with metrics and trends",
            "Foundation for themes, achievements and public profile"
          ],
    login:
      locale === "es" ? "Ya tengo cuenta" : "I already have an account",
    already:
      locale === "es"
        ? "¿Ya tienes cuenta?"
        : "Already have an account?",
    panelTitle:
      locale === "es"
        ? "Más que inventario"
        : "More than inventory",
    panelText:
      locale === "es"
        ? "DrakoryVault no quiere ser solo una hoja con objetos: quiere ser tu espacio central como coleccionista."
        : "DrakoryVault is not meant to be just a sheet of items: it aims to be your central space as a collector."
  };

  return (
    <PublicSiteShell compact themeId={currentTheme.id}>
      <section
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "40px 24px 72px 24px"
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.05fr 0.95fr",
            gap: 20,
            alignItems: "stretch"
          }}
        >
          <section
            style={{
              background: currentTheme.colors.black,
              color: "white",
              borderRadius: 28,
              padding: 28,
              boxShadow: currentTheme.shadow.card,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
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
                  fontWeight: 800,
                  marginBottom: 14
                }}
              >
                {text.eyebrow}
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: 42,
                  lineHeight: 1.08,
                  fontWeight: 900
                }}
              >
                {text.title}
              </h1>

              <p
                style={{
                  marginTop: 14,
                  marginBottom: 0,
                  color: "rgba(255,255,255,0.78)",
                  fontSize: 16,
                  lineHeight: 1.75,
                  maxWidth: 680
                }}
              >
                {text.subtitle}
              </p>
            </div>

            <div style={{ marginTop: 28 }}>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 15,
                  marginBottom: 12
                }}
              >
                {text.includedTitle}
              </div>

              <div
                style={{
                  display: "grid",
                  gap: 10
                }}
              >
                {text.included.map((item) => (
                  <div
                    key={item}
                    style={{
                      border: "1px solid rgba(255,255,255,0.10)",
                      background: "rgba(255,255,255,0.06)",
                      borderRadius: 18,
                      padding: "12px 14px",
                      color: "rgba(255,255,255,0.86)",
                      lineHeight: 1.6,
                      fontSize: 14
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: 18,
                  borderRadius: 22,
                  padding: 16,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)"
                }}
              >
                <div
                  style={{
                    fontWeight: 800,
                    marginBottom: 6
                  }}
                >
                  {text.panelTitle}
                </div>

                <div
                  style={{
                    color: "rgba(255,255,255,0.78)",
                    lineHeight: 1.7,
                    fontSize: 14
                  }}
                >
                  {text.panelText}
                </div>
              </div>
            </div>
          </section>

          <section
            style={{
              background: currentTheme.colors.surface,
              border: `1px solid ${currentTheme.colors.border}`,
              borderRadius: 28,
              padding: 24,
              boxShadow: currentTheme.shadow.card
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 32,
                color: currentTheme.colors.text
              }}
            >
              {locale === "es" ? "Crear cuenta" : "Create account"}
            </h2>

            <p
              style={{
                marginTop: 10,
                color: currentTheme.colors.textMuted,
                lineHeight: 1.7
              }}
            >
              {locale === "es"
                ? "Empieza gratis y construye la base de tu colección desde hoy."
                : "Start free and build the foundation of your collection today."}
            </p>

            <div style={{ marginTop: 18 }}>
              <RegisterForm locale={locale} />
            </div>

            <div
              style={{
                marginTop: 16,
                color: currentTheme.colors.textMuted,
                fontSize: 14
              }}
            >
              {text.already}{" "}
              <a
                href={`/login?lang=${locale}`}
                style={{
                  textDecoration: "none",
                  color: currentTheme.colors.link,
                  fontWeight: 800
                }}
              >
                {text.login}
              </a>
            </div>
          </section>
        </div>
      </section>
    </PublicSiteShell>
  );
}