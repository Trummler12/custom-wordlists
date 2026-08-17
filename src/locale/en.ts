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
    form: { short: "short", long: "long", both: "both" },
    formLabel: (group) => `Name form for ${group}`,
  },
  fame: {
    depthLabel: (group) => `Fame depth for ${group}`,
    valueText: (depth, total) =>
      depth === 1 ? `top tier of ${total}` : `top ${depth} of ${total} tiers`,
    groupsDefined: (count) => `Fame groups defined: ${count}`,
    none: "No fame groups defined yet — see the Contribution Guide in the footer to propose some!",
    toggle: (shown) => (shown ? "Hide this list's fame ruler" : "Show this list's fame ruler"),
    toggleAll: (allShown) => (allShown ? "Hide these fame rulers" : "Show these fame rulers"),
  },
  omitted: {
    label: "What this list leaves out",
    title: "Left out of this list:",
    toggle: (omitted) =>
      omitted ? "Toggle to include these in your list" : "Toggle to leave these out",
    locked: "These are game data rather than words, so they can't be added.",
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
};
