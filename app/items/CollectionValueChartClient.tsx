"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getThemeById } from "../theme";

type HistoryPoint = {
  date: string;
  total: number;
};

type CollectionHistoryResponse = {
  base: HistoryPoint[];
  market: HistoryPoint[];
};

type ChartRange = "7d" | "30d" | "90d" | "all";
type ChartSeries = "all" | "base" | "market";

export default function CollectionValueChartClient({
  initialHistory,
  initialRange,
  initialSeries,
  title,
  subtitle,
  locale,
  theme,
  category,
  apiBaseUrl
}: {
  initialHistory: CollectionHistoryResponse;
  initialRange: ChartRange;
  initialSeries: ChartSeries;
  title: string;
  subtitle: string;
  locale: "en" | "es";
  theme: ReturnType<typeof getThemeById>;
  category?: string;
  apiBaseUrl: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [range, setRange] = useState<ChartRange>(initialRange);
  const [series, setSeries] = useState<ChartSeries>(initialSeries);
  const [history, setHistory] = useState(initialHistory);

  // 👉 responsive width REAL
  const [containerWidth, setContainerWidth] = useState(800);

  useEffect(() => {
    function handleResize() {
      setContainerWidth(Math.min(window.innerWidth - 40, 1000));
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 👉 altura dinámica según dispositivo
  const height = containerWidth < 500 ? 260 : 400;

  function syncChartStateToUrl(nextRange: ChartRange, nextSeries: ChartSeries) {
    const params = new URLSearchParams(searchParams.toString());

    params.set("chartRange", nextRange);
    params.set("chartSeries", nextSeries);

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const values = [
    ...history.base.map((p) => p.total),
    ...history.market.map((p) => p.total)
  ];

  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);

  const padding = containerWidth < 500 ? 30 : 50;

  const toX = (index: number, length: number) =>
    padding + (index * (containerWidth - padding * 2)) / (length - 1 || 1);

  const toY = (value: number) =>
    padding +
    (1 - (value - min) / (max - min || 1)) *
      (height - padding * 2);

  const basePoints = history.base.map((p, i) => ({
    x: toX(i, history.base.length),
    y: toY(p.total)
  }));

  const marketPoints = history.market.map((p, i) => ({
    x: toX(i, history.market.length),
    y: toY(p.total)
  }));

  const buildPath = (points: any[]) => {
    if (points.length < 2) return "";
    return points.reduce(
      (acc, p, i) =>
        i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`,
      ""
    );
  };

  return (
    <section
      style={{
        marginTop: 14,
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.xl,
        padding: containerWidth < 500 ? 14 : 20
      }}
    >
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            fontWeight: 900,
            fontSize: containerWidth < 500 ? 16 : 20
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: 13,
            color: theme.colors.textMuted,
            marginTop: 6
          }}
        >
          {subtitle}
        </div>
      </div>

      {/* CONTROLES */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 12
        }}
      >
        {(["all", "base", "market"] as ChartSeries[]).map((s) => (
          <button
            key={s}
            onClick={() => {
              setSeries(s);
              syncChartStateToUrl(range, s);
            }}
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              border: "none",
              background:
                series === s ? theme.colors.black : theme.colors.surfaceAlt,
              color: series === s ? "white" : theme.colors.textMuted,
              fontWeight: 800,
              fontSize: 12
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* SVG */}
      <svg
        viewBox={`0 0 ${containerWidth} ${height}`}
        style={{
          width: "100%",
          height: "auto",
          display: "block"
        }}
      >
        {/* BASE */}
        <path
          d={buildPath(basePoints)}
          fill="none"
          stroke="#94A3B8"
          strokeWidth="2"
          strokeDasharray="5 6"
        />

        {/* MARKET */}
        <path
          d={buildPath(marketPoints)}
          fill="none"
          stroke={theme.colors.gold}
          strokeWidth="3"
        />
      </svg>
    </section>
  );
}