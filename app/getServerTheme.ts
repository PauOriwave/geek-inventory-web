import { cookies } from "next/headers";
import { AppThemeId, getThemeById } from "./theme";

export async function getServerTheme() {
  const cookieStore = await cookies();
  const themeId =
    (cookieStore.get("ui_theme")?.value as AppThemeId | undefined) ?? "classic";

  return getThemeById(themeId);
}