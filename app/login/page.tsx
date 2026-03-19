"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL!;

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Login failed");
      }

      router.push("/items");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#F5F7FB",
        padding: 24,
        fontFamily: "system-ui"
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: 20,
          padding: 24,
          boxShadow: "0 8px 24px rgba(16, 24, 40, 0.06)"
        }}
      >
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>
          Login
        </h1>

        <p style={{ color: "#6B7280", marginTop: 8, marginBottom: 18 }}>
          Access your collection vault
        </p>

        <div style={{ display: "grid", gap: 12 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              border: "none",
              background: "#D4AF37",
              color: "#111827",
              fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Logging in…" : "Login"}
          </button>
        </div>

        {error && (
          <div style={{ marginTop: 12, color: "#EF4444", fontSize: 14 }}>
            {error}
          </div>
        )}

        <p style={{ marginTop: 16, fontSize: 14, color: "#6B7280" }}>
          No account yet? <a href="/register">Create one</a>
        </p>
      </form>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid #E5E7EB",
  background: "white",
  outline: "none"
};