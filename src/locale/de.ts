import type { UIStrings } from "./index";

/** German UI strings. */
export const de: UIStrings = {
  header: {
    taglineBefore: "Erstelle eigene Wortlisten für",
    taglineAfter: "und ähnliche Wortspiele.",
  },
  tree: {
    topics: "Themen",
    loading: "Themen werden geladen…",
    loadError: (message) => `Themen konnten nicht geladen werden: ${message}`,
    empty: "Noch keine Themen verfügbar.",
    toggle: (expanded, title) => `${expanded ? "Einklappen" : "Ausklappen"} ${title}`,
    loadingShort: "lädt…",
    wordsOf: (selected, total) => `${selected} von ${total} Wörtern`,
  },
  names: {
    form: { short: "kurz", long: "lang", both: "beide" },
    formLabel: (group) => `Namensform für ${group}`,
  },
  fame: {
    depthLabel: (group) => `Bekanntheitstiefe für ${group}`,
    valueText: (depth, total) => `oberste ${depth} von ${total} Stufen`,
    groupsDefined: (count) => `Fame-Gruppen definiert: ${count}`,
    none: "Noch keine Fame-Gruppen definiert — im Contribution Guide im Footer erfährst du, wie du welche vorschlagen kannst!",
    toggle: (shown) =>
      shown ? "Fame-Regler dieser Liste ausblenden" : "Fame-Regler dieser Liste einblenden",
    toggleAll: (allShown) =>
      allShown ? "Diese Fame-Regler ausblenden" : "Diese Fame-Regler einblenden",
  },
  omitted: {
    label: "Was diese Liste weglässt",
    title: "Nicht in dieser Liste:",
    toggle: (omitted) =>
      omitted
        ? "Umschalten, um diese in die Liste aufzunehmen"
        : "Umschalten, um diese wegzulassen",
    locked: "Das sind Spieldaten und keine Wörter, sie lassen sich nicht aufnehmen.",
    unknown: (n) => `${n} Einträge ohne deutsche Namen in den Ausgangsdaten`,
    unknownHint: (omitted) =>
      omitted
        ? "Umschalten, um deren englische Namen (Fallback) in die Liste zu lassen."
        : "Umschalten, um diese wieder wegzulassen.",
  },
  language: {
    label: (current) => `Sprache: ${current}`,
    menu: "Sprache",
    unsupported: (language) =>
      `Für ${language} noch nicht bestätigt — dieses Thema ist evtl. unvollständig.`,
    fallback: "Fehlende Übersetzungen erscheinen auf Englisch.",
    usesEnglish: () => "Auch im Deutschen werden offiziell die englischen Namen verwendet.",
    useEnglish: (forced) =>
      forced
        ? "Diese Liste in der gewählten Sprache verwenden"
        : "Die englischen Einträge dieser Liste verwenden",
    useEnglishAll: (allForced) =>
      allForced
        ? "Diese Listen in der gewählten Sprache verwenden"
        : "Die englischen Einträge dieser Listen verwenden",
  },
  settings: {
    label: "Einstellungen",
    showEnglish: "Option zum Verwenden englischer Einträge anzeigen",
    showEnglishEn: "Diese Schalter erscheinen nur bei anderen Sprachen als Englisch.",
    interfaceLang: "Sprache der Oberfläche:",
    interfaceAuto: "Automatisch",
  },
  output: {
    label: "Ausgabe",
    copy: "Kopieren",
    copied: "Kopiert!",
    empty: "Wähle Themen oder Gruppen, um eine Liste zu erstellen.",
    generatedList: "Generierte Wortliste",
    words: "Wörter",
    chars: "Zeichen",
    belowMin: (min) => `· unter skribbl-Minimum (${min})`,
    overMax: "· über dem Maximum",
    excluded: (count, maxLen, list) =>
      `${count} ${count === 1 ? "Wort" : "Wörter"} ausgeschlossen (länger als ${maxLen} Zeichen): ${list}`,
  },
  footer: {
    repository: "GitHub-Repository",
    helpOut: "Du möchtest mithelfen? Wirf einen Blick in den",
    // Link label stays English — the guide itself is only available in English.
    contributionGuide: "Contribution Guide",
    helpOutAfter: "!",
  },
};
