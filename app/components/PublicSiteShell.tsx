import type { ReactNode } from "react";
import { theme } from "../theme";

export default function PublicSiteShell({
  children,
  compact = false
}: {
  children: ReactNode;
  compact?: boolean;
}) {
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
            href="/"
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
                The Universal Collection Tracker
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
            <a href="/" style={navLink}>
              Home
            </a>

            <a href="/pricing" style={navLink}>
              Pricing
            </a>

            <a href="/login" style={navLink}>
              Login
            </a>

            <a href="/register" style={primaryCta}>
              Start free
            </a>
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
              Track your collection. Understand its value.
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
            <a href="/" style={footerLink}>
              Home
            </a>
            <a href="/pricing" style={footerLink}>
              Pricing
            </a>
            <a href="/login" style={footerLink}>
              Login
            </a>
            <a href="/register" style={footerLink}>
              Register
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