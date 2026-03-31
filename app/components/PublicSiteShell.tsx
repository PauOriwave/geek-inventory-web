"use client";

import type { ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { theme } from "../theme";

export default function PublicSiteShell({
  children,
  compact = false
}: {
  children: ReactNode;
  compact?: boolean;
}) {
  const searchParams = useSearchParams();
  const lang = searchParams.get("lang") === "es" ? "es" : "en";

  function withLang(path: string) {
    return `${path}?lang=${lang}`;
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
        background: theme.colors.bg,
        color: theme.colors.text,
        fontFamily: "system-ui"
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          backdropFilter: "blur(10px)",
          background: "rgba(245,243,238,0.88)",
          borderBottom: `1px solid ${theme.colors.border}`
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
              color: theme.colors.text
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 999,
                background: theme.colors.gold,
                color: theme.colors.black,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: 18,
                flexShrink: 0,
                boxShadow: theme.shadow.soft
              }}
            >
              D
            </div>

            <div>
              <div style={{ fontWeight: 800, fontSize: 17 }}>DrakoryVault</div>
              <div
                style={{
                  fontSize: 12,
                  color: theme.colors.textMuted
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
            <a href={withLang("/")} style={navLink}>
              {text.home}
            </a>

            <a href={withLang("/pricing")} style={navLink}>
              {text.pricing}
            </a>

            <a href={withLang("/login")} style={navLink}>
              {text.login}
            </a>

            <a href={withLang("/register")} style={primaryCta}>
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
                href="/?lang=en"
                style={{
                  ...langSwitchLink,
                  background:
                    lang === "en" ? theme.colors.surfaceAlt : "transparent",
                  color: theme.colors.text
                }}
              >
                EN
              </a>

              <a
                href="/?lang=es"
                style={{
                  ...langSwitchLink,
                  background:
                    lang === "es" ? theme.colors.surfaceAlt : "transparent",
                  color: theme.colors.text
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
          borderTop: `1px solid ${theme.colors.border}`,
          background: theme.colors.surface
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
                color: theme.colors.textMuted,
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
            <a href={withLang("/")} style={footerLink}>
              {text.home}
            </a>
            <a href={withLang("/pricing")} style={footerLink}>
              {text.pricing}
            </a>
            <a href={withLang("/login")} style={footerLink}>
              {text.login}
            </a>
            <a href={withLang("/register")} style={footerLink}>
              {text.register}
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

const navLink: React.CSSProperties = {
  textDecoration: "none",
  color: theme.colors.text,
  padding: "10px 12px",
  borderRadius: 999,
  fontWeight: 700
};

const primaryCta: React.CSSProperties = {
  textDecoration: "none",
  background: theme.colors.black,
  color: "white",
  padding: "11px 16px",
  borderRadius: 999,
  fontWeight: 800,
  boxShadow: theme.shadow.soft
};

const footerLink: React.CSSProperties = {
  textDecoration: "none",
  color: theme.colors.textMuted
};

const langSwitchLink: React.CSSProperties = {
  textDecoration: "none",
  padding: "8px 10px",
  borderRadius: 999,
  border: `1px solid ${theme.colors.border}`,
  fontSize: 12,
  fontWeight: 800
};