import type { UIStrings } from "./index";

/** English UI strings (the fallback locale). */
export const en: UIStrings = {
  taglineBefore: "Build custom word lists for",
  taglineAfter: "and similar word games.",
  loadingTopics: "Loading topics…",
  loadError: (message) => `Could not load topics: ${message}`,
  noTopics: "No topics available yet.",
  topics: "Topics",
  toggle: (expanded, title) => `${expanded ? "Collapse" : "Expand"} ${title}`,
  loadingShort: "loading…",
  wordsOf: (selected, total) => `${selected} of ${total} words`,
  nameForm: { short: "short", long: "long", both: "both" },
  nameFormLabel: (group) => `Name form for ${group}`,
  fameDepthLabel: (group) => `Fame depth for ${group}`,
  tiersValueText: (depth, total) => `top ${depth} of ${total} tiers`,
  output: "Output",
  copy: "Copy",
  copied: "Copied!",
  emptyOutput: "Select topics or groups to build a list.",
  generatedList: "Generated word list",
  wordsLabel: "words",
  charsLabel: "chars",
  belowMin: (min) => `· below skribbl minimum (${min})`,
  overMax: "· over the maximum",
  excluded: (count, maxLen, list) =>
    `${count} word${count === 1 ? "" : "s"} excluded (longer than ${maxLen} chars): ${list}`,
  languageLabel: (current) => `Language: ${current}`,
  languageMenu: "Language",
  langUnsupported: (language) =>
    `Not confirmed for ${language} yet — this topic may be incomplete.`,
  langFallback: "English is used where a translation is missing.",
  repository: "GitHub Repository",
  helpOut: "Want to help with the project? Check out the",
  contributionGuide: "Contribution Guide",
  helpOutAfter: "!",
};
