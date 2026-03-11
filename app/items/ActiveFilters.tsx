import Link from "next/link";
import { theme } from "../theme";

export default function ActiveFilters({
  q,
  category,
  minPrice,
  maxPrice
}: {
  q?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
}) {
  const hasFilters = q || category || minPrice || maxPrice;
  if (!hasFilters) return null;

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        marginBottom: 12
      }}
    >
      {category && <Chip label={`Category: ${category}`} />}
      {q && <Chip label={`Search: ${q}`} />}
      {minPrice && <Chip label={`Min: ${minPrice}`} />}
      {maxPrice && <Chip label={`Max: ${maxPrice}`} />}

      <Link
        href="/items"
        style={{
          padding: "6px 10px",
          borderRadius: 999,
          background: theme.colors.danger,
          color: "white",
          fontSize: 12,
          textDecoration: "none",
          fontWeight: 700
        }}
      >
        Clear all
      </Link>
    </div>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: "6px 10px",
        borderRadius: 999,
        background: "#F3F4F6",
        color: theme.colors.text,
        fontSize: 12,
        border: `1px solid ${theme.colors.border}`
      }}
    >
      {label}
    </div>
  );
}