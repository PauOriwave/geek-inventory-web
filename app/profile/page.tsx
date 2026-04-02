import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { theme } from "../theme";
import { getLocale } from "../i18n";

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
    achievements: locale === "es" ? "Logros" : "Achievements",
    social: locale === "es" ? "Perfil público y compartir" : "Public profile & sharing",
    email: locale === "es" ? "Email" : "Email",
    memberSince: locale === "es" ? "Miembro desde" : "Member since",
    collectorRank:
      locale === "es" ? "Rango de coleccionista" : "Collector rank",
    rankValue: "Vault Explorer",
    language: locale === "es" ? "Idioma" : "Language",
    languageValue: locale === "es" ? "Español / Inglés" : "English / Spanish",
    theme: locale === "es" ? "Tema activo" : "Active theme",
    themeValue:
      locale === "es" ? "Clásico DrakoryVault" : "Classic DrakoryVault",
    themeText:
      locale === "es"
        ? "Aquí vivirá el selector de temas desbloqueables y premium."
        : "This is where unlockable and premium theme selection will live.",
    achievementsText:
      locale === "es"
        ? "Aquí mostraremos hitos como tamaño de colección, categorías dominadas, antigüedad y objetivos desbloqueados."
        : "This is where milestones like collection size, mastered categories, account age and unlocked goals will appear.",
    socialText:
      locale === "es"
        ? "Más adelante podrás tener un perfil público y compartir tus vitrinas, hitos y colección en redes."
        : "Later you will be able to have a public profile and share your showcases, milestones and collection on social media.",
    status: locale === "es" ? "Estado" : "Status",
    statusValue:
      locale === "es" ? "Cuenta activa" : "Active account",
    editSoon:
      locale === "es" ? "Editable pronto" : "Editable soon"
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: theme.colors.bg,
        color: theme.colors.text,
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
            color: theme.colors.text,
            textDecoration: "none",
            fontWeight: 800
          }}
        >
          {text.back}
        </a>

        <section
          style={{
            background: theme.colors.black,
            color: "white",
            borderRadius: theme.radius.xl,
            padding: "20px 22px",
            boxShadow: theme.shadow.card,
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
                  color: "#D1D5DB",
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
                background: theme.colors.gold,
                color: theme.colors.black,
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
          <Card title={text.account}>
            <InfoRow label={text.email} value={email} />
            <InfoRow
              label={text.memberSince}
              value={formatDate(createdAt, locale)}
            />
            <InfoRow label={text.status} value={text.statusValue} />
          </Card>

          <Card title={text.collectorIdentity}>
            <InfoRow label={text.collectorRank} value={text.rankValue} />
            <InfoRow label={text.language} value={text.languageValue} />
            <InfoRow label={text.status} value={text.editSoon} />
          </Card>

          <Card title={text.preferences}>
            <InfoRow label={text.theme} value={text.themeValue} />
            <MutedParagraph>{text.themeText}</MutedParagraph>
          </Card>

          <Card title={text.achievements}>
            <MutedParagraph>{text.achievementsText}</MutedParagraph>
          </Card>

          <div style={{ gridColumn: "1 / -1" }}>
            <Card title={text.social}>
              <MutedParagraph>{text.socialText}</MutedParagraph>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

function Card({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.xl,
        padding: 18,
        boxShadow: theme.shadow.card
      }}
    >
      <div
        style={{
          fontWeight: 800,
          fontSize: 16,
          marginBottom: 12,
          color: theme.colors.text
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
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.lg,
        padding: "12px 14px",
        background: theme.colors.surfaceAlt,
        marginBottom: 10
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: theme.colors.textMuted,
          marginBottom: 6,
          fontWeight: 800
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 14,
          color: theme.colors.text,
          fontWeight: 700
        }}
      >
        {value}
      </div>
    </div>
  );
}

function MutedParagraph({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <p
      style={{
        margin: 0,
        color: theme.colors.textMuted,
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