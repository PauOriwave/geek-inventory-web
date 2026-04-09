import { cookies } from "next/headers";
import { getThemeById, getPremiumMonths } from "../theme";

type Me = {
  id: string;
  plan?: string;
  premiumStartedAt?: string | null;
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
    return { id: "unknown", plan: "free" };
  }

  return res.json();
}

export default async function UserBadge() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const themeId =
    (cookieStore.get("ui_theme")?.value as any) ?? "classic";
  const theme = getThemeById(themeId);

  const me = await getMe(cookieHeader);

  const isPremium = me.plan === "premium";
  const months = getPremiumMonths(me.premiumStartedAt ?? null);

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 800,
        border: `1px solid ${theme.colors.border}`,
        background: isPremium
          ? theme.colors.gold
          : theme.colors.surfaceAlt,
        color: isPremium
          ? theme.colors.black
          : theme.colors.text
      }}
    >
      {isPremium ? (
        <>
          💎 Premium · {months}m
        </>
      ) : (
        <>Free</>
      )}
    </div>
  );
}