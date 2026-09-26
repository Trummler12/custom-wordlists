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
    // Verb last, which is where German puts it: "Pokémon ausklappen".
    toggle: (expanded, title) => `${title} ${expanded ? "einklappen" : "ausklappen"}`,
    loadingShort: "lädt…",
    wordsOf: (selected, total) => `${selected} von ${total} ${total === 1 ? "Wort" : "Wörtern"}`,
  },
  names: {
    form: { pref: "pref.", short: "kurz", long: "lang", both: "beide", all: "alle" },
    formHint: {
      short: "Kurze Namen bevorzugen",
      long: "Volle/offizielle Namen bevorzugen",
      both: "Kurze UND volle Namen verwenden",
      pref: "Nur das primäre Label verwenden",
      all: "ALLE verfügbaren Varianten verwenden",
    },
    formLabel: (group) => `Namensform für ${group}`,
  },
  fame: {
    depthLabel: (group) => `Bekanntheitstiefe für ${group}`,
    valueText: (depth, total) =>
      depth === 1 ? `oberste von ${total} Stufen` : `oberste ${depth} von ${total} Stufen`,
    groupsDefined: (count) => `Fame-Gruppen definiert: ${count}`,
    none: "Noch keine Fame-Gruppen definiert — im Contribution Guide im Footer erfährst du, wie du welche vorschlagen kannst!",
    selected: "Ausgewählt:",
    mostlySelected: "Grösstenteils ausgewählt:",
    stored: (body) => `(Gespeichert: ${body})`,
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
    upTo: (n) => `Bis zu ${n}`,
    unknown: (n, primary, secondary) =>
      `Bis zu ${n} ${n === 1 ? "Eintrag" : "Einträge"} ohne Namen auf ${primary}${secondary} in den Ausgangsdaten`,
    unknownHint: (omitted) =>
      omitted
        ? "Umschalten, um deren englische Namen (Fallback) in die Liste zu lassen."
        : "Umschalten, um diese wieder wegzulassen.",
    unknownTier: (tier, n) => `Stufe ${tier}: ${n} ${n === 1 ? "Eintrag" : "Einträge"} betroffen`,
    tooLong: (n, maxLen) =>
      `Bis zu ${n} ${n === 1 ? "Name" : "Namen"} mit mehr als ${maxLen} Zeichen`,
    tooLongHint: (omitted) =>
      omitted
        ? "Umschalten, um sie trotzdem aufzunehmen — skribbl.io nimmt sie nicht an, ein anderes Spiel vielleicht schon."
        : "Umschalten, um sie wieder wegzulassen.",
    helpAdd: (url) => ` — [hilf mit, Fehlendes zu ergänzen!](${url})`,
  },
  custom: {
    title: "Eigene Liste",
    infoHint:
      "Nutze das Eingabefeld unten, um eigene Wortlisten hinzuzufügen.{br}" +
      "Es gelten dabei folgende Regeln:{br}" +
      "- Alle Einträge werden durch ein Trennzeichen getrennt, das über die gesamte Eingabe hinweg gleich bleibt.{br}" +
      "- Einträge, die das Trennzeichen selbst enthalten, sind zu vermeiden.{br}" +
      "- Bei jeder inhaltlichen Änderung wird das Trennzeichen automatisch als das häufigste Trennzeichen bestimmt.{br}" +
      "- Satz- und andere Sonderzeichen, sowie führende und nachgestellte Leerzeichen, werden von skribbl.io ignoriert und teilweise schon direkt hier vor Ort bereinigt.",
    separatorLabel: "Trennzeichen:",
    separatorPick: "Trennzeichen",
    internalDupes: (n) =>
      n === 1 ? "1 doppelter Eintrag innerhalb einer aktiven eigenen Liste" : `${n} doppelte Einträge innerhalb einer aktiven eigenen Liste`,
    localDupes: (n) => `${n} ${n === 1 ? "Duplikat" : "Duplikate"} zwischen deinen aktiven eigenen Listen`,
    globalDupes: (n) => `${n} ${n === 1 ? "Duplikat" : "Duplikate"} mit den ausgewählten Themen`,
    dupesHint: "Duplikate werden für die Ausgabe automatisch auf je 1 Exemplar reduziert; Duplikate innerhalb einer Liste werden zusätzlich auch beim Speichern bereinigt. Interne Duplikate:",
    dupesNote: "Duplikate werden für die Ausgabe automatisch auf je 1 Exemplar reduziert.",
    dupesNoteSave: "Duplikate innerhalb einer Liste werden zusätzlich auch beim Speichern bereinigt.",
    dupesSamples: {
      internal: "Interne Duplikate:",
      local: "Duplikate zwischen deinen aktiven eigenen Listen:",
      global: "Duplikate mit den ausgewählten Themen:",
    },
    fitToggle: "Eingabefeld auf volle Höhe ausklappen",
    fewerRows: "Weniger Zeilen anzeigen",
    moreRows: "Mehr Zeilen anzeigen",
    moreRowsOver: (steps) => `(${steps} ${steps === 1 ? "Schritt" : "Schritte"} über der Inhaltshöhe)`,
    clearHint: "Eigene Eingabe leeren",
    clearConfirm: "Du bist dabei, das eigene Eingabefeld zu leeren.",
    clearConfirmButton: "Zum Bestätigen hier klicken",
    listsLabel: "Gespeicherte Listen",
    listsTitle: "Gespeicherte eigene Listen",
    listsInfo:
      "Zum Speichern von Custom-Listen wird der LocalStorage verwendet;{br}" +
      "Jeder Browser unterhält seinen eigenen LocalStorage,{br}" +
      "welcher getrennt ist von anderen Browsern oder Geräten;{br}" +
      "Um deine Custom-Listen an einen anderen Ort mitzunehmen,{br}" +
      "exportiere diese hier und importiere sie am Zielort.{br}{br}" +
      "{b}WICHTIG{/b}: Exportiere bei jeder grösseren Änderung deine Listen " +
      "und halte diese Exports dann als Backup; Verschiedene Browser-Aktionen " +
      "können nämlich deinen LocalStorage bereinigen - Safari beispielsweise " +
      "bereinigt diesen sogar automatisch, wenn betroffene Seite für 7d unbesucht bleibt.",
    listActivate: "Diese Liste verwenden",
    listRename: "Umbenennen",
    listSave: "Aktuelle Eingabe in diese Liste speichern",
    listLoad: "Diese Liste ins Eingabefeld laden",
    listDelete: "Diese Liste löschen",
    listUp: "Nach oben",
    listDown: "Nach unten",
    listSaveNew: "Aktuelle Eingabe als neue Liste speichern",
    phActivate: "Platzhalter kann NICHT verwendet werden",
    phRename: "Platzhalter kann NICHT umbenannt werden",
    phLoad: "Platzhalter kann NICHT geladen werden",
    phDelete: "Platzhalter kann NICHT gelöscht werden",
    phMove: "Platzhalter kann NICHT verschoben werden",
    exportLabel: "Listen exportieren",
    exportTitle: "Gespeicherte Listen exportieren",
    selectAll: "Alle auswählen",
    exportDownload: "Herunterladen",
    importLabel: "Listen importieren",
    importTitle: "Gespeicherte Listen importieren",
    importPick: "Datei wählen…",
    importColName: "Name",
    importColSize: "Grösse",
    importColDupes: "Dupes",
    importColWith: "mit",
    importButton: "Auswahl importieren",
    importEmpty: "Keine gespeicherten Listen in dieser Datei.",
    importDupesSecondary: (pct) => `Sekundär: ${pct}`,
    listReplaceConfirm: (name) => `Die Liste "${name}" mit der aktuellen Eingabe ersetzen?`,
    listDeleteConfirm: (name) => `Die Liste "${name}" löschen?`,
    listLoadConfirm: "Das Eingabefeld mit dieser Liste überschreiben?",
    confirm: "Bestätigen",
    cancel: "Abbrechen",
    listWarnTitle: "Diese eigene Liste hat Probleme:",
    listWarnSeparator: "Das gewählte Trennzeichen kommt innerhalb eines Eintrags vor.",
    settingsLabel: "Custom-Einstellungen",
    settingsTitle: "Custom-Einstellungen",
    maxPreviewItems: "Max. Vorschau-Einträge",
    maxPreviewChars: "Max. Vorschau-Zeichen",
    exampleListS: "Beispielliste S",
    exampleListL: "Beispielliste L",
    examplePreviewEmpty: "Noch keine Themen-Namen geladen.",
  },
  coverage: {
    label: "Geoguessr / Street-View-Abdeckung",
    all: "Alle Länder",
    withCoverage: "Mit offizieller Abdeckung",
    reliable: "Nur zuverlässige Abdeckung",
  },
  languageType: {
    label: "Welche Sprachtypen einbeziehen",
    base: "Lebende moderne Sprachen",
    submillion: "Auch Sprachen mit <1 Million Nutzern",
    notRecommended: "Für gemütliches Malen wenig geeignet: deutlich unbekannter, als die Sprecherzahl vermuten lässt.",
    toggle: (included) =>
      included
        ? "Angehakt — diese sind in der Liste. Abwählen, um sie wegzulassen."
        : "Anhaken, um diese zur Liste hinzuzufügen.",
  },
  sovereignty: {
    label: "Souveränität & Anerkennung",
    wiki: "https://de.wikipedia.org/wiki/Liste_der_Gebiete_mit_begrenzter_Anerkennung_als_Staat",
    axisRow: "de jure",
    axisCol: "de facto",
    cols: ["Vollständig unabhängig", "Teilweise autonom"],
    rows: ["Universell anerkannt", "Überwiegend anerkannt", "Teilweise anerkannt", "Nicht anerkannt"],
    colDefs: [
      "Kontrolliert Grenzen, Justiz, Armee und Steuern selbst.",
      "Hat eigene Gesetze und ein eigenes Parlament, teilt aber Kernbereiche (Währung, Verteidigung, Aussenpolitik) mit einem anderen Staat.",
    ],
    rowDefs: [
      "UN-Mitgliedstaat, von praktisch allen anderen anerkannt.",
      "Von einem grossen Teil der UN-Mitglieder anerkannt, mit einigen Verweigerern.",
      "Nur von wenigen Staaten anerkannt, oft aber mit starker faktischer oder wahrgenommener Präsenz.",
      "International als Teil eines anderen souveränen Staates betrachtet.",
    ],
    regular: "Reguläre Staaten",
  },
  language: {
    label: (current) => `Sprache: ${current}`,
    menu: "Sprache",
    panelTitle: "Spracheinstellungen",
    slot: { primary: "Primär:", interface: "Oberfläche:", fallback: "Fallback:" },
    slotHint: {
      primary: "Primäre Sprache für die Listeneinträge und Standard für die meisten anderen Spracheinstellungen.",
      interface: "Sprache der Oberfläche.",
      fallback: "Wird überall dort verwendet, wo der Oberflächensprache ein Label fehlt.",
    },
    followPrimary: "Wie Primärsprache",
    showSecondaryBefore: "Option zum Verwenden von Einträgen auf", showSecondaryAfter: "anzeigen",
    showSecondaryHint:
      "Damit lassen sich z. B. Ländernamen in deiner Muttersprache, die Namen von Serienfiguren dagegen in deiner bevorzugten Synchronfassung verwenden.",
    secondaryMoot: "Diese Schalter erscheinen nur, solange sich Primär- und Zweitsprache unterscheiden.",
    unsupported: (language) =>
      `Für ${language} noch nicht bestätigt — dieses Thema ist evtl. unvollständig.`,
    fallback: "Fehlende Übersetzungen erscheinen auf Englisch.",
    // Declined, which every language name ending in -isch takes an -en for:
    // Koreanisch → Koreanischen. The handful that don't (Urdu, Hindi, Suaheli)
    // are already correct undeclined — "auch im Urdu" — so the ending is added
    // where it belongs rather than always. The bracketed half never takes it.
    usesEnglish: (primary, secondary) =>
      `Auch im ${primary}${primary.endsWith("sch") ? "en" : ""}${secondary} werden offiziell die englischen Namen verwendet.`,
    variant: {
      romaji: "Romaji für die Listeneinträge verwenden",
      es419: "Lateinamerikanisches Spanisch für die Listeneinträge verwenden",
    },
    variantNote: { romaji: "Hepburn-Schreibung mit doppelten Langvokalen (Moomoomiruku).{br}" +
                           "Wāpuro-Romaji wird NICHT unterstützt: es würde im Konflikt stehen mit offiziellen Schreibweisen (Butterfree statt Batafurii),{br}" +
                           "und jede Lösung dieses und darauffolgender Probleme würde momentan den Rahmen sprengen." },
    generatedRomaji:
      "Diese Romaji wurden aus den japanischen Namen erzeugt. Wird eines davon anders geschrieben, [sag uns gerne Bescheid](https://github.com/Trummler12/custom-wordlists/issues/new)!",
    variantDiffers: (n) => `${n} ${n === 1 ? "Eintrag wird" : "Einträge werden"} anders geschrieben`,
    variantShowList: "Welche?",
    useEnglish: (forced) =>
      forced
        ? "Diese Liste in der gewählten Sprache verwenden"
        : "Die englischen Einträge dieser Liste verwenden",
    useEnglishAll: (allForced) =>
      allForced
        ? "Diese Listen in der gewählten Sprache verwenden"
        : "Die englischen Einträge dieser Listen verwenden",
    useSecondary: (forced, secondary) =>
      forced ? "Diese Liste in der gewählten Sprache verwenden" : `Die Einträge dieser Liste auf ${secondary} verwenden`,
    useSecondaryAll: (allForced, secondary) =>
      allForced
        ? "Diese Listen in der gewählten Sprache verwenden"
        : `Die Einträge dieser Listen auf ${secondary} verwenden`,
  },
  settings: {
    label: "Einstellungen",
    showEnglish: "Option zum Verwenden englischer Einträge anzeigen",
    showEnglishEn: "Diese Schalter erscheinen nur bei anderen Sprachen als Englisch.",
    interfaceLang: "Sprache der Oberfläche:",
    interfaceAuto: "Automatisch",
    outputSeparator: "Ausgabe-Trennzeichen:",
    outputSeparatorHint:
      "skribbl.io akzeptiert nur \",\" als Trennzeichen. Die anderen ändern nur, was kopiert wird; die Ausgabe sieht in jedem Fall gleich aus.",
    minChars: "Min. Zeichen:",
    maxChars: "Max. Zeichen:",
    reset: "Auswahl-Einstellungen{br}zurücksetzen",
    resetConfirm: "Zum Bestätigen erneut klicken",
    resetCancel: "Abbrechen",
  },
  output: {
    label: "Ausgabe",
    copy: "Kopieren",
    copied: "Kopiert!",
    copyFailed: "Kopieren fehlgeschlagen",
    copyManual: "Die Liste ist markiert — bitte selbst kopieren.",
    empty: "Wähle Themen, Kategorien oder eigene Listen, um eine Ausgabe zu generieren.",
    generatedList: "Generierte Wortliste",
    words: "Wörter",
    chars: "Zeichen",
    belowMin: (min) => `· unter skribbl-Minimum (${min})`,
    overMax: "· über dem Maximum",
    overLong: (count, maxLen) =>
      `${count} ${count === 1 ? "Wort" : "Wörter"} mit mehr als ${maxLen} Zeichen`,
  },
  footer: {
    repository: "GitHub-Repository",
    helpOut: "Du möchtest mithelfen? Wirf dafür gerne einen Blick in den",
    // Link label stays English — the guide itself is only available in English.
    contributionGuide: "Contribution Guide",
    helpOutAfter: "!",
  },
  coveragePage: {
    home: "Zur Haupt-App",
    topicLabel: "Thema:",
    uiLanguage: "Oberflächensprache",
    title: "Sprachabdeckung",
    intro: "Wähle ein Thema, um zu sehen, für welche Sprachen Wikidata je Eintrag bereits eine Bezeichnung hat.",
    lead: "Die Inhalte dieses Themas stammen aus [Wikidata](https://www.wikidata.org/wiki/Wikidata:Main_Page). Die Tabelle zeigt, für welche Sprachen jeder Eintrag bereits eine Bezeichnung hat.",
    notesTitle: "Wie du mithelfen kannst",
    noteAdd: "Öffne einen Eintrag über die erste Spalte und ergänze, einmal angemeldet, jede fehlende Bezeichnung, bei der du dir sicher bist.",
    noteLabelLister: "Um eine gar nicht aufgeführte Sprache zu ergänzen, geh in deine [Wikidata-Einstellungen](https://www.wikidata.org/wiki/Special:Preferences#mw-prefsection-gadgets) und aktiviere im Tab \"Helferlein\" (\"Gadgets\") das {i}labelLister{/i}-Gadget; jeder Eintrag zeigt dann eine „Labels list“ (oben rechts unter Werkzeuge), die jeden Sprachcode annimmt.",
    noteProtected: "Manche Wikidata-Einträge sind geschützt und lassen sich nur mit einem Konto ändern, das mindestens vier Tage alt ist und 100 oder mehr Bearbeitungen hat.",
    noteStale: "Beachte, dass diese Tabelle aus einem manuellen Dump stammt; die hier gezeigte Abdeckung kann dem aktuellen Stand auf Wikidata daher um bis zu mehrere Wochen oder gar Monate hinterherhinken.",
    itemCount: (n) => `${n.toLocaleString()} Einträge`,
    uiOnly: "Nur UI-Sprachen",
    uiOnlyHint: "Die Rohdaten-Dumps decken bereits jede von skribbl.io unterstützte Sprache ab,{br}"+
                "plus ein paar weitere mit vielen Nutzenden.{br}"+
                "Die Daten unterstützen also schon jede geplante Sprache,{br}"+
                "während die Oberfläche von uns Maintainern gepflegt wird und daher natürlich deutlich hinterher hinkt.{br}"+
                "Zudem bringt es recht wenig, eine neue UI-Sprache einführen zu wollen,{br}"+
                "während es noch kaum Themen gibt, welche diese Sprache überhaupt abdecken.{br}"+
                "Aber je mehr mithelfen, desto früher werden neue Sprachen freigeschaltet!{br}"+
                "=> Schau hierzu gerne in den Contribution Guide unten!",
    item: "Eintrag",
    numeric: { population: "Einwohner", area: "Fläche (km²)", users: "Nutzer" },
    first: "Erste Seite",
    prev: "Vorherige Seite",
    next: "Nächste Seite",
    last: "Letzte Seite",
    page: (current, total) => `Seite ${current} / ${total}`,
    pageJumpHint: (numeric) =>
      numeric
        ? `Klick: zu einer Seite, einem Eintragsnamen oder einem Wert in „${numeric}“ springen`
        : "Klick: zu einer Seite oder einem Eintragsnamen springen",
    pageJumpInput: "Seite, Wert oder Eintragsname",
    pageNoNumeric: "Diese Tabelle hat keine Zahlenspalte.",
    loading: (topic) => `${topic} werden geladen…`,
    loadError: (topic, message) => `Abdeckung für ${topic} konnte nicht geladen werden: ${message}`,
  },
};
