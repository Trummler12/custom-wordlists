import type { UIStrings } from "./index";

/** German UI strings. */
export const de: UIStrings = {
  taglineBefore: "Erstelle eigene Wortlisten für",
  taglineAfter: "und ähnliche Wortspiele.",
  loadingTopics: "Themen werden geladen…",
  loadError: (message) => `Themen konnten nicht geladen werden: ${message}`,
  noTopics: "Noch keine Themen verfügbar.",
  topics: "Themen",
  toggle: (expanded, title) => `${expanded ? "Einklappen" : "Ausklappen"} ${title}`,
  loadingShort: "lädt…",
  wordsOf: (selected, total) => `${selected} von ${total} Wörtern`,
  nameForm: { short: "kurz", long: "lang", both: "beide" },
  nameFormLabel: (group) => `Namensform für ${group}`,
  fameDepthLabel: (group) => `Bekanntheitstiefe für ${group}`,
  tiersValueText: (depth, total) => `oberste ${depth} von ${total} Stufen`,
  output: "Ausgabe",
  copy: "Kopieren",
  copied: "Kopiert!",
  emptyOutput: "Wähle Themen oder Gruppen, um eine Liste zu erstellen.",
  generatedList: "Generierte Wortliste",
  wordsLabel: "Wörter",
  charsLabel: "Zeichen",
  belowMin: (min) => `· unter skribbl-Minimum (${min})`,
  overMax: "· über dem Maximum",
  excluded: (count, maxLen, list) =>
    `${count} ${count === 1 ? "Wort" : "Wörter"} ausgeschlossen (länger als ${maxLen} Zeichen): ${list}`,
  languageLabel: (current) => `Sprache: ${current}`,
  languageMenu: "Sprache",
  langUnsupported: (language) =>
    `Noch nicht vollständig auf ${language} verfügbar — fehlende Übersetzungen erscheinen auf Englisch.`,
};
