import { cookies } from "next/headers";
import { getThemeById, AppThemeId } from "../theme";
import { getCategoryLabel } from "./categoryLabels";
import CollectionValueChartClient from "./CollectionValueChartClient";

type HistoryPoint = {
  date: string;
  total: number;
};

type CollectionHistoryResponse = {
  base: HistoryPoint[];
  market: HistoryPoint[];
};

const API = process.env.NEXT_PUBLIC_API_URL!;

async function getCollectionHistory(
  cookieHeader: string,
  category?: string,
  range: "7d" | "30d" | "90d" | "all" = "all"
): Promise<CollectionHistoryResponse> {
  try {
    const params = new URLSearchParams();

    if (category) {
      params.set("category", category);
    }

    params.set("range", range);

    const qs = params.toString() ? `?${params.toString()}` : "";

    const res = await fetch(`${API}/stats/collection-history${qs}`, {
      cache: "no-store",
      headers: {
        cookie: cookieHeader
      }
    });

    if (!res.ok) {
      return { base: [], market: [] };
    }

    const data = await res.json();

    return {
      base: Array.isArray(data?.base) ? data.base : [],
      market: Array.isArray(data?.market) ? data.market : []
    };
  } catch {
    return { base: [], market: [] };
  }
}

export default async function CollectionValueChart({
  category,
  locale = "en"
}: {
  category?: string;
  locale?: "en" | "es";
}) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const themeId =
    (cookieStore.get("ui_theme")?.value as AppThemeId | undefined) ?? "classic";
  const theme = getThemeById(themeId);

  const history = await getCollectionHistory(cookieHeader, category, "all");

  const title = category
    ? locale === "es"
      ? `Evolución de ${getCategoryLabel(category, locale)}`
      : `${getCategoryLabel(category, locale)} trend`
    : locale === "es"
      ? "Evolución del valor de la colección"
      : "Collection value evolution";

  const subtitle = category
    ? locale === "es"
      ? "Histórico filtrado por categoría"
      : "History filtered by category"
    : locale === "es"
      ? "Base introducida + validación de mercado"
      : "Entered baseline + market validation";

  return (
    <CollectionValueChartClient
      initialHistory={history}
      title={title}
      subtitle={subtitle}
      locale={locale}
      theme={theme}
      category={category}
      apiBaseUrl={API}
    />
  );
}