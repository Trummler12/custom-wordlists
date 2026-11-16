import type { LocaleDict } from "./index";

/** Spanish UI strings. Machine-written and unreviewed by a native speaker — see
 *  the proofreading note in CONTRIBUTING.md. */
export const es: LocaleDict = {
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
    duplicatesRemoved: (count) => `${count} duplicado${count === 1 ? "" : "s"} eliminado${count === 1 ? "" : "s"}`,
    incompleteTopic: (url) => `Este tema está marcado como incompleto.{br}[¡Ayúdanos a añadir lo que falta!](${url})`,
    plannedTopic: (url) => `Este tema está previsto, pero aún no está listo.{br}[¡Ayúdanos a preparar sus datos!](${url})`,
    incompleteCategory: (url) =>
      `Esta categoría contiene temas marcados como incompletos.{br}[¡Ayúdanos a añadir lo que falta!](${url})`,
    plannedCategory: (url) =>
      `Esta categoría contiene temas previstos que aún no están listos.{br}[¡Ayúdanos a preparar sus datos!](${url})`,
    plannedUnselectable: "Los temas previstos aún no se pueden seleccionar",
  },
  names: {
    form: { pref: "pref.", short: "corto", long: "largo", both: "ambos", all: "todos" },
    formLabel: (group) => `Forma del nombre para ${group}`,
    formHint: {
      short: "Preferir nombres cortos",
      long: "Preferir nombres completos/oficiales",
      both: "Usar nombres cortos Y completos",
      pref: "Usar solo la etiqueta principal",
      all: "Usar TODAS las variantes disponibles",
    },
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
    helpAdd: (url) => `; [¡ayúdanos a añadir lo que falta!](${url})`,
    tooShort: (n, minLen) => `Hasta ${n} nombre${n === 1 ? "" : "s"} de menos de ${minLen} caracteres`,
    tooShortHint: (omitted) =>
      omitted ? "Activar para incluirlos de todos modos." : "Activar para volver a dejarlos fuera.",
    separatorIn: (n, sep, removing) =>
      `Hasta ${n} nombre${n === 1 ? "" : "s"} que ${removing ? (n === 1 ? "{i}contendría{/i}" : "{i}contendrían{/i}") : n === 1 ? "contiene" : "contienen"} el separador elegido ({code}${sep}{/code})`,
    separatorHint: (omitted, removing) =>
      omitted
        ? removing
          ? "Activar para conservarlos, sin el separador."
          : "Activar para incluirlos de todos modos: skribbl.io los partiría por el separador."
        : removing
          ? "Activar para dejarlos fuera en lugar de quitar el separador."
          : "Activar para volver a dejarlos fuera.",
  },
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
      "Tiene leyes y parlamento propios, pero comparte competencias clave (moneda, defensa, política exterior) con otro Estado.",
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
    variantNote: { romaji: "Grafía Hepburn con vocales largas dobladas (Moomoomiruku).{br}El romaji wāpuro NO es compatible: entraría en conflicto con las grafías oficiales (Butterfree, no Batafurii),{br}y resolver eso y los problemas que conlleva queda fuera del alcance por ahora." },
    generatedRomaji:
      "Estos romaji se generaron a partir de los nombres japoneses. Si alguno se escribe de otra forma, ¡no dudes en [avisarnos](https://github.com/Trummler12/custom-wordlists/issues/new)!",
    variantDiffers: (n) => `${n} entrada${n === 1 ? "" : "s"} se escribe${n === 1 ? "" : "n"} de otra forma`,
    variantShowList: "Ver cuáles",
    panelTitle: "Ajustes de idioma",
    slot: { primary: "Principal:", interface: "Interfaz:", fallback: "Respaldo de interfaz:" },
    slotHint: {
      primary: "Idioma principal de las entradas de las listas y valor predeterminado de la mayoría de los demás ajustes de idioma.",
      interface: "El idioma de la interfaz en particular.",
      fallback: "Se usa donde el idioma de la interfaz no tiene traducción.{br}Si aquí también falta, se usa el inglés.",
    },
    followPrimary: "{i}Principal{/i}",
    showSecondaryBefore: "Mostrar la opción de usar entradas en", showSecondaryAfter: "",
    showSecondaryHint:
      "Permite usar, por ejemplo, los nombres de países en tu lengua materna y los nombres de personajes de series en tu idioma de doblaje preferido.",
    secondaryMoot: "Estos interruptores solo aparecen mientras el idioma principal y el secundario sean distintos.",
    flagType: "Tipo de bandera:",
    flagTypes: { country: "País", mixed: "Mixta", linguistic: "Lingüística" },
    useSecondary: (forced, secondary) =>
      forced ? "Usar esta lista en el idioma seleccionado" : `Usar las entradas de esta lista en ${secondary}`,
    useSecondaryAll: (allForced, secondary) =>
      allForced
        ? "Usar estas listas en el idioma seleccionado"
        : `Usar las entradas de estas listas en ${secondary}`,
  },
  settings: {
    label: "Ajustes",
    reset: "Restablecer ajustes{br}de selección",
    resetConfirm: "Pulsa de nuevo para confirmar",
    resetCancel: "Cancelar",
    outputSeparator: "Separador de salida:",
    outputSeparatorHint:
      "skribbl.io solo acepta {code},{/code} como separador. Los demás solo cambian lo que se copia; el resultado se ve igual en cualquier caso.",
    charLimits: "Límites de caracteres:",
    minChars: "Mín.",
    maxChars: "Máx.",
    removeSeparator: (sep) => `Quitar {code}${sep}{/code} de los nombres`,
    charMaxOver: (gameMax) => `skribbl.io acepta como máximo ${gameMax} caracteres por nombre.`,
    scriptLimitsHint:
      "Límites para los nombres en la escritura propia de este idioma, donde un solo carácter suele representar una sílaba o una palabra entera. El romaji y otros nombres en letras latinas siguen los límites generales.",
    showTopicsBefore: "Mostrar temas:",
    showTopicsAfter: "",
    showTopicsKind: { incomplete: "incompletos", planned: "previstos", all: "todos" },
    showTopicsHint:
      "A los temas incompletos aún les faltan entradas. Los temas previstos están anunciados, pero aún no se pueden seleccionar.",
  },
  output: {
    label: "Resultado",
    copy: "Copiar",
    copied: "¡Copiado!",
    copyFailed: "No se pudo copiar",
    copyManual: "La lista está seleccionada: cópiala tú mismo.",
    empty: "Selecciona temas, categorías o listas personalizadas para generar una salida.",
    generatedList: "Lista de palabras generada",
    words: "palabras",
    chars: "caracteres",
    belowMin: (min) => `· por debajo del mínimo de skribbl (${min})`,
    overMax: "· por encima del máximo",
    overLong: (count, maxLen) =>
      `${count} palabra${count === 1 ? "" : "s"} de más de ${maxLen} caracteres`,
    splitting: (count, sep) =>
      `${count} palabra${count === 1 ? "" : "s"} con el separador "${sep}" (se parte${count === 1 ? "" : "n"} al pegar)`,
  },
  footer: {
    repository: "Repositorio de GitHub",
    helpOut: "¿Quieres ayudar con el proyecto? No dudes en echar un vistazo a la",
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
    noteLabelLister: "Para añadir un idioma que no aparece en absoluto, ve a tus [preferencias de Wikidata](https://www.wikidata.org/wiki/Special:Preferences#mw-prefsection-gadgets) y activa el accesorio {i}labelLister{/i} en la pestaña «Accesorios»; cada elemento mostrará entonces una «Labels list» (arriba a la derecha, en Herramientas) que acepta cualquier código de idioma.",
    noteProtected: "Algunos elementos de Wikidata están protegidos y solo pueden modificarse con una cuenta de al menos cuatro días de antigüedad y con 100 o más ediciones.",
    noteStale: "Ten en cuenta que esta tabla procede de un volcado manual, por lo que la cobertura que se muestra aquí puede ir por detrás del estado actual en Wikidata hasta varias semanas o incluso meses.",
    itemCount: (n) => `${n.toLocaleString()} elementos`,
    uiOnly: "Solo idiomas de la interfaz",
    uiOnlyHint: "Los volcados de datos brutos ya cubren todos los idiomas que admite skribbl.io,{br}además de algunos más con muchos usuarios.{br}Así que los datos ya admiten todos los idiomas previstos,{br}mientras que la interfaz la mantenemos los maintainers y, naturalmente, va muy por detrás.{br}Y tiene poco sentido querer añadir un nuevo idioma de interfaz{br}mientras apenas hay temas que cubran ese idioma.{br}Pero cuanta más gente ayude, antes se aprobarán nuevos idiomas.{br}=> Échale un vistazo a la Contribution Guide más abajo, ¡sin problema!",
    item: "Elemento",
    numeric: { population: "Población", area: "Área (km{smaller sup}2{/smaller sup})", users: "Usuarios", atomicNumber: "Número atómico", wikipedias: "Wikipedias" },
    first: "Primera página",
    prev: "Página anterior",
    next: "Página siguiente",
    last: "Última página",
    pageParts: (current, total) => ["", `Página ${current}`, ` / ${total}`],
    loading: (topic) => `Cargando ${topic}…`,
    loadError: (topic, message) => `No se pudo cargar la cobertura de ${topic}: ${message}`,
    pageJumpHint: (numeric) =>
      numeric
        ? `Clic: ir a una página, a un nombre de entrada (en inglés) o a un valor de "${numeric}"`
        : "Clic: ir a una página o a un nombre de entrada (en inglés)",
    pageJumpInput: "Página, valor o nombre de entrada",
    pageNoNumeric: "Esta tabla no tiene ninguna columna numérica.",
  },
  tip: {
    unpin: "Desfijar",
  },
  custom: {
    title: "Custom",
    infoHint:
      "Usa el campo de entrada de abajo para añadir tus propias listas de palabras.{br}" +
      "Se aplican estas reglas:{br}" +
      "- Todos los elementos se separan con un mismo carácter separador, igual en toda la entrada.{br}" +
      "- Evita los elementos que contengan el propio separador.{br}" +
      "- Con cada cambio del contenido, el separador se detecta automáticamente como el carácter separador más frecuente.{br}" +
      "- skribbl.io ignora la puntuación, otros caracteres especiales y los espacios al principio o al final; parte de ello ya se limpia aquí mismo.",
    separatorLabel: "Separador:",
    separatorPick: "Carácter separador",
    internalDupes: (n) => `${n} entrada${n === 1 ? "" : "s"} duplicada${n === 1 ? "" : "s"} dentro de una lista Custom activa`,
    localDupes: (n) => `${n} duplicado${n === 1 ? "" : "s"} entre tus listas Custom activas`,
    globalDupes: (n) => `${n} duplicado${n === 1 ? "" : "s"} con los temas seleccionados`,
    dupesNote: "Los duplicados se reducen a una sola copia en el resultado.",
    dupesNoteSave: "Los duplicados dentro de una lista también se eliminan al guardarla.",
    dupesSamples: {
      internal: "Duplicados internos:",
      local: "Duplicados entre tus listas Custom activas:",
      global: "Duplicados con los temas seleccionados:",
    },
    fitToggle: "Ajustar el campo a su altura completa",
    fewerRows: "Mostrar menos filas",
    moreRows: "Mostrar más filas",
    moreRowsOver: (steps) => `(${steps} paso${steps === 1 ? "" : "s"} por encima de la altura del contenido)`,
    clearHint: "Vaciar el campo de entrada Custom",
    clearConfirm: "Vas a vaciar el campo de entrada Custom.",
    clearConfirmButton: "Haz clic aquí para confirmar",
    listsLabel: "Listas guardadas",
    listsTitle: "Listas Custom guardadas",
    listsInfo:
      "Las listas Custom se guardan en el almacenamiento local.{br}" +
      "Cada navegador tiene su propio almacenamiento local,{br}" +
      "separado de otros navegadores o dispositivos.{br}" +
      "Para llevar tus listas Custom a otro lugar,{br}" +
      "expórtalas aquí e impórtalas en el destino.{br}{br}" +
      "{b}IMPORTANTE{/b}: exporta tus listas después de cada cambio grande " +
      "y guarda esas exportaciones como copia de seguridad; varias acciones del navegador " +
      "pueden borrar tu almacenamiento local, y Safari incluso lo borra automáticamente " +
      "cuando un sitio lleva 7 días sin visitarse.",
    listActivate: "Usar esta lista",
    listRename: "Renombrar",
    listSave: "Guardar la entrada actual en esta lista",
    listLoad: "Cargar esta lista en el campo de entrada",
    listDelete: "Eliminar esta lista",
    listUp: "Subir",
    listDown: "Bajar",
    listSaveNew: "Guardar la entrada actual como lista nueva",
    phActivate: "El marcador de posición NO se puede usar",
    phRename: "El marcador de posición NO se puede renombrar",
    phLoad: "El marcador de posición NO se puede cargar",
    phDelete: "El marcador de posición NO se puede eliminar",
    phMove: "El marcador de posición NO se puede mover",
    exportLabel: "Exportar listas",
    exportTitle: "Exportar listas guardadas",
    selectAll: "Seleccionar todo",
    exportDownload: "Descargar",
    importLabel: "Importar listas",
    importTitle: "Importar listas guardadas",
    importColName: "Nombre",
    importColSize: "Tamaño",
    importColDupes: "Dupl.",
    importColWith: "con",
    importButton: "Importar selección",
    importEmpty: "No hay listas guardadas en este archivo.",
    importDupesSecondary: (pct) => `Secundario: ${pct}`,
    listReplaceConfirm: (name) => `¿Reemplazar la lista "${name}" por la entrada actual?`,
    listDeleteConfirm: (name) => `¿Eliminar la lista "${name}"?`,
    listLoadConfirm: "¿Sobrescribir el campo de entrada con esta lista?",
    confirm: "Confirmar",
    cancel: "Cancelar",
    charsLabel: "Caracteres que skribbl.io probablemente ignora",
    charsIgnored: "Caracteres que skribbl.io probablemente ignora:",
    charsProblematic: "Caracteres problemáticos:",
    charsTolerated: "Caracteres tolerados:",
    charsRemove: "Considera quitar este carácter.",
    charsLists: "Listas afectadas:",
    inputName: "{i}Campo de entrada{/i}",
    charsAccepted: "Caracteres aceptados:",
    charsRemoveMaybe: "Quizá convenga quitar este carácter.",
    charsLone: (char, partner) => `{code}${char}{/code} suelto, sin su {code}${partner}{/code};`,
    charsPaired: (open, close) => `Como parte de un par {code}${open}{/code}-{code}${close}{/code};`,
    cleanChars: "Tu lista contiene caracteres especiales poco habituales que pueden quitarse al guardar:",
    cleanDupes: (n) =>
      `Tu lista contiene ${n} duplicado${n === 1 ? "" : "s"} interno${n === 1 ? "" : "s"}, que se eliminará${n === 1 ? "" : "n"} al guardar:`,
    settingsLabel: "Ajustes de Custom",
    settingsTitle: "Ajustes de Custom",
    maxPreviewItems: "Máx. elementos en la vista previa",
    maxPreviewChars: "Máx. caracteres en la vista previa",
    exampleListS: "Lista de ejemplo S",
    exampleListL: "Lista de ejemplo L",
    examplePreviewEmpty: "Aún no se han cargado nombres de temas.",
  },
  sportType: {
    label: "Qué deportes incluir",
  },
};
