"use client";

import { useMemo, useState } from "react";
import { getThemeById } from "../../theme";
import { getCategoryLabel } from "../../items/categoryLabels";

type CompareItem = {
  id: string;
  name: string;
  category: string;
  platform?: string | null;
  marketValue?: string | number | null;
};

export default function CompareSelector({
  label,
  placeholder,
  noResultsLabel,
  items,
  value,
  onChange,
  disabledId,
  locale,
  theme,
  accent
}: {
  label: string;
  placeholder: string;
  noResultsLabel: string;
  items: CompareItem[];
  value: string;
  onChange: (id: string) => void;
  disabledId?: string;
  locale: "en" | "es";
  theme: ReturnType<typeof getThemeById>;
  accent: string;
}) {
  const [query, setQuery] = useState("");

  const selectedItem = items.find((item) => item.id === value) ?? null;

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return items
      .filter((item) => item.id !== disabledId)
      .filter((item) => {
        if (!normalizedQuery) return true;

        return [
          item.name,
          item.category,
          item.platform ?? "",
          getCategoryLabel(item.category, locale)
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .slice(0, 6);
  }, [disabledId, items, locale, query]);

  return (
    <div
      style={{
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.lg,
        background: theme.colors.surfaceAlt,
        padding: 14,
        minWidth: 0
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          alignItems: "center",
          marginBottom: 10
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            minWidth: 0
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: accent,
              flexShrink: 0
            }}
          />
          <span
            style={{
              fontSize: 13,
              fontWeight: 900,
              color: theme.colors.text
            }}
          >
            {label}
          </span>
        </div>

        {selectedItem ? (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setQuery("");
            }}
            style={{
              border: `1px solid ${theme.colors.border}`,
              background: theme.colors.surface,
              color: theme.colors.textMuted,
              borderRadius: 999,
              padding: "5px 8px",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 900
            }}
          >
            Clear
          </button>
        ) : null}
      </div>

      {selectedItem ? (
        <button
          type="button"
          onClick={() => onChange("")}
          style={{
            width: "100%",
            textAlign: "left",
            border: `1px solid ${accent}`,
            background: theme.colors.surface,
            borderRadius: theme.radius.md,
            padding: 12,
            cursor: "pointer"
          }}
        >
          <div
            style={{
              fontWeight: 900,
              color: theme.colors.text,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}
          >
            {selectedItem.name}
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: 12,
              color: theme.colors.textMuted,
              display: "flex",
              gap: 8,
              flexWrap: "wrap"
            }}
          >
            <span>{getCategoryLabel(selectedItem.category, locale)}</span>
            {selectedItem.platform ? <span>· {selectedItem.platform}</span> : null}
            {selectedItem.marketValue != null ? (
              <span>· {Number(selectedItem.marketValue).toFixed(2)} €</span>
            ) : null}
          </div>
        </button>
      ) : (
        <>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
            style={{
              width: "100%",
              boxSizing: "border-box",
              border: `1px solid ${theme.colors.border}`,
              background: theme.colors.surface,
              color: theme.colors.text,
              borderRadius: theme.radius.md,
              padding: "11px 12px",
              outline: "none",
              fontSize: 14,
              fontWeight: 700
            }}
          />

          <div
            style={{
              display: "grid",
              gap: 8,
              marginTop: 10
            }}
          >
            {filteredItems.length === 0 ? (
              <div
                style={{
                  color: theme.colors.textMuted,
                  fontSize: 13,
                  padding: 10
                }}
              >
                {noResultsLabel}
              </div>
            ) : (
              filteredItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onChange(item.id);
                    setQuery("");
                  }}
                  style={{
                    border: `1px solid ${theme.colors.border}`,
                    background: theme.colors.surface,
                    color: theme.colors.text,
                    borderRadius: theme.radius.md,
                    padding: 10,
                    textAlign: "left",
                    cursor: "pointer"
                  }}
                >
                  <div
                    style={{
                      fontWeight: 900,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {item.name}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 12,
                      color: theme.colors.textMuted,
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap"
                    }}
                  >
                    <span>{getCategoryLabel(item.category, locale)}</span>
                    {item.platform ? <span>· {item.platform}</span> : null}
                    {item.marketValue != null ? (
                      <span>· {Number(item.marketValue).toFixed(2)} €</span>
                    ) : null}
                  </div>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}