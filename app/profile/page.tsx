import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale } from "../i18n";
import { AppThemeId, getThemeById } from "../theme";
import ThemeSelector from "./ThemeSelector";
import AchievementsPanel from "./AchievementsPanel";
import CollectorLevelPanel from "./CollectorLevelPanel";

type Me = {
  id: string;
  email?: string;
  createdAt?: string;
};

const API = process.env.NEXT_PUBLIC_API_URL!;

async function getMe(cookieHeader: string): Promise<Me> {
  const res = await fetch(`${API}/auth/me`, {
    cache: "no-store",
    headers: {
      cookie: cookieHeader
    }
  });

  if (!res.ok) {
    throw new Error("Failed to fetch user");
  }

  return res.json();
}

export default async function ProfilePage({
  searchParams
}: {
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

  const sp =
    searchParams instanceof Promise ? await searchParams : searchParams ?? {};

  const locale = getLocale(sp);
  const me = await getMe(cookieHeader);

  const themeId =
    (cookieStore.get("ui_theme")?.value as AppThemeId | undefined) ?? "classic";
  const currentTheme = getThemeById(themeId);

  const email = me.email || "collector@drakoryvault.local";
  const createdAt = me.createdAt || new Date().toISOString();

  const text = {
    title: locale === "es" ? "Perfil del coleccionista" : "Collector profile",
    subtitle:
      locale === "es"
        ? "Tu identidad dentro de DrakoryVault: cuenta, preferencias, temas, logros y presencia pública."
        : "Your identity inside DrakoryVault: account, preferences, themes, achievements and public presence.",
    back:
      locale === "es" ? "← Volver al dashboard" : "← Back to dashboard",
    account: locale === "es" ? "Cuenta" : "Account",
    preferences: locale === "es" ? "Preferencias" : "Preferences",
    collectorIdentity:
      locale === "es" ? "Identidad de coleccionista" : "Collector identity",
    social: locale === "es" ? "Perfil público y compartir" : "Public profile & sharing",
    email: locale === "es" ? "Email" : "Email",
    memberSince: locale === "es" ? "Miembro desde" : "Member since",
    collectorRank:
      locale === "es" ? "Rango de coleccionista" : "Collector rank",
    rankValue: "Vault Explorer",
    language: locale === "es" ? "Idioma" : "Language",
    languageValue: locale === "es" ? "Español / Inglés" : "English / Spanish",
    themeText:
      locale === "es"
        ? "Este selector ya funciona como MVP y prepara la futura versión premium con desbloqueos y fidelización."
        : "This selector already works as an MVP and prepares the future premium version with unlocks and loyalty.",
    status: locale === "es" ? "Estado" : "Status",
    statusValue:
      locale === "es" ? "Cuenta activa" : "Active account",
    currentThemeLabel:
      locale === "es" ? "Tema actual" : "Current theme",
    socialText:
      locale === "es"
        ? "Más adelante podrás tener un perfil público y compartir tus vitrinas, hitos y colección en redes."
        : "Later you will be able to have a public profile and share your showcases, milestones and collection on social media."
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
          maxWidth: 1100,
          margin: "0 auto"
        }}
      >
        <a
          href={`/items?lang=${locale}`}
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
            background: currentTheme.colors.black,
            color: "white",
            borderRadius: currentTheme.radius.xl,
            padding: "20px 22px",
            boxShadow: currentTheme.shadow.card,
            marginBottom: 18
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              alignItems: "center",
              flexWrap: "wrap"
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 900,
                  fontSize: 30,
                  lineHeight: 1.08
                }}
              >
                {text.title}
              </div>

              <div
                style={{
                  marginTop: 6,
                  color: "rgba(255,255,255,0.78)",
                  fontSize: 14,
                  maxWidth: 760
                }}
              >
                {text.subtitle}
              </div>
            </div>

            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 999,
                background: currentTheme.colors.gold,
                color: currentTheme.colors.black,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: 24
              }}
            >
              {email.slice(0, 1).toUpperCase()}
            </div>
          </div>
        </section>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 18
          }}
        >
          <Card title={text.account} currentTheme={currentTheme}>
            <InfoRow
              label={text.email}
              value={email}
              currentTheme={currentTheme}
            />
            <InfoRow
              label={text.memberSince}
              value={formatDate(createdAt, locale)}
              currentTheme={currentTheme}
            />
            <InfoRow
              label={text.status}
              value={text.statusValue}
              currentTheme={currentTheme}
            />
          </Card>

          <Card title={text.collectorIdentity} currentTheme={currentTheme}>
            <InfoRow
              label={text.collectorRank}
              value={text.rankValue}
              currentTheme={currentTheme}
            />
            <InfoRow
              label={text.language}
              value={text.languageValue}
              currentTheme={currentTheme}
            />
            <InfoRow
              label={text.currentThemeLabel}
              value={currentTheme.label}
              currentTheme={currentTheme}
            />
          </Card>

          <div style={{ gridColumn: "1 / -1" }}>
            <CollectorLevelPanel locale={locale} />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <Card title={text.preferences} currentTheme={currentTheme}>
              <MutedParagraph currentTheme={currentTheme}>
                {text.themeText}
              </MutedParagraph>

              <div style={{ marginTop: 14 }}>
                <ThemeSelector currentThemeId={currentTheme.id} locale={locale} />
              </div>
            </Card>
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <AchievementsPanel locale={locale} />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <Card title={text.social} currentTheme={currentTheme}>
              <MutedParagraph currentTheme={currentTheme}>
                {text.socialText}
              </MutedParagraph>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

function Card({
  title,
  children,
  currentTheme
}: {
  title: string;
  children: React.ReactNode;
  currentTheme: ReturnType<typeof getThemeById>;
}) {
  return (
    <section
      style={{
        background: currentTheme.colors.surface,
        border: `1px solid ${currentTheme.colors.border}`,
        borderRadius: currentTheme.radius.xl,
        padding: 18,
        boxShadow: currentTheme.shadow.card
      }}
    >
      <div
        style={{
          fontWeight: 800,
          fontSize: 16,
          marginBottom: 12,
          color: currentTheme.colors.text
        }}
      >
        {title}
      </div>

      {children}
    </section>
  );
}

function InfoRow({
  label,
  value,
  currentTheme
}: {
  label: string;
  value: string;
  currentTheme: ReturnType<typeof getThemeById>;
}) {
  return (
    <div
      style={{
        border: `1px solid ${currentTheme.colors.border}`,
        borderRadius: currentTheme.radius.lg,
        padding: "12px 14px",
        background: currentTheme.colors.surfaceAlt,
        marginBottom: 10
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
          fontSize: 14,
          color: currentTheme.colors.text,
          fontWeight: 700
        }}
      >
        {value}
      </div>
    </div>
  );
}

function MutedParagraph({
  children,
  currentTheme
}: {
  children: React.ReactNode;
  currentTheme: ReturnType<typeof getThemeById>;
}) {
  return (
    <p
      style={{
        margin: 0,
        color: currentTheme.colors.textMuted,
        lineHeight: 1.7,
        fontSize: 14
      }}
    >
      {children}
    </p>
  );
}

function formatDate(value: string, locale: "en" | "es") {
  return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}