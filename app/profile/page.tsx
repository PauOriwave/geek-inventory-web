import { cookies } from "next/headers";

const API = process.env.NEXT_PUBLIC_API_URL!;

async function getMe(cookieHeader: string) {
  const res = await fetch(`${API}/auth/me`, {
    headers: {
      cookie: cookieHeader
    },
    cache: "no-store"
  });

  if (!res.ok) {
    throw new Error("Failed to fetch user");
  }

  return res.json();
}

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const user = await getMe(cookieHeader);

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Profile</h1>

      <div
        style={{
          marginTop: 20,
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 16,
          maxWidth: 400
        }}
      >
        <div style={{ marginBottom: 10 }}>
          <strong>Email:</strong> {user.email}
        </div>

        <div style={{ marginBottom: 10 }}>
          <strong>Plan:</strong>{" "}
          <span
            style={{
              padding: "4px 8px",
              borderRadius: 8,
              background: user.plan === "premium" ? "#111827" : "#e5e7eb",
              color: user.plan === "premium" ? "white" : "#111827",
              fontWeight: 700,
              fontSize: 12
            }}
          >
            {user.plan.toUpperCase()}
          </span>
        </div>

        <div style={{ fontSize: 12, color: "#6b7280" }}>
          {user.plan === "free"
            ? "Upgrade to Premium to unlock full features"
            : "You have full access"}
        </div>
      </div>
    </main>
  );
}