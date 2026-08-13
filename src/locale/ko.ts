import type { UIStrings } from "./index";

/** Korean UI strings. Machine-written and unreviewed by a native speaker — see
 *  the proofreading note in CONTRIBUTING.md.
 *
 *  Korean marks no plural, so the counters that other locales branch on read the
 *  same at one as at many. Where a particle would depend on the preceding sound,
 *  the phrasing avoids one — an inserted language name can end either way. */
export const ko: UIStrings = {
  header: {
    // The link sits between the two halves, and Korean puts it first.
    taglineBefore: "",
    taglineAfter: "와 같은 단어 게임을 위한 나만의 단어 목록을 만들어 보세요.",
  },
  tree: {
    topics: "주제",
    loading: "주제를 불러오는 중…",
    loadError: (message) => `주제를 불러오지 못했습니다: ${message}`,
    empty: "아직 사용할 수 있는 주제가 없습니다.",
    toggle: (expanded, title) => `${title} ${expanded ? "접기" : "펼치기"}`,
    loadingShort: "불러오는 중…",
    wordsOf: (selected, total) => `${total}개 중 ${selected}개 단어`,
  },
  names: {
    form: { short: "짧게", long: "길게", both: "둘 다" },
    formLabel: (group) => `${group}의 이름 형식`,
  },
  fame: {
    depthLabel: (group) => `${group}의 인지도 단계`,
    valueText: (depth, total) => `${total}단계 중 상위 ${depth}단계`,
    groupsDefined: (count) => `정의된 인지도 그룹: ${count}`,
    none: "아직 정의된 인지도 그룹이 없습니다. 하단의 Contribution Guide에서 제안할 수 있습니다.",
    toggle: (shown) =>
      shown ? "이 목록의 인지도 슬라이더 숨기기" : "이 목록의 인지도 슬라이더 표시",
    toggleAll: (allShown) =>
      allShown ? "이 인지도 슬라이더들 숨기기" : "이 인지도 슬라이더들 표시",
  },
  omitted: {
    label: "이 목록에서 빠진 항목",
    title: "이 목록에서 제외됨:",
    toggle: (omitted) => (omitted ? "켜면 목록에 포함합니다" : "켜면 제외합니다"),
    locked: "단어가 아니라 게임 데이터라서 추가할 수 없습니다.",
    unknown: (n, primary, secondary) =>
      `원본 데이터에 ${primary}${secondary} 이름이 없는 항목 ${n}개`,
    unknownHint: (omitted) =>
      omitted
        ? "켜면 유일하게 알려진 영어 이름으로 포함합니다."
        : "켜면 다시 제외합니다.",
  },
  language: {
    label: (current) => `언어: ${current}`,
    menu: "언어",
    unsupported: (language) => `${language}은(는) 아직 확인되지 않았습니다. 이 주제는 불완전할 수 있습니다.`,
    fallback: "번역이 없는 곳에는 영어가 사용됩니다.",
    usesEnglish: (primary, secondary) =>
      `${primary}${secondary}에서도 공식적으로 영어 이름을 사용합니다.`,
    variant: {
      romaji: "목록 항목에 로마자 사용",
      es419: "목록 항목에 라틴 아메리카 스페인어 사용",
    },
    useEnglish: (forced) =>
      forced ? "이 목록을 선택한 언어로 표시" : "이 목록의 영어 항목 사용",
    useEnglishAll: (allForced) =>
      allForced ? "이 목록들을 선택한 언어로 표시" : "이 목록들의 영어 항목 사용",
  },
  settings: {
    label: "설정",
    showEnglish: "영어 항목을 사용하는 옵션 표시",
    showEnglishEn: "이 스위치는 영어가 아닌 언어에서만 나타납니다.",
    interfaceLang: "인터페이스 언어:",
    interfaceAuto: "자동",
  },
  output: {
    label: "결과",
    copy: "복사",
    copied: "복사했습니다",
    empty: "주제나 그룹을 선택하면 목록이 만들어집니다.",
    generatedList: "생성된 단어 목록",
    words: "단어",
    chars: "글자",
    belowMin: (min) => `· skribbl 최소 개수(${min}) 미만`,
    overMax: "· 최대치 초과",
    excluded: (count, maxLen, list) =>
      `${maxLen}자를 넘어 ${count}개 단어를 제외했습니다: ${list}`,
  },
  footer: {
    repository: "GitHub 저장소",
    helpOut: "프로젝트를 돕고 싶으신가요? 하단의",
    // The guide itself is English only, so the link keeps its name.
    contributionGuide: "Contribution Guide",
    helpOutAfter: "를 확인해 보세요.",
  },
};
