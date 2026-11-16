import type { LocaleDict } from "./index";

/** Traditional Chinese UI strings (Taiwan vocabulary). Machine-written and unreviewed by
 *  a native speaker — see the proofreading note in CONTRIBUTING.md.
 *
 *  Chinese marks no plural, so the counters that other locales branch on read the same
 *  at one as at many — and a name needs no article or ending, so the two halves of a
 *  display name are simply joined. */
export const zhHant: LocaleDict = {
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
    duplicatesRemoved: (count) => `已移除 ${count} 個重複項目`,
    incompleteTopic: (url) => `此主題被標記為不完整。{br}[幫我們補齊缺少的部分！](${url})`,
    plannedTopic: (url) => `此主題已在規劃中，但尚未就緒。{br}[幫我們準備它的資料！](${url})`,
    incompleteCategory: (url) =>
      `此分類包含被標記為不完整的主題。{br}[幫我們補齊缺少的部分！](${url})`,
    plannedCategory: (url) =>
      `此分類包含尚未就緒的規劃中主題。{br}[幫我們準備它們的資料！](${url})`,
    plannedUnselectable: "規劃中的主題暫時無法選擇",
  },
  names: {
    form: { pref: "偏好", short: "短", long: "長", both: "兩者", all: "全部" },
    formLabel: (group) => `${group}的名稱形式`,
    formHint: {
      short: "優先使用簡稱",
      long: "優先使用全稱/正式名稱",
      both: "同時使用簡稱和全稱",
      pref: "僅使用主要標籤",
      all: "使用所有可用的寫法",
    },
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
    helpAdd: (url) => `；[幫我們補齊缺少的部分！](${url})`,
    tooShort: (n, minLen) => `最多 ${n} 個長度不足 ${minLen} 個字元的名稱`,
    tooShortHint: (omitted) =>
      omitted ? "開啟以仍然納入。" : "開啟以將其再次排除。",
    separatorIn: (n, sep, removing) =>
      `最多 ${n} 個${removing ? "{i}將會{/i}包含" : "包含"}所選分隔符號（{code}${sep}{/code}）的名稱`,
    separatorHint: (omitted, removing) =>
      omitted
        ? removing
          ? "開啟以保留它們，並去掉分隔符號。"
          : "開啟以仍然納入：skribbl.io 會在分隔符號處把它們各自拆開。"
        : removing
          ? "開啟以將其排除，而不是去掉分隔符號。"
          : "開啟以將其再次排除。",
  },
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
    notRecommended: "不太適合休閒繪圖：相對使用者數量而言知名度低得多。",
    toggle: (included) =>
      included ? "已選擇：已在清單中。取消勾選即可排除。" : "勾選即可加入清單。",
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
    unsupported: (language) => `${language}尚未確認，此主題可能不完整。`,
    fallback: "沒有翻譯時會使用英文。",
    usesEnglish: (primary, secondary) =>
      `${primary}${secondary}也官方使用英文名稱。`,
    variant: {
      romaji: "清單項目使用羅馬字",
      es419: "清單項目使用拉丁美洲西班牙文",
    },
    variantNote: { romaji: "長音以重複母音表示的平文式羅馬字（Moomoomiruku）。{br}不支援文字處理式羅馬字：它會與官方寫法衝突（是 Butterfree 而非 Batafurii），{br}而解決這個問題及其引發的後續問題目前超出了範圍。" },
    generatedRomaji:
      "這些羅馬字由日文名稱自動產生。若實際寫法不同，歡迎[告訴我們](https://github.com/Trummler12/custom-wordlists/issues/new)！",
    variantDiffers: (n) => `${n} 個項目的寫法不同`,
    variantShowList: "查看是哪些項目",
    panelTitle: "語言設定",
    slot: { primary: "主要：", interface: "介面：", fallback: "介面備用：" },
    slotHint: {
      primary: "清單項目的主要語言，也是其他大多數語言設定的預設值。",
      interface: "專用於介面的語言。",
      fallback: "在介面語言沒有翻譯的地方使用。{br}如果這裡也沒有，則使用英文。",
    },
    followPrimary: "{i}主要{/i}",
    showSecondaryBefore: "顯示使用", showSecondaryAfter: "項目的選項",
    showSecondaryHint:
      "例如，可以讓國家名稱使用你的母語，而影集角色的名稱使用你偏好的配音語言。",
    secondaryMoot: "只有在主要語言和次要語言不同時，這些開關才會出現。",
    flagType: "旗幟類型：",
    flagTypes: { country: "國家", mixed: "混合", linguistic: "語言" },
    useSecondary: (forced, secondary) =>
      forced ? "以所選語言使用此清單" : `使用此清單的${secondary}項目`,
    useSecondaryAll: (allForced, secondary) =>
      allForced ? "以所選語言使用這些清單" : `使用這些清單的${secondary}項目`,
  },
  settings: {
    label: "設定",
    reset: "重設{br}選擇設定",
    resetConfirm: "再次點擊以確認",
    resetCancel: "取消",
    outputSeparator: "輸出分隔符號：",
    outputSeparatorHint:
      "skribbl.io 只接受 {code},{/code} 作為分隔符號。其他分隔符號只改變複製的內容；輸出的顯示無論如何都一樣。",
    charLimits: "字元數限制：",
    minChars: "最少",
    maxChars: "最多",
    removeSeparator: (sep) => `去掉名稱中的 {code}${sep}{/code}`,
    charMaxOver: (gameMax) => `skribbl.io 每個名稱最多接受 ${gameMax} 個字元。`,
    scriptLimitsHint:
      "針對以該語言自身文字書寫的名稱的限制，這類文字中一個字元通常代表一個完整的音節或詞。羅馬字及其他拉丁字母名稱遵循通用限制。",
    showTopicsBefore: "顯示",
    showTopicsAfter: "主題",
    showTopicsKind: { incomplete: "不完整的", planned: "規劃中的", all: "所有" },
    showTopicsHint:
      "不完整的主題仍缺少項目。規劃中的主題已公布，但暫時無法選擇。",
  },
  output: {
    label: "結果",
    copy: "複製",
    copied: "已複製",
    copyFailed: "複製失敗",
    copyManual: "已選取清單，請手動複製。",
    empty: "選擇主題、分類或自訂清單即可產生輸出。",
    generatedList: "產生的單字清單",
    words: "單字",
    chars: "字元",
    belowMin: (min) => `· 低於 skribbl 最小數量（${min}）`,
    overMax: "· 超過上限",
    overLong: (count, maxLen) => `${count} 個單字超過 ${maxLen} 個字元`,
    splitting: (count, sep) => `${count} 個單字含有分隔符號「${sep}」（貼上時會被拆開）`,
  },
  footer: {
    repository: "GitHub 儲存庫",
    helpOut: "想幫助這個專案嗎？歡迎看看",
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
    noteLabelLister: "要新增完全未列出的語言，請前往你的 [Wikidata 設定](https://www.wikidata.org/wiki/Special:Preferences#mw-prefsection-gadgets)，在「小工具」分頁中啟用 {i}labelLister{/i} 小工具；之後每個項目會顯示「Labels list」（右上角「工具」下），可接受任意語言代碼。",
    noteProtected: "部分 Wikidata 項目受保護，需要註冊滿 4 天且編輯達 100 次以上的帳號才能修改。",
    noteStale: "此表基於手動傾印，因此這裡顯示的覆蓋率可能比 Wikidata 的最新狀態落後數週，甚至數月。",
    itemCount: (n) => `${n.toLocaleString()} 個項目`,
    uiOnly: "僅介面語言",
    uiOnlyHint: "原始資料傾印已經涵蓋 skribbl.io 支援的所有語言，{br}外加幾種使用者眾多的語言。{br}也就是說，資料其實已支援所有計畫中的語言，{br}而介面由我們維護者打理，自然明顯落後。{br}而且在幾乎沒有主題涵蓋某種語言時，{br}想新增該介面語言意義不大。{br}不過幫忙的人越多，新語言就能越早獲准！{br}=> 歡迎看看下方的 Contribution Guide！",
    item: "項目",
    numeric: { population: "人口", area: "面積 (km{smaller sup}2{/smaller sup})", users: "使用者", atomicNumber: "原子序", wikipedias: "維基百科數" },
    first: "第一頁",
    prev: "上一頁",
    next: "下一頁",
    last: "最後一頁",
    pageParts: (current, total) => ["", `第 ${current} 頁`, ` / 共 ${total} 頁`],
    loading: (topic) => `正在載入${topic}…`,
    loadError: (topic, message) => `無法載入${topic}的覆蓋資料：${message}`,
    pageJumpHint: (numeric) =>
      numeric
        ? `點擊：跳到某一頁、某個（英文）項目名稱或「${numeric}」中的某個值`
        : "點擊：跳到某一頁或某個（英文）項目名稱",
    pageJumpInput: "頁碼、數值或項目名稱",
    pageNoNumeric: "此表格沒有數值欄。",
  },
  tip: {
    unpin: "取消釘選",
  },
  custom: {
    title: "Custom",
    infoHint:
      "使用下方的輸入框加入你自己的單字清單。{br}" +
      "適用以下規則：{br}" +
      "- 所有項目用同一個分隔符號隔開，整個輸入保持一致。{br}" +
      "- 避免使用本身含有分隔符號的項目。{br}" +
      "- 每次內容變動時，出現最多的分隔符號會被自動辨識為分隔符號。{br}" +
      "- skribbl.io 會忽略標點、其他特殊字元以及首尾空格；其中一部分在這裡就已被清理。",
    separatorLabel: "分隔符號：",
    separatorPick: "分隔符號",
    internalDupes: (n) => `某個啟用的 Custom 清單內有 ${n} 個重複項目`,
    localDupes: (n) => `你啟用的 Custom 清單之間有 ${n} 個重複項目`,
    globalDupes: (n) => `與所選主題有 ${n} 個重複項目`,
    dupesNote: "重複項目在輸出中只保留一份。",
    dupesNoteSave: "清單內的重複項目在儲存時也會被移除。",
    dupesSamples: {
      internal: "清單內的重複項目：",
      local: "你啟用的 Custom 清單之間的重複項目：",
      global: "與所選主題的重複項目：",
    },
    fitToggle: "讓輸入框符合完整高度",
    fewerRows: "顯示較少列",
    moreRows: "顯示較多列",
    moreRowsOver: (steps) => `（比內容高度多 ${steps} 級）`,
    clearHint: "清空 Custom 輸入框",
    clearConfirm: "你即將清空 Custom 輸入框。",
    clearConfirmButton: "點擊此處確認",
    listsLabel: "已儲存的清單",
    listsTitle: "已儲存的 Custom 清單",
    listsInfo:
      "Custom 清單儲存在本機儲存空間中。{br}" +
      "每個瀏覽器都有自己的本機儲存空間，{br}" +
      "與其他瀏覽器或裝置互不相通。{br}" +
      "要把你的 Custom 清單帶到別處，{br}" +
      "請在這裡匯出，再在目的地匯入。{br}{br}" +
      "{b}重要{/b}：每次較大變更後請匯出清單，" +
      "並把匯出的檔案留作備份；瀏覽器的多種操作" +
      "都可能清除本機儲存空間，Safari 甚至會在網站" +
      "連續 7 天未被造訪後自動清除。",
    listActivate: "使用此清單",
    listRename: "重新命名",
    listSave: "將目前的輸入儲存到此清單",
    listLoad: "將此清單載入輸入框",
    listDelete: "刪除此清單",
    listUp: "上移",
    listDown: "下移",
    listSaveNew: "將目前的輸入另存為新清單",
    phActivate: "預留位置無法使用",
    phRename: "預留位置無法重新命名",
    phLoad: "預留位置無法載入",
    phDelete: "預留位置無法刪除",
    phMove: "預留位置無法移動",
    exportLabel: "匯出清單",
    exportTitle: "匯出已儲存的清單",
    selectAll: "全選",
    exportDownload: "下載",
    importLabel: "匯入清單",
    importTitle: "匯入已儲存的清單",
    importColName: "名稱",
    importColSize: "大小",
    importColDupes: "重複",
    importColWith: "對象",
    importButton: "匯入所選",
    importEmpty: "此檔案中沒有已儲存的清單。",
    importDupesSecondary: (pct) => `次要：${pct}`,
    listReplaceConfirm: (name) => `用目前的輸入取代清單「${name}」？`,
    listDeleteConfirm: (name) => `刪除清單「${name}」？`,
    listLoadConfirm: "用此清單覆寫輸入框？",
    confirm: "確認",
    cancel: "取消",
    charsLabel: "skribbl.io 很可能會忽略的字元",
    charsIgnored: "skribbl.io 很可能會忽略的字元：",
    charsProblematic: "有問題的字元：",
    charsTolerated: "可容許的字元：",
    charsRemove: "建議去掉這個字元。",
    charsLists: "受影響的清單：",
    inputName: "{i}輸入框{/i}",
    charsAccepted: "可接受的字元：",
    charsRemoveMaybe: "也許可以考慮去掉這個字元。",
    charsLone: (char, partner) => `單獨的 {code}${char}{/code}，沒有配對的 {code}${partner}{/code}；`,
    charsPaired: (open, close) => `作為一對 {code}${open}{/code}-{code}${close}{/code} 的一部分；`,
    cleanChars: "你的清單含有不常見的特殊字元，儲存時可以去掉：",
    cleanDupes: (n) => `你的清單內有 ${n} 個重複項目，儲存時會被移除：`,
    settingsLabel: "Custom 設定",
    settingsTitle: "Custom 設定",
    maxPreviewItems: "預覽最多項目數",
    maxPreviewChars: "預覽最多字元數",
    exampleListS: "範例清單 S",
    exampleListL: "範例清單 L",
    examplePreviewEmpty: "尚未載入任何主題名稱。",
  },
  sportType: {
    label: "要包含哪些運動項目",
  },
};
