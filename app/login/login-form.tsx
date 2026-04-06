"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { getThemeById, AppThemeId } from "../theme";

const API = process.env.NEXT_PUBLIC_API_URL!;

export default function LoginForm({
  locale
}: {
  locale: "en" | "es";
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const themeId =
    (typeof document !== "undefined"
      ? document.cookie
          .split("; ")
          .find((row) => row.startsWith("ui_theme="))
          ?.split("=")[1]
      : undefined) ?? "classic";

  const currentTheme = getThemeById(themeId as AppThemeId);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const text = {
    email: locale === "es" ? "Email" : "Email",
    password: locale === "es" ? "Contraseña" : "Password",
    submit: locale === "es" ? "Entrar" : "Login",
    loading: locale === "es" ? "Entrando..." : "Logging in...",
    error:
      locale === "es"
        ? "No se pudo iniciar sesión"
        : "Could not log in"
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || text.error);
      }

      if (data?.token) {
        document.cookie = `session=${data.token}; path=/; samesite=lax`;
      }

      router.push(`/items?lang=${searchParams.get("lang") === "es" ? "es" : "en"}`);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : text.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
      <label style={{ display: "grid", gap: 6 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: currentTheme.colors.textMuted
          }}
        >
          {text.email}
        </span>
        <input
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle(currentTheme)}
        />
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: currentTheme.colors.textMuted
          }}
        >
          {text.password}
        </span>
        <input
          name="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle(currentTheme)}
        />
      </label>

      <button type="submit" style={primaryButton(currentTheme)} disabled={loading}>
        {loading ? text.loading : text.submit}
      </button>
    </form>
  );
}

function inputStyle(
  currentTheme: ReturnType<typeof getThemeById>
): React.CSSProperties {
  return {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    borderRadius: 10,
    border: `1px solid ${currentTheme.colors.border}`,
    background: currentTheme.colors.surfaceAlt,
    color: currentTheme.colors.text,
    fontSize: 14,
    outline: "none"
  };
}

function primaryButton(
  currentTheme: ReturnType<typeof getThemeById>
): React.CSSProperties {
  return {
    marginTop: 4,
    border: "none",
    borderRadius: 999,
    padding: "12px 16px",
    background: currentTheme.colors.black,
    color: "white",
    fontWeight: 800,
    cursor: "pointer"
  };
}