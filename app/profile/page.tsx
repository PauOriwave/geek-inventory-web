import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale } from "../i18n";
import {
  AppThemeId,
  getThemeById,
  getPremiumMonths
} from "../theme";
import ThemeSelector from "./ThemeSelector";
import AchievementsPanel from "./AchievementsPanel";
import CollectorLevelPanel from "./CollectorLevelPanel";

type Me = {
  id: string;
  email?: string;
  createdAt?: string;
  plan?: string;
  premiumStartedAt?: string | null;
};

type Achievement = {
  id: string;
  unlocked: boolean;
  progress: number;
  target: number;
  icon: string;
};

type Summary = {
  totalItems: number;
  totalUnits: number;
  totalValue: number;
};

const API = process.env.NEXT_PUBLIC_API_URL!;

async function safeFetchJson<T>(
  path: string,
  cookieHeader: string,
  fallback: T
): Promise<T> {
  try {
    const res = await fetch(`${API}${path}`, {
      cache: "no-store",
      headers: {
        cookie: cookieHeader
      }
    });

    if (!res.ok) {
      return fallback;
    }

    return (await res.json()) as T;
  } catch {
    return fallback;
  }
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

  const themeId =
    (cookieStore.get("ui_theme")?.value as AppThemeId | undefined) ?? "classic";
  const currentTheme = getThemeById(themeId);

  const [me, achievements, summary] = await Promise.all([
    safeFetchJson<Me | null>("/auth/me", cookieHeader, null),
    safeFetchJson<Achievement[]>("/achievements", cookieHeader, []),
    safeFetchJson<Summary>("/stats/summary", cookieHeader, {
      totalItems: 0,
      totalUnits: 0,
      totalValue: 0
    })
  ]);

  const safeAchievements = Array.isArray(achievements) ? achievements : [];

  const email = me?.email || "collector@drakoryvault.local";
  const createdAt = me?.createdAt || new Date().toISOString();
  const plan = me?.plan ?? "free";
  const isPremium = plan === "premium";
  const premiumMonths = getPremiumMonths(me?.premiumStartedAt ?? null);

  const text = {
    title: locale === "es" ? "Perfil del coleccionista" : "Collector profile",
    subtitle:
      locale === "es"
        ? "Tu identidad dentro de DrakoryVault: cuenta, progreso, preferencias y acceso a funciones premium."
        : "Your identity inside DrakoryVault: account, progress, preferences and access to premium features.",
    back:
      locale === "es" ? "← Volver al dashboard" : "← Back to dashboard",
    account: locale === "es" ? "Cuenta" : "Account",
    collectorIdentity:
      locale === "es" ? "Identidad de coleccionista" : "Collector identity",
    preferences: locale === "es" ? "Preferencias" : "Preferences",
    social:
      locale === "es"
        ? "Perfil público y compartir"
        : "Public profile & sharing",
    planTitle: locale === "es" ? "Plan y desbloqueos" : "Plan & unlocks",
    email: locale === "es" ? "Email" : "Email",
    memberSince: locale === "es" ? "Miembro desde" : "Member since",
    status: locale === "es" ? "Estado" : "Status",
    statusValue: locale === "es" ? "Cuenta activa" : "Active account",
    collectorRank:
      locale === "es" ? "Rango de coleccionista" : "Collector rank",
    rankValue: "Vault Explorer",
    language: locale === "es" ? "Idioma" : "Language",
    languageValue: locale === "es" ? "Español / Inglés" : "English / Spanish",
    currentThemeLabel:
      locale === "es" ? "Tema actual" : "Current theme",
    themeText:
      locale === "es"
        ? "Los themes premium ahora se desbloquean por fidelización. Cuanto más tiempo permanezcas en Premium, más estéticas podrás usar."
        : "Premium themes now unlock through loyalty. The longer you stay on Premium, the more aesthetics you can use.",
    socialText:
      locale === "es"
        ? "Más adelante podrás tener un perfil público y compartir tus vitrinas, hitos y colección en redes."
        : "Later you will be able to have a public profile and share your showcases, milestones and collection on social media.",
    freeLabel: locale === "es" ? "Plan Free" : "Free plan",
    premiumLabel: locale === "es" ? "Plan Premium" : "Premium plan",
    freeText:
      locale === "es"
        ? "Ya tienes la base del vault. Sube a Premium para desbloquear automatización, más profundidad y una experiencia mucho más completa."
        : "You already have the core of your vault. Upgrade to Premium to unlock automation, deeper insights and a much fuller experience.",
    premiumText:
      locale === "es"
        ? "Tienes acceso ampliado y una ruta de fidelización para desbloquear nuevos themes con el tiempo."
        : "You have expanded access and a loyalty path to unlock new themes over time.",
    upgrade: locale === "es" ? "Ver Premium" : "See Premium",
    premiumActive:
      locale === "es" ? "Premium activo" : "Premium active",
    included: locale === "es" ? "Incluido" : "Included",
    locked: locale === "es" ? "Bloqueado en Free" : "Locked on Free",
    freeFeatures:
      locale === "es"
        ? [
            "Gestión base de colección",
            "Dashboard y perfil de progreso",
            "Logros y nivel de coleccionista"
          ]
        : [
            "Core collection management",
            "Dashboard and progress profile",
            "Achievements and collector level"
          ],
    premiumFeatures:
      locale === "es"
        ? [
            "Valorar toda la colección de una vez",
            "Themes premium por fidelización",
            "Más profundidad y automatización futura"
          ]
        : [
            "Valuate the whole collection at once",
            "Loyalty-based premium themes",
            "More depth and future automation"
          ],
    loyaltyTitle:
      locale === "es" ? "Progreso de fidelización" : "Loyalty progress",
    premiumTime:
      locale === "es" ? "Tiempo en Premium" : "Time on Premium",
    premiumMonthsLabel:
      locale === "es" ? "meses premium" : "premium months",
    loyaltyText:
      locale === "es"
        ? "Tu antigüedad premium desbloquea nuevos themes y futuras recompensas visuales."
        : "Your premium age unlocks new themes and future visual rewards.",
    loyaltyHint:
      locale === "es"
        ? "Mantener Premium te dará acceso a estéticas nuevas a medida que aparezcan."
        : "Staying on Premium will give you access to new aesthetics as they appear."
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
            <PlanCard
              currentTheme={currentTheme}
              locale={locale}
              isPremium={isPremium}
              premiumMonths={premiumMonths}
              text={text}
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <CollectorLevelPanel
              locale={locale}
              summary={summary}
              achievements={safeAchievements}
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <Card title={text.preferences} currentTheme={currentTheme}>
              <MutedParagraph currentTheme={currentTheme}>
                {text.themeText}
              </MutedParagraph>

              <div style={{ marginTop: 14 }}>
                <ThemeSelector
                  currentThemeId={currentTheme.id as AppThemeId}
                  plan={plan}
                  premiumStartedAt={me?.premiumStartedAt ?? null}
                  locale={locale}
                />
              </div>
            </Card>
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <AchievementsPanel
              locale={locale}
              achievements={safeAchievements}
            />
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

function PlanCard({
  currentTheme,
  locale,
  isPremium,
  premiumMonths,
  text
}: {
  currentTheme: ReturnType<typeof getThemeById>;
  locale: "en" | "es";
  isPremium: boolean;
  premiumMonths: number;
  text: Record<string, string | string[]>;
}) {
  const freeFeatures = text.freeFeatures as string[];
  const premiumFeatures = text.premiumFeatures as string[];

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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 14
        }}
      >
        <div>
          <div
            style={{
              fontWeight: 800,
              fontSize: 16,
              color: currentTheme.colors.text
            }}
          >
            {text.planTitle as string}
          </div>

          <div
            style={{
              marginTop: 6,
              fontSize: 14,
              color: currentTheme.colors.textMuted,
              maxWidth: 760,
              lineHeight: 1.7
            }}
          >
            {isPremium ? (text.premiumText as string) : (text.freeText as string)}
          </div>
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            borderRadius: 999,
            background: isPremium
              ? currentTheme.colors.gold
              : currentTheme.colors.surfaceAlt,
            color: isPremium
              ? currentTheme.colors.black
              : currentTheme.colors.text,
            border: `1px solid ${currentTheme.colors.border}`,
            fontWeight: 900,
            fontSize: 12
          }}
        >
          {isPremium ? (text.premiumLabel as string) : (text.freeLabel as string)}
        </div>
      </div>

      {isPremium && (
        <div
          style={{
            marginBottom: 14,
            border: `1px solid ${currentTheme.colors.border}`,
            borderRadius: currentTheme.radius.lg,
            padding: 16,
            background: currentTheme.colors.surfaceAlt
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap"
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 900,
                  fontSize: 15,
                  color: currentTheme.colors.text
                }}
              >
                {text.loyaltyTitle as string}
              </div>

              <div
                style={{
                  marginTop: 6,
                  color: currentTheme.colors.textMuted,
                  fontSize: 14,
                  lineHeight: 1.7,
                  maxWidth: 720
                }}
              >
                {text.loyaltyText as string}
              </div>
            </div>

            <div
              style={{
                padding: "10px 14px",
                borderRadius: 999,
                background: currentTheme.colors.gold,
                color: currentTheme.colors.black,
                fontWeight: 900,
                fontSize: 12
              }}
            >
              {text.premiumTime as string}: {premiumMonths} {text.premiumMonthsLabel as string}
            </div>
          </div>

          <div
            style={{
              marginTop: 10,
              fontSize: 13,
              color: currentTheme.colors.textMuted,
              lineHeight: 1.6
            }}
          >
            {text.loyaltyHint as string}
          </div>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14
        }}
      >
        <div
          style={{
            border: `1px solid ${currentTheme.colors.border}`,
            borderRadius: currentTheme.radius.lg,
            padding: 16,
            background: currentTheme.colors.surfaceAlt
          }}
        >
          <div
            style={{
              fontWeight: 900,
              fontSize: 15,
              color: currentTheme.colors.text,
              marginBottom: 10
            }}
          >
            {text.freeLabel as string}
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {freeFeatures.map((feature) => (
              <FeatureRow
                key={feature}
                label={feature}
                badge={text.included as string}
                badgeTone="neutral"
                currentTheme={currentTheme}
              />
            ))}
          </div>
        </div>

        <div
          style={{
            border: `1px solid ${isPremium ? currentTheme.colors.gold : currentTheme.colors.border}`,
            borderRadius: currentTheme.radius.lg,
            padding: 16,
            background: isPremium
              ? currentTheme.colors.surfaceAlt
              : currentTheme.colors.surface
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              alignItems: "center",
              marginBottom: 10,
              flexWrap: "wrap"
            }}
          >
            <div
              style={{
                fontWeight: 900,
                fontSize: 15,
                color: currentTheme.colors.text
              }}
            >
              {text.premiumLabel as string}
            </div>

            {isPremium ? (
              <span
                style={{
                  padding: "4px 8px",
                  borderRadius: 999,
                  background: currentTheme.colors.gold,
                  color: currentTheme.colors.black,
                  fontSize: 11,
                  fontWeight: 900
                }}
              >
                {text.premiumActive as string}
              </span>
            ) : null}
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {premiumFeatures.map((feature) => (
              <FeatureRow
                key={feature}
                label={feature}
                badge={isPremium ? (text.included as string) : (text.locked as string)}
                badgeTone={isPremium ? "gold" : "locked"}
                currentTheme={currentTheme}
              />
            ))}
          </div>

          {!isPremium && (
            <a
              href={`/pricing?lang=${locale}`}
              style={{
                display: "inline-block",
                marginTop: 16,
                textDecoration: "none",
                background: currentTheme.colors.black,
                color: "white",
                padding: "11px 16px",
                borderRadius: 999,
                fontWeight: 900
              }}
            >
              {text.upgrade as string}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

function FeatureRow({
  label,
  badge,
  badgeTone,
  currentTheme
}: {
  label: string;
  badge: string;
  badgeTone: "neutral" | "gold" | "locked";
  currentTheme: ReturnType<typeof getThemeById>;
}) {
  const badgeStyle =
    badgeTone === "gold"
      ? {
          background: currentTheme.colors.gold,
          color: currentTheme.colors.black
        }
      : badgeTone === "locked"
        ? {
            background: currentTheme.colors.surfaceAlt,
            color: currentTheme.colors.textMuted
          }
        : {
            background: currentTheme.colors.surface,
            color: currentTheme.colors.text
          };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 10,
        alignItems: "center",
        padding: "10px 12px",
        borderRadius: currentTheme.radius.md,
        border: `1px solid ${currentTheme.colors.border}`,
        background: currentTheme.colors.surface
      }}
    >
      <div
        style={{
          color: currentTheme.colors.text,
          fontSize: 14,
          lineHeight: 1.5
        }}
      >
        {label}
      </div>

      <span
        style={{
          whiteSpace: "nowrap",
          padding: "4px 8px",
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 900,
          ...badgeStyle
        }}
      >
        {badge}
      </span>
    </div>
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