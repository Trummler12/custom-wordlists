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
    wordsOf: (selected, total) => `${selected} of ${total} words`,
  },
  names: {
    form: { short: "short", long: "long", both: "both" },
    formLabel: (group) => `Name form for ${group}`,
  },
  fame: {
    depthLabel: (group) => `Fame depth for ${group}`,
    valueText: (depth, total) => `top ${depth} of ${total} tiers`,
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
    unknown: (n) => `${n} entries the source data has no name for in this language`,
    unknownHint: (omitted) =>
      omitted
        ? "Toggle to include these under their English names — the only ones known for them."
        : "Toggle to leave these out again.",
  },
  language: {
    label: (current) => `Language: ${current}`,
    menu: "Language",
    unsupported: (language) => `Not confirmed for ${language} yet — this topic may be incomplete.`,
    fallback: "English is used where a translation is missing.",
    usesEnglish: (primary, secondary) => `${primary}${secondary} officially uses the English names too.`,
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
    empty: "Select topics or groups to build a list.",
    generatedList: "Generated word list",
    words: "words",
    chars: "chars",
    belowMin: (min) => `· below skribbl minimum (${min})`,
    overMax: "· over the maximum",
    excluded: (count, maxLen, list) =>
      `${count} word${count === 1 ? "" : "s"} excluded (longer than ${maxLen} chars): ${list}`,
  },
  footer: {
    repository: "GitHub Repository",
    helpOut: "Want to help with the project? Check out the",
    contributionGuide: "Contribution Guide",
    helpOutAfter: "!",
  },
};
