"use client";

import type { ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getThemeById, type AppThemeId } from "../theme";

export default function PublicSiteShell({
  children,
  compact = false,
  themeId = "classic"
}: {
  children: ReactNode;
  compact?: boolean;
  themeId?: AppThemeId;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lang = searchParams.get("lang") === "es" ? "es" : "en";
  const currentTheme = getThemeById(themeId);

  function withLang(path: string, targetLang = lang) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", targetLang);
    const query = params.toString();
    return query ? `${path}?${query}` : path;
  }

  const text = {
    tagline:
      lang === "es"
        ? "El rastreador universal de colecciones"
        : "The Universal Collection Tracker",
    home: lang === "es" ? "Inicio" : "Home",
    pricing: lang === "es" ? "Precios" : "Pricing",
    login: lang === "es" ? "Entrar" : "Login",
    register: lang === "es" ? "Registro" : "Register",
    startFree: lang === "es" ? "Empezar gratis" : "Start free",
    footerText:
      lang === "es"
        ? "Controla tu colección. Entiende su valor."
        : "Track your collection. Understand its value."
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: currentTheme.colors.bg,
        color: currentTheme.colors.text,
        fontFamily: "system-ui"
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          backdropFilter: "blur(10px)",
          background:
            themeId === "classic"
              ? "rgba(245,243,238,0.88)"
              : `${currentTheme.colors.bg}E6`,
          borderBottom: `1px solid ${currentTheme.colors.border}`
        }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: compact ? "14px 24px" : "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap"
          }}
        >
          <a
            href={withLang("/")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              textDecoration: "none",
              color: currentTheme.colors.text
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 999,
                background: currentTheme.colors.gold,
                color: currentTheme.colors.black,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: 18,
                flexShrink: 0,
                boxShadow: currentTheme.shadow.soft
              }}
            >
              D
            </div>

            <div>
              <div style={{ fontWeight: 800, fontSize: 17 }}>DrakoryVault</div>
              <div
                style={{
                  fontSize: 12,
                  color: currentTheme.colors.textMuted
                }}
              >
                {text.tagline}
              </div>
            </div>
          </a>

          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap"
            }}
          >
            <a href={withLang("/")} style={navLink(currentTheme)}>
              {text.home}
            </a>

            <a href={withLang("/pricing")} style={navLink(currentTheme)}>
              {text.pricing}
            </a>

            <a href={withLang("/login")} style={navLink(currentTheme)}>
              {text.login}
            </a>

            <a href={withLang("/register")} style={primaryCta(currentTheme)}>
              {text.startFree}
            </a>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginLeft: 4
              }}
            >
              <a
                href={withLang(pathname, "en")}
                style={{
                  ...langSwitchLink(currentTheme),
                  background:
                    lang === "en"
                      ? currentTheme.colors.surfaceAlt
                      : "transparent",
                  color: currentTheme.colors.text
                }}
              >
                EN
              </a>

              <a
                href={withLang(pathname, "es")}
                style={{
                  ...langSwitchLink(currentTheme),
                  background:
                    lang === "es"
                      ? currentTheme.colors.surfaceAlt
                      : "transparent",
                  color: currentTheme.colors.text
                }}
              >
                ES
              </a>
            </div>
          </nav>
        </div>
      </header>

      {children}

      <footer
        style={{
          marginTop: 56,
          borderTop: `1px solid ${currentTheme.colors.border}`,
          background: currentTheme.colors.surface
        }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap"
          }}
        >
          <div>
            <div style={{ fontWeight: 800 }}>DrakoryVault</div>
            <div
              style={{
                fontSize: 13,
                color: currentTheme.colors.textMuted,
                marginTop: 4
              }}
            >
              {text.footerText}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 14,
              flexWrap: "wrap",
              fontSize: 13
            }}
          >
            <a href={withLang("/")} style={footerLink(currentTheme)}>
              {text.home}
            </a>
            <a href={withLang("/pricing")} style={footerLink(currentTheme)}>
              {text.pricing}
            </a>
            <a href={withLang("/login")} style={footerLink(currentTheme)}>
              {text.login}
            </a>
            <a href={withLang("/register")} style={footerLink(currentTheme)}>
              {text.register}
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function navLink(currentTheme: ReturnType<typeof getThemeById>): React.CSSProperties {
  return {
    textDecoration: "none",
    color: currentTheme.colors.text,
    padding: "10px 12px",
    borderRadius: 999,
    fontWeight: 700
  };
}

function primaryCta(
  currentTheme: ReturnType<typeof getThemeById>
): React.CSSProperties {
  return {
    textDecoration: "none",
    background: currentTheme.colors.black,
    color: "white",
    padding: "11px 16px",
    borderRadius: 999,
    fontWeight: 800,
    boxShadow: currentTheme.shadow.soft
  };
}

function footerLink(
  currentTheme: ReturnType<typeof getThemeById>
): React.CSSProperties {
  return {
    textDecoration: "none",
    color: currentTheme.colors.textMuted
  };
}

function langSwitchLink(
  currentTheme: ReturnType<typeof getThemeById>
): React.CSSProperties {
  return {
    textDecoration: "none",
    padding: "8px 10px",
    borderRadius: 999,
    border: `1px solid ${currentTheme.colors.border}`,
    fontSize: 12,
    fontWeight: 800
  };
}