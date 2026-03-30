"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import PublicSiteShell from "../components/PublicSiteShell";
import { theme } from "../theme";

const API = process.env.NEXT_PUBLIC_API_URL!;

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("All fields are required");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const registerRes = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.trim(),
          password
        })
      });

      const registerData = await registerRes.json().catch(() => null);

      if (!registerRes.ok) {
        throw new Error(registerData?.message || "Registration failed");
      }

      const loginRes = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.trim(),
          password
        })
      });

      const loginData = await loginRes.json().catch(() => null);

      if (!loginRes.ok) {
        throw new Error(loginData?.message || "Auto login failed");
      }

      if (!loginData?.token) {
        throw new Error("No session token received");
      }

      document.cookie = `session=${loginData.token}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;

      router.push("/items");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
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
              Start your collection vault
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 34,
                lineHeight: 1.1,
                fontWeight: 900
              }}
            >
              Create your account
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
              Begin with your free vault and grow into valuations, trends,
              unlockable themes and premium collector features over time.
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
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Confirm password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
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
                  background: theme.colors.gold,
                  color: theme.colors.black,
                  fontWeight: 900,
                  fontSize: 15,
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: theme.shadow.soft
                }}
              >
                {loading ? "Creating account…" : "Create account"}
              </button>
            </form>

            <div
              style={{
                marginTop: 18,
                fontSize: 14,
                color: theme.colors.textMuted
              }}
            >
              Already have an account?{" "}
              <a
                href="/login"
                style={{
                  color: theme.colors.link,
                  fontWeight: 800,
                  textDecoration: "none"
                }}
              >
                Sign in
              </a>
            </div>
          </div>

          <div
            style={{
              background: theme.colors.surfaceAlt,
              border: `1px solid ${theme.colors.border}`,
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
                  color: theme.colors.link,
                  fontWeight: 800,
                  marginBottom: 10
                }}
              >
                Free plan includes
              </div>

              <h2
                style={{
                  margin: 0,
                  fontSize: 30,
                  lineHeight: 1.15
                }}
              >
                Everything you need to begin tracking your collection properly.
              </h2>

              <p
                style={{
                  marginTop: 14,
                  color: theme.colors.textMuted,
                  lineHeight: 1.7,
                  fontSize: 15
                }}
              >
                Start with core inventory management, import/export workflows and
                a clean collector dashboard. Upgrade later for deeper valuation
                intelligence and premium themes.
              </p>
            </div>

            <div
              style={{
                marginTop: 22,
                display: "grid",
                gap: 10
              }}
            >
              <Benefit text="Track games, books, TCG, figures and more" />
              <Benefit text="Import and export your collection with CSV" />
              <Benefit text="See category value and top items" />
              <Benefit text="Grow into snapshots, movers and theme unlocks" />
            </div>
          </div>
        </div>
      </section>
    </PublicSiteShell>
  );
}

function Benefit({ text }: { text: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.lg,
        background: theme.colors.surface,
        padding: "12px 14px"
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: 999,
          background: theme.colors.gold,
          color: theme.colors.black,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 900,
          fontSize: 13,
          flexShrink: 0
        }}
      >
        ✓
      </div>

      <div
        style={{
          fontSize: 14,
          color: theme.colors.text
        }}
      >
        {text}
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