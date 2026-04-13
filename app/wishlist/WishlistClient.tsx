"use client";

import { useMemo, useState } from "react";
import { AppThemeId, getThemeById } from "../theme";
import type { WishlistItem } from "./page";

const API = process.env.NEXT_PUBLIC_API_URL!;

function isPaidPlan(plan?: string) {
  return plan === "premium" || plan === "market_pro";
}

function formatPrice(value?: string | number | null) {
  if (value == null) return "—";
  const num = Number(value);
  if (Number.isNaN(num)) return "—";
  return `${num.toFixed(2)} €`;
}

function getDisplayName(item: WishlistItem) {
  return item.name || item.title || "Untitled item";
}

function getWishlistStatus(
  targetPrice?: string | number | null,
  currentMarketValue?: string | number | null,
  locale: "en" | "es" = "en"
) {
  if (targetPrice == null || currentMarketValue == null) {
    return locale === "es" ? "Sin objetivo" : "No target";
  }

  const target = Number(targetPrice);
  const current = Number(currentMarketValue);

  if (Number.isNaN(target) || Number.isNaN(current)) {
    return locale === "es" ? "Sin objetivo" : "No target";
  }

  if (current <= target) {
    return locale === "es" ? "Buen momento" : "Good moment";
  }

  if (current <= target * 1.1) {
    return locale === "es" ? "Vigilar de cerca" : "Watch closely";
  }

  return locale === "es" ? "Por encima del objetivo" : "Above target";
}

function getDeltaData(
  targetPrice?: string | number | null,
  currentMarketValue?: string | number | null,
  locale: "en" | "es" = "en"
) {
  if (targetPrice == null || currentMarketValue == null) {
    return {
      label: "—",
      tone: "neutral" as const,
      message:
        locale === "es" ? "Falta precio o objetivo" : "Missing price or target"
    };
  }

  const target = Number(targetPrice);
  const current = Number(currentMarketValue);

  if (Number.isNaN(target) || Number.isNaN(current)) {
    return {
      label: "—",
      tone: "neutral" as const,
      message: locale === "es" ? "Datos no válidos" : "Invalid data"
    };
  }

  const delta = current - target;
  const abs = Math.abs(delta).toFixed(2);
  const prefix = delta > 0 ? "+" : delta < 0 ? "-" : "±";

  if (current <= target) {
    return {
      label: `${prefix}${abs} €`,
      tone: "positive" as const,
      message:
        locale === "es"
          ? "Está en tu objetivo o por debajo"
          : "At or below your target"
    };
  }

  if (current <= target * 1.1) {
    return {
      label: `+${abs} €`,
      tone: "warning" as const,
      message:
        locale === "es"
          ? "Está cerca de tu objetivo"
          : "Close to your target"
    };
  }

  return {
    label: `+${abs} €`,
    tone: "danger" as const,
    message:
      locale === "es"
        ? "Bastante por encima del objetivo"
        : "Well above your target"
  };
}

function getSessionToken() {
  if (typeof document === "undefined") return null;

  const entry = document.cookie
    .split("; ")
    .find((row) => row.startsWith("session="));

  return entry ? decodeURIComponent(entry.split("=")[1]) : null;
}

function getAuthHeaders(): Record<string, string> {
  const token = getSessionToken();

  if (!token) return {};

  return {
    Authorization: `Bearer ${token}`
  };
}

function getPlatformOptions(category: string, locale: "en" | "es") {
  const commonOther = [
    {
      value: "",
      label: locale === "es" ? "Sin especificar" : "Not specified"
    }
  ];

  const byCategory: Record<string, { value: string; label: string }[]> = {
    videogame: [
      { value: "", label: locale === "es" ? "Sin especificar" : "Not specified" },
      { value: "PS1", label: "PS1" },
      { value: "PS2", label: "PS2" },
      { value: "PS3", label: "PS3" },
      { value: "PS4", label: "PS4" },
      { value: "PS5", label: "PS5" },
      { value: "PSP", label: "PSP" },
      { value: "PS Vita", label: "PS Vita" },
      { value: "Xbox", label: "Xbox" },
      { value: "Xbox 360", label: "Xbox 360" },
      { value: "Xbox One", label: "Xbox One" },
      { value: "Xbox Series", label: "Xbox Series" },
      { value: "NES", label: "NES" },
      { value: "SNES", label: "SNES" },
      { value: "Nintendo 64", label: "Nintendo 64" },
      { value: "GameCube", label: "GameCube" },
      { value: "Wii", label: "Wii" },
      { value: "Wii U", label: "Wii U" },
      { value: "Switch", label: "Switch" },
      { value: "Game Boy", label: "Game Boy" },
      { value: "Game Boy Color", label: "Game Boy Color" },
      { value: "Game Boy Advance", label: "Game Boy Advance" },
      { value: "Nintendo DS", label: "Nintendo DS" },
      { value: "Nintendo 3DS", label: "Nintendo 3DS" },
      { value: "Mega Drive", label: "Mega Drive" },
      { value: "Master System", label: "Master System" },
      { value: "Dreamcast", label: "Dreamcast" },
      { value: "PC", label: "PC" }
    ],
    movie: [
      { value: "", label: locale === "es" ? "Sin especificar" : "Not specified" },
      { value: "DVD", label: "DVD" },
      { value: "Blu-ray", label: "Blu-ray" },
      { value: "4K UHD", label: "4K UHD" },
      { value: "VHS", label: "VHS" }
    ],
    book: [
      { value: "", label: locale === "es" ? "Sin especificar" : "Not specified" },
      { value: "Hardcover", label: "Hardcover" },
      { value: "Paperback", label: "Paperback" },
      { value: "Pocket", label: "Pocket" }
    ],
    comic: [
      { value: "", label: locale === "es" ? "Sin especificar" : "Not specified" },
      { value: "Single Issue", label: "Single Issue" },
      { value: "TPB", label: "TPB" },
      { value: "Hardcover", label: "Hardcover" },
      { value: "Omnibus", label: "Omnibus" },
      { value: "Manga", label: "Manga" }
    ],
    boardgame: [
      { value: "", label: locale === "es" ? "Sin especificar" : "Not specified" },
      { value: "Standard", label: "Standard" },
      { value: "Expansion", label: "Expansion" },
      { value: "Collector Edition", label: "Collector Edition" }
    ],
    tcg: [
      { value: "", label: locale === "es" ? "Sin especificar" : "Not specified" },
      { value: "Pokemon", label: "Pokemon" },
      { value: "Yu-Gi-Oh!", label: "Yu-Gi-Oh!" },
      { value: "Magic", label: "Magic" },
      { value: "One Piece", label: "One Piece" },
      { value: "Lorcana", label: "Lorcana" }
    ],
    figure: [
      { value: "", label: locale === "es" ? "Sin especificar" : "Not specified" },
      { value: "PVC", label: "PVC" },
      { value: "Statue", label: "Statue" },
      { value: "Nendoroid", label: "Nendoroid" },
      { value: "Figma", label: "Figma" },
      { value: "Funko Pop", label: "Funko Pop" }
    ],
    lego: [
      { value: "", label: locale === "es" ? "Sin especificar" : "Not specified" },
      { value: "Set", label: "Set" },
      { value: "Minifigure", label: "Minifigure" },
      { value: "Promotional", label: "Promotional" }
    ],
    other: commonOther
  };

  return byCategory[category] || commonOther;
}

function getRegionOptions(category: string, locale: "en" | "es") {
  if (category === "videogame" || category === "movie") {
    return [
      { value: "", label: locale === "es" ? "Sin especificar" : "Not specified" },
      { value: "PAL", label: "PAL" },
      { value: "NTSC-U", label: "NTSC-U" },
      { value: "NTSC-J", label: "NTSC-J" },
      { value: "Region Free", label: "Region Free" }
    ];
  }

  return [
    { value: "", label: locale === "es" ? "Sin especificar" : "Not specified" },
    { value: "ES", label: "ES" },
    { value: "UK", label: "UK" },
    { value: "US", label: "US" },
    { value: "JP", label: "JP" },
    { value: "EU", label: "EU" },
    { value: "International", label: "International" }
  ];
}

function buildMarketplaceLinks(item: WishlistItem) {
  const query = encodeURIComponent(getDisplayName(item));
  const category = item.category || "";

  if (category === "videogame") {
    return {
      primary: {
        label: "eBay",
        url: `https://www.ebay.es/sch/i.html?_nkw=${query}`
      },
      premium: {
        label: "Google Shopping",
        url: `https://www.google.com/search?tbm=shop&q=${query}`
      }
    };
  }

  if (category === "book" || category === "comic") {
    return {
      primary: {
        label: "Amazon",
        url: `https://www.amazon.es/s?k=${query}`
      },
      premium: {
        label: "Google Shopping",
        url: `https://www.google.com/search?tbm=shop&q=${query}`
      }
    };
  }

  if (category === "boardgame") {
    return {
      primary: {
        label: "Google Shopping",
        url: `https://www.google.com/search?tbm=shop&q=${query}`
      },
      premium: {
        label: "eBay",
        url: `https://www.ebay.es/sch/i.html?_nkw=${query}`
      }
    };
  }

  if (category === "movie") {
    return {
      primary: {
        label: "Amazon",
        url: `https://www.amazon.es/s?k=${query}`
      },
      premium: {
        label: "eBay",
        url: `https://www.ebay.es/sch/i.html?_nkw=${query}`
      }
    };
  }

  return {
    primary: {
      label: "Google",
      url: `https://www.google.com/search?q=${query}`
    },
    premium: {
      label: "Google Shopping",
      url: `https://www.google.com/search?tbm=shop&q=${query}`
    }
  };
}

export default function WishlistClient({
  initialItems,
  locale,
  themeId,
  navTheme,
  plan = "free"
}: {
  initialItems: WishlistItem[];
  locale: "en" | "es";
  themeId: AppThemeId;
  navTheme: ReturnType<typeof getThemeById>;
  plan?: string;
}) {
  const theme = useMemo(() => getThemeById(themeId), [themeId]);
  const isPremium = isPaidPlan(plan);

  const [items, setItems] = useState<WishlistItem[]>(initialItems);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("videogame");
  const [targetPrice, setTargetPrice] = useState("");
  const [platform, setPlatform] = useState("");
  const [region, setRegion] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const platformOptions = useMemo(
    () => getPlatformOptions(category, locale),
    [category, locale]
  );

  const regionOptions = useMemo(
    () => getRegionOptions(category, locale),
    [category, locale]
  );

  const text = {
    title: "Wishlist",
    subtitle:
      locale === "es"
        ? "Sigue las piezas que quieres comprar y controla cuándo se acercan a tu precio ideal."
        : "Track the pieces you want to buy and monitor when they get close to your ideal price.",
    collection: locale === "es" ? "Colección" : "Collection",
    profile: locale === "es" ? "Perfil" : "Profile",
    activeSection: "Wishlist",
    addTitle: locale === "es" ? "Añadir a wishlist" : "Add to wishlist",
    name: locale === "es" ? "Nombre" : "Name",
    category: locale === "es" ? "Categoría" : "Category",
    targetPrice: locale === "es" ? "Precio objetivo" : "Target price",
    platform: locale === "es" ? "Plataforma" : "Platform",
    region: locale === "es" ? "Región" : "Region",
    notes: locale === "es" ? "Notas" : "Notes",
    currentValue: locale === "es" ? "Valor actual" : "Current value",
    status: locale === "es" ? "Estado" : "Status",
    delta: locale === "es" ? "Diferencia" : "Delta",
    buyLink: locale === "es" ? "Ver oferta" : "View offer",
    premiumBuyLink:
      locale === "es" ? "Ver mejor oferta" : "See best offer",
    premiumHint:
      locale === "es"
        ? "Premium te abrirá mejores comparativas y futuras ofertas optimizadas."
        : "Premium unlocks better comparisons and future optimized offers.",
    remove: locale === "es" ? "Eliminar" : "Remove",
    moveToCollection:
      locale === "es" ? "Añadir a colección" : "Add to collection",
    moving: locale === "es" ? "Moviendo..." : "Moving...",
    created: locale === "es" ? "Añadido" : "Added",
    save: locale === "es" ? "Guardar" : "Save",
    saving: locale === "es" ? "Guardando..." : "Saving...",
    removing: locale === "es" ? "Eliminando..." : "Removing...",
    empty:
      locale === "es"
        ? "Todavía no tienes elementos en wishlist."
        : "You do not have wishlist items yet.",
    emptyHint:
      locale === "es"
        ? "Empieza guardando juegos, libros o piezas que quieras seguir antes de comprarlos."
        : "Start by saving games, books or pieces you want to track before buying.",
    saved:
      locale === "es"
        ? "Elemento añadido a wishlist."
        : "Item added to wishlist.",
    removed:
      locale === "es"
        ? "Elemento eliminado."
        : "Item removed.",
    moved:
      locale === "es"
        ? "Añadido a tu colección 🚀"
        : "Added to your collection 🚀",
    saveError:
      locale === "es"
        ? "No se pudo guardar el elemento."
        : "Could not save the item.",
    removeError:
      locale === "es"
        ? "No se pudo eliminar el elemento."
        : "Could not remove the item.",
    moveError:
      locale === "es"
        ? "No se pudo mover a la colección."
        : "Could not move to collection.",
    premiumCta:
      locale === "es" ? "Explorar Premium" : "Explore Premium"
  };

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) return;

    try {
      setLoading(true);
      setMessage(null);

      const res = await fetch(`${API}/wishlist`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          name: name.trim(),
          category,
          targetPrice: targetPrice ? Number(targetPrice) : undefined,
          platform: platform || undefined,
          region: region || undefined,
          notes: notes || undefined
        })
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || text.saveError);
      }

      setItems((prev) => [data, ...prev]);
      setName("");
      setCategory("videogame");
      setTargetPrice("");
      setPlatform("");
      setRegion("");
      setNotes("");
      setMessage(text.saved);
    } catch (error) {
      setMessage(
        error instanceof Error && error.message ? error.message : text.saveError
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      setDeletingId(id);
      setMessage(null);

      const res = await fetch(`${API}/wishlist/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          ...getAuthHeaders()
        }
      });

      if (!res.ok) {
        throw new Error(text.removeError);
      }

      setItems((prev) => prev.filter((item) => item.id !== id));
      setMessage(text.removed);
    } catch (error) {
      setMessage(
        error instanceof Error && error.message
          ? error.message
          : text.removeError
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function handleMoveToCollection(id: string) {
    try {
      setMovingId(id);
      setMessage(null);

      const res = await fetch(`${API}/wishlist/${id}/move-to-collection`, {
        method: "POST",
        credentials: "include",
        headers: {
          ...getAuthHeaders()
        }
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || text.moveError);
      }

      setItems((prev) => prev.filter((item) => item.id !== id));
      setMessage(text.moved);
    } catch (error) {
      setMessage(
        error instanceof Error && error.message
          ? error.message
          : text.moveError
      );
    } finally {
      setMovingId(null);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: theme.colors.bg,
        color: theme.colors.text,
        padding: 24,
        fontFamily: "system-ui"
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 18,
            flexWrap: "wrap"
          }}
        >
          <a
            href={`/items?lang=${locale}`}
            style={{
              textDecoration: "none",
              borderRadius: 999,
              padding: "10px 14px",
              background: navTheme.colors.surface,
              color: navTheme.colors.text,
              fontWeight: 800,
              border: `1px solid ${navTheme.colors.border}`
            }}
          >
            {text.collection}
          </a>

          <a
            href={`/profile?lang=${locale}`}
            style={{
              textDecoration: "none",
              borderRadius: 999,
              padding: "10px 14px",
              background: navTheme.colors.surface,
              color: navTheme.colors.text,
              fontWeight: 800,
              border: `1px solid ${navTheme.colors.border}`
            }}
          >
            {text.profile}
          </a>

          <span
            style={{
              borderRadius: 999,
              padding: "10px 14px",
              background: navTheme.colors.black,
              color: "white",
              fontWeight: 800,
              border: `1px solid ${navTheme.colors.black}`
            }}
          >
            {text.activeSection}
          </span>
        </div>

        <section
          style={{
            background: theme.colors.black,
            color: "white",
            borderRadius: theme.radius.xl,
            padding: "18px 20px",
            marginBottom: 20,
            boxShadow: theme.shadow.card
          }}
        >
          <h1
            style={{
              fontSize: 30,
              fontWeight: 900,
              margin: 0
            }}
          >
            {text.title}
          </h1>

          <p
            style={{
              marginTop: 8,
              marginBottom: 0,
              color: "rgba(255,255,255,0.78)",
              lineHeight: 1.6,
              maxWidth: 760
            }}
          >
            {text.subtitle}
          </p>
        </section>

        {!isPremium && (
          <section
            style={{
              marginBottom: 18,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radius.xl,
              padding: 16,
              background: theme.colors.surface,
              boxShadow: theme.shadow.soft
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
                flexWrap: "wrap"
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 900,
                    fontSize: 15,
                    color: theme.colors.text
                  }}
                >
                  Premium wishlist
                </div>

                <div
                  style={{
                    marginTop: 6,
                    fontSize: 13,
                    color: theme.colors.textMuted,
                    lineHeight: 1.6,
                    maxWidth: 760
                  }}
                >
                  {text.premiumHint}
                </div>
              </div>

              <a
                href={`/pricing?lang=${locale}`}
                style={{
                  textDecoration: "none",
                  borderRadius: 999,
                  padding: "10px 14px",
                  background: theme.colors.black,
                  color: "white",
                  fontWeight: 900
                }}
              >
                {text.premiumCta}
              </a>
            </div>
          </section>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "360px minmax(0, 1fr)",
            gap: 18,
            alignItems: "start"
          }}
        >
          <section
            style={{
              background: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radius.xl,
              padding: 18,
              boxShadow: theme.shadow.card
            }}
          >
            <div
              style={{
                fontWeight: 800,
                fontSize: 16,
                marginBottom: 14,
                color: theme.colors.text
              }}
            >
              {text.addTitle}
            </div>

            <form
              onSubmit={handleCreate}
              style={{
                display: "grid",
                gap: 12
              }}
            >
              <Field label={text.name}>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                  style={inputStyle(theme)}
                />
              </Field>

              <Field label={text.category}>
                <select
                  value={category}
                  onChange={(e) => {
                    const nextCategory = e.target.value;
                    setCategory(nextCategory);
                    setPlatform("");
                    setRegion("");
                  }}
                  disabled={loading}
                  style={inputStyle(theme)}
                >
                  <option value="videogame">videogame</option>
                  <option value="book">book</option>
                  <option value="comic">comic</option>
                  <option value="tcg">tcg</option>
                  <option value="figure">figure</option>
                  <option value="boardgame">boardgame</option>
                  <option value="lego">lego</option>
                  <option value="movie">movie</option>
                  <option value="other">other</option>
                </select>
              </Field>

              <Field label={text.targetPrice}>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  disabled={loading}
                  style={inputStyle(theme)}
                />
              </Field>

              <Field label={text.platform}>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  disabled={loading}
                  style={inputStyle(theme)}
                >
                  {platformOptions.map((option) => (
                    <option
                      key={`${category}-platform-${option.value}`}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label={text.region}>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  disabled={loading}
                  style={inputStyle(theme)}
                >
                  {regionOptions.map((option) => (
                    <option
                      key={`${category}-region-${option.value}`}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label={text.notes}>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={loading}
                  style={{
                    ...inputStyle(theme),
                    minHeight: 90,
                    resize: "vertical"
                  }}
                />
              </Field>

              <button
                type="submit"
                disabled={loading}
                style={{
                  border: "none",
                  borderRadius: 999,
                  padding: "12px 16px",
                  background: theme.colors.black,
                  color: "white",
                  fontWeight: 900,
                  cursor: "pointer"
                }}
              >
                {loading ? text.saving : text.save}
              </button>

              {message && (
                <div
                  style={{
                    fontSize: 13,
                    color: theme.colors.textMuted,
                    lineHeight: 1.6
                  }}
                >
                  {message}
                </div>
              )}
            </form>
          </section>

          <section
            style={{
              display: "grid",
              gap: 12
            }}
          >
            {items.length === 0 ? (
              <section
                style={{
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.radius.xl,
                  padding: 22,
                  background: theme.colors.surface,
                  boxShadow: theme.shadow.card
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    marginBottom: 8,
                    color: theme.colors.text
                  }}
                >
                  {text.empty}
                </div>

                <p
                  style={{
                    margin: 0,
                    color: theme.colors.textMuted,
                    lineHeight: 1.7
                  }}
                >
                  {text.emptyHint}
                </p>
              </section>
            ) : (
              items.map((item) => {
                const displayName = getDisplayName(item);
                const status = getWishlistStatus(
                  item.targetPrice,
                  item.currentMarketValue,
                  locale
                );
                const delta = getDeltaData(
                  item.targetPrice,
                  item.currentMarketValue,
                  locale
                );
                const links = buildMarketplaceLinks(item);
                const currentDeal = isPremium ? links.premium : links.primary;

                return (
                  <article
                    key={item.id}
                    style={{
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: theme.radius.lg,
                      padding: 16,
                      background: theme.colors.surface,
                      boxShadow: theme.shadow.soft
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        alignItems: "flex-start",
                        flexWrap: "wrap"
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: 900,
                            fontSize: 16,
                            color: theme.colors.text
                          }}
                        >
                          {displayName}
                        </div>

                        <div
                          style={{
                            marginTop: 6,
                            display: "inline-block",
                            padding: "4px 8px",
                            borderRadius: 999,
                            background: theme.colors.surfaceAlt,
                            border: `1px solid ${theme.colors.border}`,
                            fontSize: 12,
                            color: theme.colors.textMuted
                          }}
                        >
                          {item.category || "other"}
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          flexWrap: "wrap"
                        }}
                      >
                        <a
                          href={currentDeal.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            textDecoration: "none",
                            borderRadius: 999,
                            padding: "8px 12px",
                            background: "#16A34A",
                            color: "white",
                            fontWeight: 800
                          }}
                        >
                          {isPremium ? text.premiumBuyLink : text.buyLink} · {currentDeal.label}
                        </a>

                        <button
                          type="button"
                          onClick={() => handleMoveToCollection(item.id)}
                          disabled={movingId === item.id || deletingId === item.id}
                          style={{
                            border: "none",
                            borderRadius: 999,
                            padding: "8px 12px",
                            background: theme.colors.black,
                            color: "white",
                            fontWeight: 800,
                            cursor: "pointer"
                          }}
                        >
                          {movingId === item.id
                            ? text.moving
                            : text.moveToCollection}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id || movingId === item.id}
                          style={{
                            border: "none",
                            borderRadius: 999,
                            padding: "8px 12px",
                            background: "transparent",
                            color: theme.colors.danger,
                            fontWeight: 800,
                            cursor: "pointer"
                          }}
                        >
                          {deletingId === item.id ? text.removing : text.remove}
                        </button>
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: 14,
                        display: "grid",
                        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                        gap: 10
                      }}
                    >
                      <MiniInfo
                        label={text.targetPrice}
                        value={formatPrice(item.targetPrice)}
                        theme={theme}
                      />
                      <MiniInfo
                        label={text.currentValue}
                        value={formatPrice(item.currentMarketValue)}
                        theme={theme}
                      />
                      <MiniInfo
                        label={text.status}
                        value={status}
                        theme={theme}
                      />
                      <DeltaInfo
                        label={text.delta}
                        value={delta.label}
                        hint={delta.message}
                        tone={delta.tone}
                        theme={theme}
                      />
                    </div>

                    <div
                      style={{
                        marginTop: 10,
                        display: "grid",
                        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                        gap: 10
                      }}
                    >
                      <MiniInfo
                        label={text.platform}
                        value={item.platform || "—"}
                        theme={theme}
                      />
                      <MiniInfo
                        label={text.region}
                        value={item.region || "—"}
                        theme={theme}
                      />
                    </div>

                    {item.createdAt && (
                      <div
                        style={{
                          marginTop: 12,
                          fontSize: 12,
                          color: theme.colors.textMuted
                        }}
                      >
                        {text.created}: {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    )}

                    {item.notes && (
                      <div
                        style={{
                          marginTop: 12,
                          padding: "10px 12px",
                          borderRadius: theme.radius.md,
                          background: theme.colors.surfaceAlt,
                          border: `1px solid ${theme.colors.border}`
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 800,
                            color: theme.colors.textMuted,
                            marginBottom: 6
                          }}
                        >
                          {text.notes}
                        </div>

                        <div
                          style={{
                            fontSize: 14,
                            color: theme.colors.text,
                            lineHeight: 1.6,
                            whiteSpace: "pre-wrap"
                          }}
                        >
                          {item.notes}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label
      style={{
        display: "grid",
        gap: 6
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: "#6B7280"
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

function inputStyle(theme: ReturnType<typeof getThemeById>): React.CSSProperties {
  return {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    borderRadius: 12,
    border: `1px solid ${theme.colors.border}`,
    background: theme.colors.surfaceAlt,
    color: theme.colors.text,
    fontSize: 14,
    outline: "none"
  };
}

function MiniInfo({
  label,
  value,
  theme
}: {
  label: string;
  value: string;
  theme: ReturnType<typeof getThemeById>;
}) {
  return (
    <div
      style={{
        background: theme.colors.surfaceAlt,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.md,
        padding: "12px 14px"
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: theme.colors.textMuted,
          marginBottom: 6,
          fontWeight: 800
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 14,
          color: theme.colors.text,
          fontWeight: 700
        }}
      >
        {value}
      </div>
    </div>
  );
}

function DeltaInfo({
  label,
  value,
  hint,
  tone,
  theme
}: {
  label: string;
  value: string;
  hint: string;
  tone: "positive" | "warning" | "danger" | "neutral";
  theme: ReturnType<typeof getThemeById>;
}) {
  const styles =
    tone === "positive"
      ? {
          background: "rgba(34,197,94,0.10)",
          border: "1px solid rgba(34,197,94,0.22)",
          color: "#15803D"
        }
      : tone === "warning"
        ? {
            background: "rgba(245,158,11,0.12)",
            border: "1px solid rgba(245,158,11,0.22)",
            color: "#B45309"
          }
        : tone === "danger"
          ? {
              background: "rgba(239,68,68,0.10)",
              border: "1px solid rgba(239,68,68,0.22)",
              color: "#B91C1C"
            }
          : {
              background: theme.colors.surfaceAlt,
              border: `1px solid ${theme.colors.border}`,
              color: theme.colors.textMuted
            };

  return (
    <div
      style={{
        borderRadius: theme.radius.md,
        padding: "12px 14px",
        ...styles
      }}
    >
      <div
        style={{
          fontSize: 12,
          marginBottom: 6,
          fontWeight: 800,
          opacity: 0.9
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 14,
          fontWeight: 800
        }}
      >
        {value}
      </div>

      <div
        style={{
          marginTop: 6,
          fontSize: 12,
          lineHeight: 1.45,
          opacity: 0.9
        }}
      >
        {hint}
      </div>
    </div>
  );
}