export function getCategoryLabel(
  category: string,
  locale: "en" | "es"
): string {
  const map: Record<string, { en: string; es: string }> = {
    videogame: {
      en: "Videogame",
      es: "Videojuegos"
    },
    book: {
      en: "Book",
      es: "Libros"
    },
    comic: {
      en: "Comic",
      es: "Cómics"
    },
    tcg: {
      en: "TCG",
      es: "TCG"
    },
    figure: {
      en: "Figure",
      es: "Figuras"
    },
    boardgame: {
      en: "Board Game",
      es: "Juegos de mesa"
    },
    miniature: {
      en: "Miniatures",
      es: "Miniaturas"
    },
    lego: {
      en: "LEGO",
      es: "LEGO"
    },
    movie: {
      en: "Movie / DVD / VHS",
      es: "Películas / VHS / DVD"
    },
    merch: {
      en: "Merch",
      es: "Merchandising"
    },

    // Compatibilidad temporal por si queda algún registro antiguo en BD.
    other: {
      en: "Merch",
      es: "Merchandising"
    }
  };

  return map[category]?.[locale] ?? category;
}