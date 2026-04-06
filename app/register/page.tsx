import PublicSiteShell from "../components/PublicSiteShell";
import { getLocale } from "../i18n";
import { getServerTheme } from "../getServerTheme";
import RegisterForm from "./RegisterForm";

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
    title:
      locale === "es"
        ? "Crear tu cuenta en DrakoryVault"
        : "Create your DrakoryVault account",
    subtitle:
      locale === "es"
        ? "Empieza tu vault, desbloquea temas y construye tu perfil de coleccionista."
        : "Start your vault, unlock themes and build your collector profile.",
    login: locale === "es" ? "Ya tengo cuenta" : "I already have an account"
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
            <RegisterForm locale={locale} />
          </div>

          <a
            href={`/login?lang=${locale}`}
            style={{
              display: "inline-block",
              marginTop: 14,
              textDecoration: "none",
              color: currentTheme.colors.link,
              fontWeight: 800
            }}
          >
            {text.login}
          </a>
        </div>
      </section>
    </PublicSiteShell>
  );
}