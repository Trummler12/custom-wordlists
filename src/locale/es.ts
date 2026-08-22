import type { UIStrings } from "./index";

/** Spanish UI strings. Machine-written and unreviewed by a native speaker — see
 *  the proofreading note in CONTRIBUTING.md. */
export const es: UIStrings = {
  header: {
    taglineBefore: "Crea listas de palabras personalizadas para",
    taglineAfter: "y juegos de palabras similares.",
  },
  tree: {
    topics: "Temas",
    loading: "Cargando temas…",
    loadError: (message) => `No se pudieron cargar los temas: ${message}`,
    empty: "Aún no hay temas disponibles.",
    toggle: (expanded, title) => `${expanded ? "Contraer" : "Expandir"} ${title}`,
    loadingShort: "cargando…",
    wordsOf: (selected, total) => `${selected} de ${total} palabra${total === 1 ? "" : "s"}`,
  },
  names: {
    form: { short: "corto", long: "largo", both: "ambos" },
    formLabel: (group) => `Forma del nombre para ${group}`,
  },
  fame: {
    depthLabel: (group) => `Nivel de fama para ${group}`,
    valueText: (depth, total) =>
      depth === 1 ? `nivel más alto de ${total}` : `${depth} niveles más altos de ${total}`,
    groupsDefined: (count) => `Grupos de fama definidos: ${count}`,
    none: "Aún no hay grupos de fama definidos: consulta la Contribution Guide en el pie de página para proponer algunos.",
    selected: "Selección:",
    mostlySelected: "Selección mayoritaria:",
    toggle: (shown) =>
      shown ? "Ocultar la regla de fama de esta lista" : "Mostrar la regla de fama de esta lista",
    toggleAll: (allShown) =>
      allShown ? "Ocultar estas reglas de fama" : "Mostrar estas reglas de fama",
  },
  omitted: {
    label: "Lo que esta lista deja fuera",
    title: "Fuera de esta lista:",
    toggle: (omitted) =>
      omitted ? "Activar para incluirlos en tu lista" : "Activar para dejarlos fuera",
    locked: "Son datos del juego y no palabras, así que no se pueden incluir.",
    unknown: (n, primary, secondary) =>
      `Hasta ${n} entrada${n === 1 ? "" : "s"} sin nombre en ${primary}${secondary} en los datos de origen`,
    unknownHint: (omitted) =>
      omitted
        ? "Activar para incluirlas con su nombre en inglés, el único que se conoce."
        : "Activar para volver a dejarlas fuera.",
    unknownTier: (tier, n) => `Nivel ${tier}: ${n} entrada${n === 1 ? "" : "s"} afectada${n === 1 ? "" : "s"}`,
    tooLong: (n, maxLen) =>
      `Hasta ${n} nombre${n === 1 ? "" : "s"} de más de ${maxLen} caracteres`,
    tooLongHint: (omitted) =>
      omitted
        ? "Activar para incluirlos de todos modos: skribbl.io no los acepta, pero otro juego sí podría."
        : "Activar para volver a dejarlos fuera.",
  },
  language: {
    label: (current) => `Idioma: ${current}`,
    menu: "Idioma",
    unsupported: (language) =>
      `Aún no confirmado para ${language}: es posible que este tema esté incompleto.`,
    fallback: "Se usa el inglés donde falta una traducción.",
    // Los nombres de idioma son masculinos en español y no eliden el artículo.
    usesEnglish: (primary, secondary) =>
      `El ${primary}${secondary} también usa oficialmente los nombres en inglés.`,
    variant: {
      romaji: "Usar romaji en las entradas de las listas",
      es419: "Usar el español latinoamericano en las entradas de las listas",
    },
    variantNote: { romaji: "Grafía Hepburn con vocales largas dobladas (Moomoomiruku).{br}No se ofrece romaji wāpuro: sustituiría las grafías oficiales — Butterfree, no Batafurii." },
    generatedRomaji:
      "Estos romaji se generaron a partir de los nombres japoneses. Si alguno se escribe de otra forma, [avísanos](https://github.com/Trummler12/custom-wordlists/issues/new).",
    variantDiffers: (n) => `${n} entrada${n === 1 ? "" : "s"} se escribe${n === 1 ? "" : "n"} de otra forma`,
    variantShowList: "Ver cuáles",
    useEnglish: (forced) =>
      forced
        ? "Usar esta lista en el idioma seleccionado"
        : "Usar las entradas en inglés de esta lista",
    useEnglishAll: (allForced) =>
      allForced
        ? "Usar estas listas en el idioma seleccionado"
        : "Usar las entradas en inglés de estas listas",
  },
  settings: {
    label: "Ajustes",
    showEnglish: "Mostrar la opción de usar entradas en inglés",
    showEnglishEn: "Estos interruptores solo aparecen en idiomas distintos del inglés.",
    interfaceLang: "Idioma de la interfaz:",
    interfaceAuto: "Automático",
  },
  output: {
    label: "Resultado",
    copy: "Copiar",
    copied: "¡Copiado!",
    copyFailed: "No se pudo copiar",
    copyManual: "La lista está seleccionada: cópiala tú mismo.",
    empty: "Selecciona temas o grupos para crear una lista.",
    generatedList: "Lista de palabras generada",
    words: "palabras",
    chars: "caracteres",
    belowMin: (min) => `· por debajo del mínimo de skribbl (${min})`,
    overMax: "· por encima del máximo",
    overLong: (count, maxLen) =>
      `${count} palabra${count === 1 ? "" : "s"} de más de ${maxLen} caracteres`,
  },
  footer: {
    repository: "Repositorio de GitHub",
    helpOut: "¿Quieres ayudar con el proyecto? Echa un vistazo a la",
    // La guía solo existe en inglés, así que el enlace conserva su nombre.
    contributionGuide: "Contribution Guide",
    helpOutAfter: ".",
  },
};
