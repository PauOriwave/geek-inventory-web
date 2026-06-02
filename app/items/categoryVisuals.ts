export type CategoryVisual = {
  icon: string;
  color: string;
  background: string;
};

const CATEGORY_VISUALS: Record<string, CategoryVisual> = {
  videogame: {
    icon: "🎮",
    color: "#3B82F6",
    background: "rgba(59,130,246,0.14)"
  },
  book: {
    icon: "📚",
    color: "#10B981",
    background: "rgba(16,185,129,0.14)"
  },
  guide: {
    icon: "📖",
    color: "#14B8A6",
    background: "rgba(20,184,166,0.14)"
  },
  magazine: {
    icon: "📰",
    color: "#06B6D4",
    background: "rgba(6,182,212,0.14)"
  },
  comic: {
    icon: "💥",
    color: "#F97316",
    background: "rgba(249,115,22,0.14)"
  },
  tcg: {
    icon: "🃏",
    color: "#8B5CF6",
    background: "rgba(139,92,246,0.14)"
  },
  figure: {
    icon: "🗿",
    color: "#EC4899",
    background: "rgba(236,72,153,0.14)"
  },
  boardgame: {
    icon: "🎲",
    color: "#F59E0B",
    background: "rgba(245,158,11,0.14)"
  },
  miniature: {
    icon: "⚔️",
    color: "#EF4444",
    background: "rgba(239,68,68,0.14)"
  },
  lego: {
    icon: "🧱",
    color: "#EAB308",
    background: "rgba(234,179,8,0.14)"
  },
  movie: {
    icon: "🎬",
    color: "#6366F1",
    background: "rgba(99,102,241,0.14)"
  },
  merch: {
    icon: "🎁",
    color: "#64748B",
    background: "rgba(100,116,139,0.14)"
  }
};

export function getCategoryVisual(category: string): CategoryVisual {
  return (
    CATEGORY_VISUALS[category] ?? {
      icon: "📦",
      color: "#64748B",
      background: "rgba(100,116,139,0.14)"
    }
  );
}