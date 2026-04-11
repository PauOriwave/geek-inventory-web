import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getThemeById, AppThemeId } from "../theme";
import { getLocale } from "../i18n";
import WishlistClient from "./WishlistClient";

export type WishlistItem = {
  id: string;
  title?: string | null;
  name?: string | null;
  category?: string | null;
  createdAt?: string;
  targetPrice?: string | number | null;
  currentMarketValue?: string | number | null;
  platform?: string | null;
  region?: string | null;
  notes?: string | null;
};

type Me = {
  id: string;
  email?: string;
  plan?: string;
};

const API = process.env.NEXT_PUBLIC_API_URL!;

async function getWishlist(cookie: string): Promise<WishlistItem[]> {
  try {
    const res = await fetch(`${API}/wishlist`, {
      cache: "no-store",
      headers: { cookie }
    });

    if (!res.ok) return [];

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function getMe(cookie: string): Promise<Me | null> {
  try {
    const res = await fetch(`${API}/auth/me`, {
      cache: "no-store",
      headers: { cookie }
    });

    if (!res.ok) return null;

    return res.json();
  } catch {
    return null;
  }
}

export default async function WishlistPage({
  searchParams
}: {
  searchParams?:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
}) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const session = cookieStore.get("session")?.value;

  if (!session) {
    redirect("/login");
  }

  const sp =
    searchParams instanceof Promise ? await searchParams : searchParams ?? {};

  const locale = getLocale(sp);

  const themeId =
    (cookieStore.get("ui_theme")?.value as AppThemeId | undefined) ?? "classic";
  const theme = getThemeById(themeId);

  const [items, me] = await Promise.all([
    getWishlist(cookieHeader),
    getMe(cookieHeader)
  ]);

  return (
    <WishlistClient
      initialItems={items}
      locale={locale}
      themeId={theme.id}
      navTheme={theme}
      plan={me?.plan ?? "free"}
    />
  );
}