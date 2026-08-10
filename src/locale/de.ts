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
  fameGroupsDefined: (count) => `Fame-Gruppen definiert: ${count}`,
  noFameGroups:
    "Noch keine Fame-Gruppen definiert — im Contribution Guide im Footer erfährst du, wie du welche vorschlagen kannst!",
  englishToggle: (forced) =>
    forced ? "Diese Liste in der gewählten Sprache verwenden" : "Die englischen Einträge dieser Liste verwenden",
  englishToggleAll: (allForced) =>
    allForced
      ? "Diese Listen in der gewählten Sprache verwenden"
      : "Die englischen Einträge dieser Listen verwenden",
  rulerToggle: (shown) => (shown ? "Fame-Regler dieser Liste ausblenden" : "Fame-Regler dieser Liste einblenden"),
  rulerToggleAll: (allShown) => (allShown ? "Diese Fame-Regler ausblenden" : "Diese Fame-Regler einblenden"),
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
    `Für ${language} noch nicht bestätigt — dieses Thema ist evtl. unvollständig.`,
  langFallback: "Fehlende Übersetzungen erscheinen auf Englisch.",
  langUsesEnglish: () => "Auch im Deutschen werden offiziell die englischen Namen verwendet.",
  repository: "GitHub-Repository",
  helpOut: "Du möchtest mithelfen? Wirf einen Blick in den",
  // Link label stays English — the guide itself is only available in English.
  contributionGuide: "Contribution Guide",
  helpOutAfter: "!",
};
