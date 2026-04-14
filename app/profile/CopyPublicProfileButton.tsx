"use client";

import { useState } from "react";
import { getThemeById } from "../theme";

export default function CopyPublicProfileButton({
  path,
  label,
  copiedLabel,
  errorLabel,
  theme
}: {
  path: string;
  label: string;
  copiedLabel: string;
  errorLabel: string;
  theme: ReturnType<typeof getThemeById>;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      const absoluteUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}${path}`
          : path;

      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      alert(errorLabel);
    }
  }

  return (
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
      {copied ? copiedLabel : label}
    </button>
  );
}