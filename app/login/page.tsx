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
    title: locale === "es" ? "Entrar en DrakoryVault" : "Login to DrakoryVault",
    subtitle:
      locale === "es"
        ? "Accede a tu vault, tus temas y tu progreso como coleccionista."
        : "Access your vault, your themes and your progress as a collector.",
    register:
      locale === "es" ? "Crear cuenta" : "Create account"
  };

  return (
    <PublicSiteShell compact themeId={currentTheme.id}>
      <section
        style={{
          maxWidth: 680,
          margin: "0 auto",
          padding: "40px 24px 72px 24px"
        }}
      >
        <div
          style={{
            background: currentTheme.colors.surface,
            border: `1px solid ${currentTheme.colors.border}`,
            borderRadius: 28,
            padding: 24,
            boxShadow: currentTheme.shadow.card
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 34,
              color: currentTheme.colors.text
            }}
          >
            {text.title}
          </h1>

          <p
            style={{
              marginTop: 10,
              color: currentTheme.colors.textMuted,
              lineHeight: 1.7
            }}
          >
            {text.subtitle}
          </p>

          <div style={{ marginTop: 18 }}>
            <LoginForm locale={locale} />
          </div>

          <a
            href={`/register?lang=${locale}`}
            style={{
              display: "inline-block",
              marginTop: 14,
              textDecoration: "none",
              color: currentTheme.colors.link,
              fontWeight: 800
            }}
          >
            {text.register}
          </a>
        </div>
      </section>
    </PublicSiteShell>
  );
}