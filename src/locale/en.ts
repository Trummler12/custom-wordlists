import type { UIStrings } from "./index";

/** English UI strings (the fallback locale). */
export const en: UIStrings = {
  header: {
    taglineBefore: "Build custom word lists for",
    taglineAfter: "and similar word games.",
  },
  tree: {
    topics: "Topics",
    loading: "Loading topics…",
    loadError: (message) => `Could not load topics: ${message}`,
    empty: "No topics available yet.",
    toggle: (expanded, title) => `${expanded ? "Collapse" : "Expand"} ${title}`,
    loadingShort: "loading…",
    wordsOf: (selected, total) => `${selected} of ${total} word${total === 1 ? "" : "s"}`,
  },
  names: {
    form: { pref: "preferred", short: "short", long: "long", both: "both", all: "all" },
    formLabel: (group) => `Name form for ${group}`,
  },
  fame: {
    depthLabel: (group) => `Fame depth for ${group}`,
    valueText: (depth, total) =>
      depth === 1 ? `top tier of ${total}` : `top ${depth} of ${total} tiers`,
    groupsDefined: (count) => `Fame groups defined: ${count}`,
    none: "No fame groups defined yet — see the Contribution Guide in the footer to propose some!",
    selected: "Selected:",
    mostlySelected: "Mostly selected:",
    stored: (body) => `(Stored: ${body})`,
    toggle: (shown) => (shown ? "Hide this list's fame ruler" : "Show this list's fame ruler"),
    toggleAll: (allShown) => (allShown ? "Hide these fame rulers" : "Show these fame rulers"),
  },
  omitted: {
    label: "What this list leaves out",
    title: "Left out of this list:",
    toggle: (omitted) =>
      omitted ? "Toggle to include these in your list" : "Toggle to leave these out",
    locked: "These are game data rather than words, so they can't be added.",
    upTo: (n) => `Up to ${n}`,
    unknown: (n, primary, secondary) =>
      `Up to ${n} entr${n === 1 ? "y" : "ies"} the source data has no ${primary}${secondary} name for`,
    unknownHint: (omitted) =>
      omitted
        ? "Toggle to include these under their English names — the only ones known for them."
        : "Toggle to leave these out again.",
    unknownTier: (tier, n) => `Tier ${tier}: ${n} entr${n === 1 ? "y" : "ies"}`,
    tooLong: (n, maxLen) => `Up to ${n} name${n === 1 ? "" : "s"} longer than ${maxLen} characters`,
    tooLongHint: (omitted) =>
      omitted
        ? "Toggle to include them anyway — skribbl.io won't take them, but another game might."
        : "Toggle to leave them out again.",
    helpAdd: (url) => ` — [help us add what's missing!](${url})`,
  },
  custom: {
    title: "Custom",
    infoHint:
      "Use the input field below to add any additional list(s) of words you like.{br}" +
      "The following rules apply:{br}" +
      "- All items are separated by one separator character, kept consistent across the whole input.{br}" +
      "- An item that itself contains the separator character must be wrapped in \"quotation marks\".{br}" +
      "- Punctuation and other special characters are generally not recommended for skribbl.io.{br}" +
      "- Items are trimmed of any leading and trailing whitespace.{br}" +
      "- On every change, the separator is auto-detected as the most common separator character.",
    separatorLabel: "Separator:",
    separatorPick: "Separator character",
    internalDupes: (n) => `${n} duplicate ${n === 1 ? "entry" : "entries"} within the list`,
    localDupes: (n) => `${n} duplicate${n === 1 ? "" : "s"} across your custom lists`,
    globalDupes: (n) => `${n} duplicate${n === 1 ? "" : "s"} with the selected topics`,
    dupesHint: "Reported, not filtered — drop them from your input if you like.",
    fitToggle: "Fit the input to its full height",
    fewerRows: "Show fewer rows",
    moreRows: "Show more rows",
    clearHint: "Clear the custom input field",
    clearConfirm: "You're about to empty the Custom input field.",
    clearConfirmButton: "Click here to confirm",
    listsLabel: "Saved lists",
    listsTitle: "Saved custom lists",
    listsInfo:
      "Custom lists are stored in local storage.{br}" +
      "Each browser keeps its own local storage,{br}" +
      "separate from other browsers or devices.{br}" +
      "To take your custom lists elsewhere,{br}" +
      "export them here and import them at the destination.",
    listActivate: "Use this list",
    listRename: "Rename",
    listSave: "Save the current input into this list",
    listLoad: "Load this list into the input field",
    listDelete: "Delete this list",
    listUp: "Move up",
    listDown: "Move down",
    listSaveNew: "Save the current input as a new list",
    phActivate: "Can use Placeholder",
    phRename: "Can't rename Placeholder",
    phLoad: "Can't load Placeholder",
    phDelete: "Can't delete Placeholder",
    phMove: "Can't move Placeholder",
    exportLabel: "Export lists",
    exportTitle: "Export saved lists",
    selectAll: "Select all",
    exportDownload: "Download",
    importLabel: "Import lists",
    importTitle: "Import saved lists",
    importPick: "Choose a file…",
    importColName: "Name",
    importColSize: "Size",
    importColDupes: "Dupes",
    importColWith: "with",
    importButton: "Import selected",
    importEmpty: "No saved lists in this file.",
    importDupesSecondary: (pct) => `Secondary: ${pct}`,
    listReplaceConfirm: (name) => `Replace the list "${name}" with the current input?`,
    listDeleteConfirm: (name) => `Delete the list "${name}"?`,
    listLoadConfirm: "Overwrite the input field with this list?",
    confirm: "Confirm",
    cancel: "Cancel",
    listWarnTitle: "This custom list has problems:",
    listWarnSeparator: "The selected separator character occurs inside an item.",
    settingsLabel: "Custom settings",
    settingsTitle: "Custom settings",
    maxPreviewItems: "Max preview items",
    maxPreviewChars: "Max preview characters",
    exampleListS: "Example list S",
    exampleListL: "Example list L",
    examplePreviewEmpty: "No topic names loaded yet.",
  },
  coverage: {
    label: "Geoguessr / Street View coverage",
    all: "All countries",
    withCoverage: "With official coverage",
    reliable: "Reliable coverage only",
  },
  languageType: {
    label: "Which language types to include",
    base: "Living modern languages",
    submillion: "Also languages with <1 million users",
    notRecommended: "A poor fit for casual drawing: far less familiar than its speaker numbers suggest.",
    toggle: (included) =>
      included
        ? "Ticked — these are in the list. Untick to leave them out."
        : "Tick to add these to the list.",
  },
  sovereignty: {
    label: "Sovereignty & recognition",
    wiki: "https://en.wikipedia.org/wiki/List_of_states_with_limited_recognition",
    axisRow: "de jure",
    axisCol: "de facto",
    cols: ["Fully independent", "Partially autonomous"],
    rows: ["Universally recognized", "Widely recognized", "Partially recognized", "Unrecognized"],
    colDefs: [
      "Runs its own borders, courts, army and taxes.",
      "Has its own laws and parliament, but shares core powers — currency, defence, foreign policy — with another state.",
    ],
    rowDefs: [
      "A UN member state, recognized by essentially every other.",
      "Recognized by a large share of UN members, with some hold-outs.",
      "Recognized by only a few states, though often with a strong functional or perceived presence.",
      "Internationally regarded as part of another sovereign state.",
    ],
    regular: "Regular states",
  },
  language: {
    label: (current) => `Language: ${current}`,
    menu: "Language",
    unsupported: (language) => `Not confirmed for ${language} yet — this topic may be incomplete.`,
    fallback: "English is used where a translation is missing.",
    usesEnglish: (primary, secondary) => `${primary}${secondary} officially uses the English names too.`,
    variant: {
      romaji: "Use Romaji for list entries",
      es419: "Use Latin American Spanish for list entries",
    },
    variantNote: { romaji: "Hepburn spellings with long vowels doubled (Moomoomiruku).{br}Wāpuro romaji is not offered: it would override official spellings — Butterfree, not Batafurii." },
    generatedRomaji:
      "These romaji were generated from the Japanese names. If one is spelled differently in practice, please [tell us](https://github.com/Trummler12/custom-wordlists/issues/new).",
    variantDiffers: (n) => `${n} entr${n === 1 ? "y" : "ies"} spelled differently`,
    variantShowList: "Show which",
    useEnglish: (forced) =>
      forced ? "Use this list in the selected language" : "Use the English entries of this list",
    useEnglishAll: (allForced) =>
      allForced
        ? "Use these lists in the selected language"
        : "Use the English entries of these lists",
  },
  settings: {
    label: "Settings",
    showEnglish: "Show the option to use English entries",
    showEnglishEn: "These toggles only appear for languages other than English.",
    interfaceLang: "Interface language:",
    interfaceAuto: "Automatic",
    reset: "Reset settings{br}to default",
    resetConfirm: "Click again to confirm",
    resetCancel: "Cancel",
  },
  output: {
    label: "Output",
    copy: "Copy",
    copied: "Copied!",
    copyFailed: "Copy failed",
    copyManual: "The list is selected — copy it yourself.",
    empty: "Select topics or groups to build a list.",
    generatedList: "Generated word list",
    words: "words",
    chars: "chars",
    belowMin: (min) => `· below skribbl minimum (${min})`,
    overMax: "· over the maximum",
    overLong: (count, maxLen) =>
      `${count} word${count === 1 ? "" : "s"} longer than ${maxLen} characters`,
  },
  footer: {
    repository: "GitHub Repository",
    helpOut: "Want to help with the project? Check out the",
    contributionGuide: "Contribution Guide",
    helpOutAfter: "!",
  },
  coveragePage: {
    home: "Main App Page",
    topicLabel: "Topic:",
    uiLanguage: "Interface language",
    title: "Language Coverage",
    intro: "Pick a topic to see which languages Wikidata already has a label for, per item.",
    lead: "This topic's contents come from [Wikidata](https://www.wikidata.org/wiki/Wikidata:Main_Page). The table shows which languages already have a label for each item.",
    notesTitle: "How to help",
    noteAdd: "Open an item from the first column and, once logged in, add any missing label you're sure of.",
    noteLabelLister: "To add a language that isn't listed at all, enable the labelLister gadget in your [Wikidata preferences](https://www.wikidata.org/wiki/Special:Preferences#mw-prefsection-gadgets), under Gadgets; each item then shows a “Labels list” (top right, under Tools) that accepts any language code.",
    noteProtected: "Some Wikidata items are protected and need an account at least four days old with 100 or more edits to change.",
    noteStale: "Note that this table comes from a manual dump, so the coverage shown here can lag the current state on Wikidata by up to several weeks.",
    itemCount: (n) => `${n.toLocaleString()} items`,
    uiOnly: "UI languages only",
    uiOnlyHint: "The raw data dumps already cover every language skribbl.io supports,{br}plus a few more with many users.{br}So the data already supports every planned language,{br}while the interface is kept up by us maintainers and naturally lags well behind.{br}And there is little point in trying to add a new interface language{br}while barely any topics cover that language yet.{br}But the more people help, the sooner new languages are greenlit!{br}=> Feel free to check out the Contribution Guide below!",
    item: "Item",
    numeric: { population: "Population", area: "Area (km²)", users: "Users" },
    first: "First page",
    prev: "Previous page",
    next: "Next page",
    last: "Last page",
    page: (current, total) => `Page ${current} / ${total}`,
    loading: (topic) => `Loading ${topic}…`,
    loadError: (topic, message) => `Could not load coverage for ${topic}: ${message}`,
  },
};
