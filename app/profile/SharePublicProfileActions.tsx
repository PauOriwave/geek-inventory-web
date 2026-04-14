"use client";

import { useEffect, useState } from "react";
import { getThemeById } from "../theme";

export default function SharePublicProfileActions({
  path,
  locale,
  theme
}: {
  path: string;
  locale: "en" | "es";
  theme: ReturnType<typeof getThemeById>;
}) {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const absoluteUrl = origin ? `${origin}${path}` : path;

  const text = {
    copy: locale === "es" ? "Copiar enlace" : "Copy link",
    copied: locale === "es" ? "Enlace copiado" : "Link copied",
    share: locale === "es" ? "Compartir" : "Share",
    sharing: locale === "es" ? "Compartiendo..." : "Sharing...",
    x: locale === "es" ? "Compartir en X" : "Share on X",
    whatsapp: "WhatsApp",
    shareText:
      locale === "es"
        ? "Mira mi perfil público de coleccionista en DrakoryVault"
        : "Check out my public collector profile on DrakoryVault",
    copyError:
      locale === "es"
        ? "No se pudo copiar el enlace."
        : "Could not copy the link.",
    shareError:
      locale === "es"
        ? "No se pudo abrir el panel de compartir."
        : "Could not open the share panel."
  };

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      alert(text.copyError);
    }
  }

  async function handleNativeShare() {
    if (typeof navigator === "undefined" || !navigator.share) {
      await handleCopy();
      return;
    }

    try {
      setSharing(true);
      await navigator.share({
        title: "DrakoryVault",
        text: text.shareText,
        url: absoluteUrl
      });
    } catch {
      alert(text.shareError);
    } finally {
      setSharing(false);
    }
  }

  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `${text.shareText} ${absoluteUrl}`
  )}`;

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(
    `${text.shareText} ${absoluteUrl}`
  )}`;

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        alignItems: "center"
      }}
    >
      <button
        type="button"
        onClick={handleCopy}
        style={{
          border: `1px solid ${theme.colors.border}`,
          borderRadius: 999,
          padding: "10px 14px",
          background: theme.colors.surfaceAlt,
          color: theme.colors.text,
          fontWeight: 900,
          cursor: "pointer"
        }}
      >
        {copied ? text.copied : text.copy}
      </button>

      <button
        type="button"
        onClick={handleNativeShare}
        disabled={sharing}
        style={{
          border: "none",
          borderRadius: 999,
          padding: "10px 14px",
          background: theme.colors.black,
          color: "white",
          fontWeight: 900,
          cursor: sharing ? "not-allowed" : "pointer",
          opacity: sharing ? 0.75 : 1
        }}
      >
        {sharing ? text.sharing : text.share}
      </button>

      <a
        href={xHref}
        target="_blank"
        rel="noreferrer"
        style={{
          textDecoration: "none",
          borderRadius: 999,
          padding: "10px 14px",
          background: theme.colors.surface,
          color: theme.colors.text,
          fontWeight: 900,
          border: `1px solid ${theme.colors.border}`
        }}
      >
        {text.x}
      </a>

      <a
        href={whatsappHref}
        target="_blank"
        rel="noreferrer"
        style={{
          textDecoration: "none",
          borderRadius: 999,
          padding: "10px 14px",
          background: "#25D366",
          color: "white",
          fontWeight: 900
        }}
      >
        {text.whatsapp}
      </a>
    </div>
  );
}