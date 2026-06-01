"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getThemeById } from "../../theme";
import CompareSelector from "./CompareSelector";
import CompareChart from "./CompareChart";
import CompareMetrics from "./CompareMetrics";

type CompareItem = {
  id: string;
  name: string;
  category: string;
  platform?: string | null;
  marketValue?: string | number | null;
};

type Snapshot = {
  id: string;
  source: string;
  marketValue: string | number;
  confidence?: number | null;
  recordedAt: string;
};

type ChartRange = "7d" | "30d" | "90d" | "all";
type CompareMode = "performance" | "absolute";

type ItemsResponse = {
  items: CompareItem[];
};

export default function MarketComparePanel({
  locale,
  theme,
  apiBaseUrl
}: {
  locale: "en" | "es";
  theme: ReturnType<typeof getThemeById>;
  apiBaseUrl: string;
}) {
  const searchParams = useSearchParams();
  const hasAppliedUrlCompare = useRef(false);

  const [items, setItems] = useState<CompareItem[]>([]);
  const [itemAId, setItemAId] = useState("");
  const [itemBId, setItemBId] = useState("");
  const [snapshotsA, setSnapshotsA] = useState<Snapshot[]>([]);
  const [snapshotsB, setSnapshotsB] = useState<Snapshot[]>([]);
  const [range, setRange] = useState<ChartRange>("all");
  const [mode, setMode] = useState<CompareMode>("performance");
  const [loading, setLoading] = useState(false);
  const [insightCompareActive, setInsightCompareActive] = useState(false);

  const itemA = items.find((item) => item.id === itemAId) ?? null;
  const itemB = items.find((item) => item.id === itemBId) ?? null;

  const text = {
    title: locale === "es" ? "Market Compare" : "Market Compare",
    subtitle:
      locale === "es"
        ? "Compara el rendimiento de dos objetos de tu colección"
        : "Compare performance between two items in your collection",
    itemA: locale === "es" ? "Objeto A" : "Item A",
    itemB: locale === "es" ? "Objeto B" : "Item B",
    search:
      locale === "es"
        ? "Buscar objeto de tu colección..."
        : "Search collection item...",
    noResults: locale === "es" ? "Sin resultados" : "No results",
    performance: locale === "es" ? "Rendimiento %" : "Performance %",
    absolute: locale === "es" ? "Valor absoluto" : "Absolute value",
    noSelection:
      locale === "es"
        ? "Selecciona dos objetos para comparar su evolución."
        : "Select two items to compare their evolution.",
    noData:
      locale === "es"
        ? "No hay snapshots suficientes para comparar estos objetos."
        : "Not enough snapshots to compare these items.",
    range: locale === "es" ? "Rango" : "Range",
    mode: locale === "es" ? "Modo" : "Mode",
    loading:
      locale === "es" ? "Cargando comparación..." : "Loading comparison...",
    insightActive:
      locale === "es"
        ? "Comparación sugerida desde Market Intelligence"
        : "Suggested comparison from Market Intelligence",
    insightDescription:
      locale === "es"
        ? "Hemos seleccionado esta pieza y una alternativa similar para ayudarte a leer mejor su evolución."
        : "We selected this item and a similar alternative to help you read its movement more clearly.",
    suggested:
      locale === "es" ? "Sugerido automáticamente" : "Auto-suggested"
  };

  useEffect(() => {
    let cancelled = false;

    async function fetchItems() {
      try {
        const res = await fetch(`${apiBaseUrl}/items?page=1&pageSize=100`, {
          credentials: "include"
        });

        if (!res.ok) return;

        const data = (await res.json()) as ItemsResponse;

        if (!cancelled) {
          setItems(Array.isArray(data.items) ? data.items : []);
        }
      } catch {
        // Keep empty list.
      }
    }

    fetchItems();

    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl]);

  useEffect(() => {
    if (hasAppliedUrlCompare.current || items.length === 0) return;

    const compareA = searchParams.get("compareA");
    const compareB = searchParams.get("compareB");

    if (!compareA && !compareB) return;

    const validA = compareA
      ? items.find((item) => item.id === compareA) ?? null
      : null;

    const validB = compareB
      ? items.find((item) => item.id === compareB) ?? null
      : null;

    if (validA) {
      setItemAId(validA.id);
      setInsightCompareActive(true);
    }

    if (validB && validB.id !== validA?.id) {
      setItemBId(validB.id);
      setInsightCompareActive(true);
    }

    if (validA && !validB) {
      const suggested = findSuggestedRival(validA, items);

      if (suggested) {
        setItemBId(suggested.id);
        setInsightCompareActive(true);
      }
    }

    hasAppliedUrlCompare.current = true;
  }, [items, searchParams]);

  useEffect(() => {
    let cancelled = false;

    async function fetchSnapshots() {
      if (!itemAId || !itemBId) {
        setSnapshotsA([]);
        setSnapshotsB([]);
        return;
      }

      setLoading(true);

      try {
        const [resA, resB] = await Promise.all([
          fetch(`${apiBaseUrl}/items/${itemAId}/snapshots`, {
            credentials: "include"
          }),
          fetch(`${apiBaseUrl}/items/${itemBId}/snapshots`, {
            credentials: "include"
          })
        ]);

        const [dataA, dataB] = await Promise.all([
          resA.ok ? resA.json() : [],
          resB.ok ? resB.json() : []
        ]);

        if (!cancelled) {
          setSnapshotsA(Array.isArray(dataA) ? dataA : []);
          setSnapshotsB(Array.isArray(dataB) ? dataB : []);
        }
      } catch {
        if (!cancelled) {
          setSnapshotsA([]);
          setSnapshotsB([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchSnapshots();

    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl, itemAId, itemBId]);

  const filteredA = useMemo(
    () => filterSnapshotsByRange(snapshotsA, range),
    [snapshotsA, range]
  );

  const filteredB = useMemo(
    () => filterSnapshotsByRange(snapshotsB, range),
    [snapshotsB, range]
  );

  const hasEnoughData = filteredA.length >= 2 && filteredB.length >= 2;

  return (
    <section
      id="market-compare"
      style={{
        scrollMarginTop: 24,
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.xl,
        overflow: "hidden",
        boxShadow: theme.shadow.card,
        marginBottom: 18
      }}
    >
      <div
        style={{
          padding: "18px 18px 14px",
          borderBottom: `1px solid ${theme.colors.border}`,
          background:
            "linear-gradient(135deg, rgba(200,164,77,0.12) 0%, rgba(255,255,255,0) 70%)"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            alignItems: "flex-start"
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 900,
                fontSize: 20,
                color: theme.colors.text
              }}
            >
              {text.title}
            </div>
            <div
              style={{
                marginTop: 4,
                color: theme.colors.textMuted,
                fontSize: 13
              }}
            >
              {text.subtitle}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              justifyContent: "flex-end"
            }}
          >
            <ControlGroup label={text.range} theme={theme}>
              {(["7d", "30d", "90d", "all"] as ChartRange[]).map((next) => (
                <button
                  key={next}
                  type="button"
                  onClick={() => setRange(next)}
                  style={controlButtonStyle({
                    active: range === next,
                    theme
                  })}
                >
                  {next === "all" ? (locale === "es" ? "Todo" : "All") : next}
                </button>
              ))}
            </ControlGroup>

            <ControlGroup label={text.mode} theme={theme}>
              {(["performance", "absolute"] as CompareMode[]).map((next) => (
                <button
                  key={next}
                  type="button"
                  onClick={() => setMode(next)}
                  style={controlButtonStyle({
                    active: mode === next,
                    theme
                  })}
                >
                  {next === "performance" ? text.performance : text.absolute}
                </button>
              ))}
            </ControlGroup>
          </div>
        </div>
      </div>

      <div style={{ padding: 18 }}>
        {insightCompareActive && itemA ? (
          <div
            style={{
              marginBottom: 16,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radius.lg,
              background:
                "linear-gradient(135deg, rgba(200,164,77,0.16) 0%, rgba(59,130,246,0.08) 100%)",
              padding: 14,
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "center"
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 900,
                  color: theme.colors.text
                }}
              >
                ✨ {text.insightActive}
              </div>

              <div
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  color: theme.colors.textMuted,
                  lineHeight: 1.5
                }}
              >
                {text.insightDescription}
              </div>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                borderRadius: 999,
                padding: "7px 10px",
                background: theme.colors.surface,
                border: `1px solid ${theme.colors.border}`,
                color: theme.colors.textMuted,
                fontSize: 12,
                fontWeight: 900,
                whiteSpace: "nowrap"
              }}
            >
              {text.suggested}
            </div>
          </div>
        ) : null}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 12,
            marginBottom: 16
          }}
        >
          <CompareSelector
            label={text.itemA}
            placeholder={text.search}
            noResultsLabel={text.noResults}
            items={items}
            value={itemAId}
            onChange={(value) => {
              setItemAId(value);
              setInsightCompareActive(false);
            }}
            disabledId={itemBId}
            locale={locale}
            theme={theme}
            accent="#0B84D8"
          />

          <CompareSelector
            label={text.itemB}
            placeholder={text.search}
            noResultsLabel={text.noResults}
            items={items}
            value={itemBId}
            onChange={(value) => {
              setItemBId(value);
              setInsightCompareActive(false);
            }}
            disabledId={itemAId}
            locale={locale}
            theme={theme}
            accent={theme.colors.gold}
          />
        </div>

        {!itemA || !itemB ? (
          <EmptyState text={text.noSelection} theme={theme} />
        ) : loading ? (
          <EmptyState text={text.loading} theme={theme} />
        ) : !hasEnoughData ? (
          <EmptyState text={text.noData} theme={theme} />
        ) : (
          <>
            <CompareChart
              itemA={itemA}
              itemB={itemB}
              snapshotsA={filteredA}
              snapshotsB={filteredB}
              mode={mode}
              locale={locale}
              theme={theme}
            />

            <CompareMetrics
              itemA={itemA}
              itemB={itemB}
              snapshotsA={filteredA}
              snapshotsB={filteredB}
              mode={mode}
              locale={locale}
              theme={theme}
            />
          </>
        )}
      </div>
    </section>
  );
}

function findSuggestedRival(
  selectedItem: CompareItem,
  items: CompareItem[]
): CompareItem | null {
  const selectedValue =
    selectedItem.marketValue != null ? Number(selectedItem.marketValue) : null;

  const sameCategory = items.filter(
    (item) =>
      item.id !== selectedItem.id && item.category === selectedItem.category
  );

  const pool =
    sameCategory.length > 0
      ? sameCategory
      : items.filter((item) => item.id !== selectedItem.id);

  if (pool.length === 0) return null;

  if (selectedValue != null && Number.isFinite(selectedValue)) {
    const withComparableValue = pool
      .map((item) => ({
        item,
        value: item.marketValue != null ? Number(item.marketValue) : null
      }))
      .filter((entry) => entry.value != null && Number.isFinite(entry.value))
      .sort(
        (a, b) =>
          Math.abs((a.value ?? 0) - selectedValue) -
          Math.abs((b.value ?? 0) - selectedValue)
      );

    if (withComparableValue[0]) {
      return withComparableValue[0].item;
    }
  }

  return pool[0] ?? null;
}

function filterSnapshotsByRange(snapshots: Snapshot[], range: ChartRange) {
  const sorted = [...snapshots].sort(
    (a, b) =>
      new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );

  if (range === "all") return sorted;

  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  return sorted.filter(
    (snapshot) => new Date(snapshot.recordedAt).getTime() >= cutoff
  );
}

function ControlGroup({
  label,
  children,
  theme
}: {
  label: string;
  children: React.ReactNode;
  theme: ReturnType<typeof getThemeById>;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        alignItems: "center",
        flexWrap: "wrap"
      }}
    >
      <span
        style={{
          fontSize: 12,
          color: theme.colors.textMuted,
          fontWeight: 800
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

function controlButtonStyle({
  active,
  theme
}: {
  active: boolean;
  theme: ReturnType<typeof getThemeById>;
}): React.CSSProperties {
  return {
    border: `1px solid ${active ? theme.colors.gold : theme.colors.border}`,
    background: active ? "rgba(200,164,77,0.16)" : theme.colors.surfaceAlt,
    color: theme.colors.text,
    borderRadius: 999,
    padding: "7px 10px",
    fontSize: 12,
    fontWeight: 900,
    cursor: "pointer"
  };
}

function EmptyState({
  text,
  theme
}: {
  text: string;
  theme: ReturnType<typeof getThemeById>;
}) {
  return (
    <div
      style={{
        border: `1px dashed ${theme.colors.border}`,
        background: theme.colors.surfaceAlt,
        color: theme.colors.textMuted,
        borderRadius: theme.radius.lg,
        padding: 24,
        textAlign: "center",
        fontWeight: 700
      }}
    >
      {text}
    </div>
  );
}