import type { UIStrings } from "./index";
import { en } from "./en";

/** Traditional Chinese UI strings (Taiwan vocabulary). Machine-written and unreviewed by
 *  a native speaker — see the proofreading note in CONTRIBUTING.md.
 *
 *  Chinese marks no plural, so the counters that other locales branch on read the same
 *  at one as at many — and a name needs no article or ending, so the two halves of a
 *  display name are simply joined. */
export const zhHant: UIStrings = {
  header: {
    // The link sits between the two halves, and Chinese puts it first.
    taglineBefore: "",
    taglineAfter: "等類似猜詞遊戲，建立你專屬的單字清單。",
  },
  tree: {
    topics: "主題",
    loading: "正在載入主題…",
    loadError: (message) => `無法載入主題：${message}`,
    empty: "目前沒有可用的主題。",
    toggle: (expanded, title) => `${expanded ? "收合" : "展開"}${title}`,
    loadingShort: "載入中…",
    wordsOf: (selected, total) => `${total} 個單字中的 ${selected} 個`,
  },
  names: {
    form: { pref: "偏好", short: "短", long: "長", both: "兩者", all: "全部" },
    formLabel: (group) => `${group}的名稱形式`,
  },
  fame: {
    depthLabel: (group) => `${group}的知名度深度`,
    valueText: (depth, total) => `${total} 級中的前 ${depth} 級`,
    groupsDefined: (count) => `已定義的知名度分組：${count}`,
    none: "尚未定義知名度分組。可透過頁尾的 Contribution Guide 提出建議。",
    selected: "已選擇：",
    mostlySelected: "大部分已選擇：",
    stored: (body) => `（已儲存：${body}）`,
    toggle: (shown) =>
      shown ? "隱藏此清單的知名度滑桿" : "顯示此清單的知名度滑桿",
    toggleAll: (allShown) =>
      allShown ? "隱藏這些知名度滑桿" : "顯示這些知名度滑桿",
  },
  omitted: {
    label: "此清單未包含的內容",
    title: "已從此清單排除：",
    toggle: (omitted) => (omitted ? "開啟以將其納入清單" : "開啟以將其排除"),
    locked: "這些是遊戲資料而非單字，無法加入。",
    upTo: (n) => `最多 ${n} 個`,
    unknown: (n, primary, secondary) =>
      `原始資料中最多有 ${n} 個項目沒有${primary}${secondary}名稱`,
    unknownHint: (omitted) =>
      omitted
        ? "開啟以用它們唯一已知的英文名稱納入。"
        : "開啟以將其再次排除。",
    unknownTier: (tier, n) => `第 ${tier} 級：${n} 個`,
    tooLong: (n, maxLen) => `最多 ${n} 個長度超過 ${maxLen} 個字元的名稱`,
    tooLongHint: (omitted) =>
      omitted
        ? "開啟以仍然納入。skribbl.io 不接受，但其他遊戲或許可以。"
        : "開啟以將其再次排除。",
    helpAdd: (url) => ` — [幫我們補齊缺少的部分！](${url})`,
  },
  // custom: English stopgap until the UI-language PR translates it (§X).
  custom: en.custom,
  coverage: {
    label: "Geoguessr / 街景覆蓋",
    all: "所有國家",
    withCoverage: "有官方覆蓋",
    reliable: "僅可靠覆蓋",
  },
  languageType: {
    label: "包含哪些語言類型",
    base: "現代仍在使用的語言",
    submillion: "也包含使用者不足 100 萬的語言",
    notRecommended: "不太適合休閒繪圖 — 相對使用者數量而言知名度低得多。",
    toggle: (included) =>
      included ? "已選擇 — 已在清單中。取消勾選即可排除。" : "勾選即可加入清單。",
  },
  sovereignty: {
    label: "主權與承認",
    wiki: "https://zh.wikipedia.org/wiki/有限承認國家列表",
    axisRow: "法理上",
    axisCol: "事實上",
    cols: ["完全獨立", "部分自治"],
    rows: ["普遍承認", "廣泛承認", "部分承認", "未獲承認"],
    colDefs: [
      "自行掌管邊界、司法、軍隊與稅收。",
      "擁有自己的法律與議會，但貨幣、國防、外交等核心權限與另一國共享。",
    ],
    rowDefs: [
      "聯合國會員國，幾乎所有國家都予以承認。",
      "獲多數聯合國會員國承認，但存在部分反對。",
      "僅少數國家承認，但通常在事實上或認知上存在感很強。",
      "在國際上被視為另一主權國家的一部分。",
    ],
    regular: "一般國家",
  },
  language: {
    label: (current) => `語言：${current}`,
    menu: "語言",
    unsupported: (language) => `${language}尚未確認，此主題可能不完整。`,
    fallback: "沒有翻譯時會使用英文。",
    usesEnglish: (primary, secondary) =>
      `${primary}${secondary}也官方使用英文名稱。`,
    variant: {
      romaji: "清單項目使用羅馬字",
      es419: "清單項目使用拉丁美洲西班牙文",
    },
    variantNote: { romaji: "長音以重複母音表示的平文式羅馬字（Moomoomiruku）。{br}不提供文字處理式羅馬字，因為它會覆蓋官方寫法 — 是 Butterfree 而非 Batafurii。" },
    generatedRomaji:
      "這些羅馬字由日文名稱自動產生。若實際寫法不同，請[告訴我們](https://github.com/Trummler12/custom-wordlists/issues/new)。",
    variantDiffers: (n) => `${n} 個項目的寫法不同`,
    variantShowList: "查看是哪些項目",
    useEnglish: (forced) =>
      forced ? "以所選語言顯示此清單" : "使用此清單的英文項目",
    useEnglishAll: (allForced) =>
      allForced ? "以所選語言顯示這些清單" : "使用這些清單的英文項目",
  },
  settings: {
    label: "設定",
    showEnglish: "顯示使用英文項目的選項",
    showEnglishEn: "此開關僅在非英文語言下出現。",
    interfaceLang: "介面語言：",
    interfaceAuto: "自動",
    reset: "重設{br}設定",
    resetConfirm: "再次點擊以確認",
    resetCancel: "取消",
  },
  output: {
    label: "結果",
    copy: "複製",
    copied: "已複製",
    copyFailed: "複製失敗",
    copyManual: "已選取清單，請手動複製。",
    empty: "選擇主題或分組即可產生清單。",
    generatedList: "產生的單字清單",
    words: "單字",
    chars: "字元",
    belowMin: (min) => `· 低於 skribbl 最小數量（${min}）`,
    overMax: "· 超過上限",
    overLong: (count, maxLen) => `${count} 個單字超過 ${maxLen} 個字元`,
  },
  footer: {
    repository: "GitHub 儲存庫",
    helpOut: "想幫助這個專案嗎？請看看",
    // The guide itself is English only, so the link keeps its name.
    contributionGuide: "Contribution Guide",
    helpOutAfter: "。",
  },
  coveragePage: {
    home: "前往主應用程式",
    topicLabel: "主題：",
    uiLanguage: "介面語言",
    title: "語言覆蓋",
    intro: "選擇一個主題，查看每個項目在 Wikidata 上已有哪些語言的標籤。",
    lead: "此主題的內容來自 [Wikidata](https://www.wikidata.org/wiki/Wikidata:Main_Page)。下表顯示每個項目已擁有哪些語言的標籤。",
    notesTitle: "如何幫忙",
    noteAdd: "從第一欄打開一個項目，登入後補上你確定的缺少標籤。",
    noteLabelLister: "要新增完全未列出的語言，請在你的 [Wikidata 設定](https://www.wikidata.org/wiki/Special:Preferences#mw-prefsection-gadgets)中的「小工具」裡啟用 labelLister 小工具；之後每個項目會顯示「Labels list」（右上角「工具」下），可接受任意語言代碼。",
    noteProtected: "部分 Wikidata 項目受保護，需要註冊滿 4 天且編輯達 100 次以上的帳號才能修改。",
    noteStale: "此表基於手動傾印，因此這裡顯示的覆蓋率可能比 Wikidata 的最新狀態落後最多數週。",
    itemCount: (n) => `${n.toLocaleString()} 個項目`,
    uiOnly: "僅介面語言",
    uiOnlyHint: "原始資料傾印已經涵蓋 skribbl.io 支援的所有語言，{br}外加幾種使用者眾多的語言。{br}也就是說，資料其實已支援所有計畫中的語言，{br}而介面由我們維護者打理，自然明顯落後。{br}而且在幾乎沒有主題涵蓋某種語言時，{br}想新增該介面語言意義不大。{br}不過幫忙的人越多，新語言就能越早獲准！{br}=> 歡迎看看下方的 Contribution Guide！",
    item: "項目",
    numeric: { population: "人口", area: "面積 (km²)", users: "使用者" },
    first: "第一頁",
    prev: "上一頁",
    next: "下一頁",
    last: "最後一頁",
    page: (current, total) => `第 ${current} 頁 / 共 ${total} 頁`,
    loading: (topic) => `正在載入${topic}…`,
    loadError: (topic, message) => `無法載入${topic}的覆蓋資料：${message}`,
  },
};
