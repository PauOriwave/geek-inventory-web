"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import PublicSiteShell from "../components/PublicSiteShell";
import { theme } from "../theme";

const API = process.env.NEXT_PUBLIC_API_URL!;

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.trim(),
          password
        })
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Login failed");
      }

      if (!data?.token) {
        throw new Error("No session token received");
      }

      document.cookie = `session=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;

      router.push("/items");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PublicSiteShell compact>
      <section
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "34px 24px 72px 24px"
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(320px, 460px) minmax(320px, 1fr)",
            gap: 24,
            alignItems: "stretch"
          }}
        >
          <div
            style={{
              background: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radius.xl,
              padding: 24,
              boxShadow: theme.shadow.card
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "6px 12px",
                borderRadius: 999,
                background: theme.colors.surfaceAlt,
                border: `1px solid ${theme.colors.border}`,
                color: theme.colors.link,
                fontWeight: 800,
                fontSize: 12,
                marginBottom: 14
              }}
            >
              Welcome back
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 34,
                lineHeight: 1.1,
                fontWeight: 900
              }}
            >
              Sign in to your vault
            </h1>

            <p
              style={{
                marginTop: 12,
                marginBottom: 0,
                color: theme.colors.textMuted,
                lineHeight: 1.7,
                fontSize: 15
              }}
            >
              Access your collection dashboard, valuation history, category trends
              and all your tracked items.
            </p>

            <form
              onSubmit={handleSubmit}
              style={{
                marginTop: 22,
                display: "grid",
                gap: 14
              }}
            >
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  autoComplete="current-password"
                  style={inputStyle}
                />
              </div>

              {error && (
                <div
                  style={{
                    border: `1px solid rgba(180,35,24,0.18)`,
                    background: "#FEF3F2",
                    color: theme.colors.danger,
                    borderRadius: theme.radius.md,
                    padding: "10px 12px",
                    fontSize: 14
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 4,
                  border: "none",
                  borderRadius: 999,
                  padding: "12px 16px",
                  background: theme.colors.black,
                  color: "white",
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: theme.shadow.soft
                }}
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <div
              style={{
                marginTop: 18,
                fontSize: 14,
                color: theme.colors.textMuted
              }}
            >
              Don&apos;t have an account?{" "}
              <a
                href="/register"
                style={{
                  color: theme.colors.link,
                  fontWeight: 800,
                  textDecoration: "none"
                }}
              >
                Create one
              </a>
            </div>
          </div>

          <div
            style={{
              background: theme.colors.black,
              color: "white",
              borderRadius: theme.radius.xl,
              padding: 26,
              boxShadow: theme.shadow.card,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.72)",
                  fontWeight: 800,
                  marginBottom: 10
                }}
              >
                Collector workspace
              </div>

              <h2
                style={{
                  margin: 0,
                  fontSize: 30,
                  lineHeight: 1.15
                }}
              >
                Track items, trends and valuation history from one premium dashboard.
              </h2>

              <p
                style={{
                  marginTop: 14,
                  color: "rgba(255,255,255,0.76)",
                  lineHeight: 1.7,
                  fontSize: 15
                }}
              >
                DrakoryVault is designed for collectors who want more than a
                spreadsheet: category insight, top movers, snapshots and a vault
                experience that feels premium.
              </p>
            </div>

            <div
              style={{
                marginTop: 24,
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 12
              }}
            >
              <DarkStat label="Snapshots" value="Historical" />
              <DarkStat label="Themes" value="Unlockable" />
              <DarkStat label="Collection" value="Tracked" />
              <DarkStat label="Insights" value="Actionable" />
            </div>
          </div>
        </div>
      </section>
    </PublicSiteShell>
  );
}

function DarkStat({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: theme.radius.lg,
        padding: 14,
        background: "rgba(255,255,255,0.04)"
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: "rgba(255,255,255,0.64)",
          marginBottom: 6
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontWeight: 800,
          fontSize: 18
        }}
      >
        {value}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 6,
  fontSize: 13,
  fontWeight: 800,
  color: theme.colors.text
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  borderRadius: theme.radius.md,
  border: `1px solid ${theme.colors.border}`,
  background: theme.colors.surfaceAlt,
  color: theme.colors.text,
  outline: "none",
  fontSize: 14
};