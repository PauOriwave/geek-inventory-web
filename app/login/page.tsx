import PublicSiteShell from "../components/PublicSiteShell";
import { getLocale } from "../i18n";
import { getServerTheme } from "../getServerTheme";
import LoginForm from "./login-form";

export default async function LoginPage({
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
      locale === "es" ? "Bienvenido de nuevo" : "Welcome back",
    title:
      locale === "es"
        ? "Vuelve a tu vault"
        : "Return to your vault",
    subtitle:
      locale === "es"
        ? "Accede a tu colección, tus gráficos, tus snapshots y tu progreso como coleccionista."
        : "Access your collection, charts, snapshots and progress as a collector.",
    benefitsTitle:
      locale === "es" ? "Lo que te espera dentro" : "What is waiting inside",
    benefits:
      locale === "es"
        ? [
            "Dashboard con valor total, tendencias y categorías",
            "Histórico de valoraciones y snapshots por objeto",
            "Gestión premium de colección en un solo sitio"
          ]
        : [
            "Dashboard with total value, trends and categories",
            "Valuation history and per-item snapshots",
            "Premium collection management in one place"
          ],
    register:
      locale === "es" ? "Crear cuenta" : "Create account",
    noAccount:
      locale === "es"
        ? "¿Aún no tienes cuenta?"
        : "Do not have an account yet?",
    panelTitle:
      locale === "es"
        ? "Tu colección merece un panel serio"
        : "Your collection deserves a serious dashboard",
    panelText:
      locale === "es"
        ? "DrakoryVault está diseñado para coleccionistas que quieren orden, contexto y evolución, no solo una lista de objetos."
        : "DrakoryVault is designed for collectors who want order, context and evolution, not just a list of items."
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
              justifyContent: "space-between",
              minHeight: 100
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
                {text.benefitsTitle}
              </div>

              <div
                style={{
                  display: "grid",
                  gap: 10
                }}
              >
                {text.benefits.map((item) => (
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
              {locale === "es" ? "Entrar" : "Login"}
            </h2>

            <p
              style={{
                marginTop: 10,
                color: currentTheme.colors.textMuted,
                lineHeight: 1.7
              }}
            >
              {locale === "es"
                ? "Inicia sesión para volver a tu dashboard y seguir construyendo tu vault."
                : "Log in to return to your dashboard and keep building your vault."}
            </p>

            <div style={{ marginTop: 18 }}>
              <LoginForm locale={locale} />
            </div>

            <div
              style={{
                marginTop: 16,
                color: currentTheme.colors.textMuted,
                fontSize: 14
              }}
            >
              {text.noAccount}{" "}
              <a
                href={`/register?lang=${locale}`}
                style={{
                  textDecoration: "none",
                  color: currentTheme.colors.link,
                  fontWeight: 800
                }}
              >
                {text.register}
              </a>
            </div>
          </section>
        </div>
      </section>
    </PublicSiteShell>
  );
}