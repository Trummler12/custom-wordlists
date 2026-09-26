import type { UIStrings } from "./index";
import { en } from "./en";

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
    form: { pref: "pref.", short: "corto", long: "largo", both: "ambos", all: "todos" },
    formHint: en.names.formHint, // English stopgap until the UI-language PR translates it.
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
    stored: (body) => `(Guardado: ${body})`,
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
    upTo: (n) => `Hasta ${n}`,
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
    helpAdd: (url) => ` — [¡ayúdanos a añadir lo que falta!](${url})`,
  },
  // custom: English stopgap until the UI-language PR translates it (§X).
  custom: en.custom,
  coverage: {
    label: "Geoguessr / Cobertura de Street View",
    all: "Todos los países",
    withCoverage: "Con cobertura oficial",
    reliable: "Solo cobertura fiable",
  },
  languageType: {
    label: "Qué tipos de lengua incluir",
    base: "Lenguas modernas vivas",
    submillion: "También lenguas con <1 millón de usuarios",
    notRecommended: "Poco apropiado para dibujar de forma casual: mucho menos conocido de lo que sugiere su número de hablantes.",
    toggle: (included) =>
      included
        ? "Marcado: están en la lista. Desmárcalo para excluirlas."
        : "Márcalo para añadirlas a la lista.",
  },
  sovereignty: {
    label: "Soberanía y reconocimiento",
    wiki: "https://es.wikipedia.org/wiki/Estado_con_reconocimiento_limitado",
    axisRow: "de iure",
    axisCol: "de facto",
    cols: ["Plenamente independiente", "Parcialmente autónomo"],
    rows: ["Reconocimiento universal", "Reconocimiento amplio", "Reconocimiento parcial", "Sin reconocimiento"],
    colDefs: [
      "Controla sus fronteras, justicia, ejército e impuestos.",
      "Tiene leyes y parlamento propios, pero comparte competencias clave — moneda, defensa, política exterior — con otro Estado.",
    ],
    rowDefs: [
      "Estado miembro de la ONU, reconocido por casi todos los demás.",
      "Reconocido por una gran parte de los miembros de la ONU, con algunas excepciones.",
      "Reconocido solo por unos pocos Estados, aunque a menudo con fuerte presencia funcional o percibida.",
      "Considerado internacionalmente parte de otro Estado soberano.",
    ],
    regular: "Estados regulares",
  },
  language: {
    label: (current) => `Idioma: ${current}`,
    menu: "Idioma",
    // LB1 stopgaps: English until the translation pass.
    panelTitle: en.language.panelTitle,
    slot: en.language.slot,
    slotHint: en.language.slotHint,
    followPrimary: en.language.followPrimary,
    showSecondaryBefore: en.language.showSecondaryBefore, showSecondaryAfter: en.language.showSecondaryAfter,
    showSecondaryHint: en.language.showSecondaryHint,
    secondaryMoot: en.language.secondaryMoot,
    useSecondary: en.language.useSecondary,
    useSecondaryAll: en.language.useSecondaryAll,
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
    // LB1 stopgaps: English until the translation pass.
    outputSeparator: en.settings.outputSeparator,
    outputSeparatorHint: en.settings.outputSeparatorHint,
    minChars: en.settings.minChars,
    maxChars: en.settings.maxChars,
    reset: "Restablecer ajustes{br}predeterminados",
    resetConfirm: "Pulsa de nuevo para confirmar",
    resetCancel: "Cancelar",
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
  coveragePage: {
    home: "Aplicación principal",
    topicLabel: "Tema:",
    uiLanguage: "Idioma de la interfaz",
    title: "Cobertura de idiomas",
    intro: "Elige un tema para ver para qué idiomas Wikidata ya tiene una etiqueta, por elemento.",
    lead: "El contenido de este tema proviene de [Wikidata](https://www.wikidata.org/wiki/Wikidata:Main_Page). La tabla muestra para qué idiomas ya existe una etiqueta en cada elemento.",
    notesTitle: "Cómo ayudar",
    noteAdd: "Abre un elemento desde la primera columna y, una vez que hayas iniciado sesión, añade cualquier etiqueta que falte y de la que estés seguro.",
    noteLabelLister: "Para añadir un idioma que no aparece en absoluto, activa el accesorio labelLister en tus [preferencias de Wikidata](https://www.wikidata.org/wiki/Special:Preferences#mw-prefsection-gadgets), en Accesorios; cada elemento mostrará entonces una «Labels list» (arriba a la derecha, en Herramientas) que acepta cualquier código de idioma.",
    noteProtected: "Algunos elementos de Wikidata están protegidos y solo pueden modificarse con una cuenta de al menos cuatro días de antigüedad y con 100 o más ediciones.",
    noteStale: "Ten en cuenta que esta tabla procede de un volcado manual, por lo que la cobertura que se muestra aquí puede ir por detrás del estado actual en Wikidata hasta varias semanas.",
    itemCount: (n) => `${n.toLocaleString()} elementos`,
    uiOnly: "Solo idiomas de la interfaz",
    uiOnlyHint: "Los volcados de datos brutos ya cubren todos los idiomas que admite skribbl.io,{br}además de algunos más con muchos usuarios.{br}Así que los datos ya admiten todos los idiomas previstos,{br}mientras que la interfaz la mantenemos los maintainers y, naturalmente, va muy por detrás.{br}Y tiene poco sentido querer añadir un nuevo idioma de interfaz{br}mientras apenas hay temas que cubran ese idioma.{br}Pero cuanta más gente ayude, antes se aprobarán nuevos idiomas.{br}=> Échale un vistazo a la Contribution Guide más abajo, ¡sin problema!",
    item: "Elemento",
    numeric: { population: "Población", area: "Área (km²)", users: "Usuarios" },
    first: "Primera página",
    prev: "Página anterior",
    next: "Página siguiente",
    last: "Última página",
    page: (current, total) => `Página ${current} / ${total}`,
    // LB1 stopgaps: English until the translation pass.
    pageJumpHint: en.coveragePage.pageJumpHint,
    pageJumpInput: en.coveragePage.pageJumpInput,
    pageNoNumeric: en.coveragePage.pageNoNumeric,
    loading: (topic) => `Cargando ${topic}…`,
    loadError: (topic, message) => `No se pudo cargar la cobertura de ${topic}: ${message}`,
  },
};
