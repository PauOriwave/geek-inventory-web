"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { theme } from "../theme";

export default function LogoutButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = searchParams.get("lang") === "es" ? "es" : "en";

  function onLogout() {
    document.cookie =
      "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax";
    router.push(`/login?lang=${locale}`);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onLogout}
      style={{
        border: "none",
        borderRadius: 999,
        padding: "10px 14px",
        background: theme.colors.gold,
        color: theme.colors.black,
        fontWeight: 900,
        cursor: "pointer"
      }}
    >
      {locale === "es" ? "Salir" : "Logout"}
    </button>
  );
}