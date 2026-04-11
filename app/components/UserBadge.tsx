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

function getPlanMeta(plan?: string) {
  if (plan === "market_pro") {
    return {
      isPaid: true,
      label: "📈 Market Pro"
    };
  }

  if (plan === "premium") {
    return {
      isPaid: true,
      label: "💎 Premium"
    };
  }

  return {
    isPaid: false,
    label: "Free"
  };
}

export default async function UserBadge() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const themeId = (cookieStore.get("ui_theme")?.value as string) ?? "classic";
  const theme = getThemeById(themeId);

  const me = await getMe(cookieHeader);
  const planMeta = getPlanMeta(me.plan);
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
        background: planMeta.isPaid
          ? theme.colors.gold
          : theme.colors.surfaceAlt,
        color: planMeta.isPaid
          ? theme.colors.black
          : theme.colors.text
      }}
    >
      {planMeta.isPaid ? (
        <>
          {planMeta.label}
          {months > 0 ? ` · ${months}m` : ""}
        </>
      ) : (
        <>{planMeta.label}</>
      )}
    </div>
  );
}