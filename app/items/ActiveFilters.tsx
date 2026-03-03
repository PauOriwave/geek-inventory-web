import Link from "next/link";

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
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
      {category && <Chip label={`Category: ${category}`} />}
      {q && <Chip label={`Search: ${q}`} />}
      {minPrice && <Chip label={`Min: ${minPrice}`} />}
      {maxPrice && <Chip label={`Max: ${maxPrice}`} />}

      <Link
        href="/items"
        style={{
          padding: "6px 10px",
          borderRadius: 20,
          background: "#ef4444",
          color: "white",
          fontSize: 12,
          textDecoration: "none"
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
        borderRadius: 20,
        background: "#e5e7eb",
        fontSize: 12
      }}
    >
      {label}
    </div>
  );
}