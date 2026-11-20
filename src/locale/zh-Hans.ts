import type { LocaleDict } from "./index";

/** Simplified Chinese UI strings. Machine-written and unreviewed by a native speaker —
 *  see the proofreading note in CONTRIBUTING.md.
 *
 *  Chinese marks no plural, so the counters that other locales branch on read the same
 *  at one as at many — and a name needs no article or ending, so the two halves of a
 *  display name are simply joined. */
export const zhHans: LocaleDict = {
  header: {
    // The link sits between the two halves, and Chinese puts it first.
    taglineBefore: "",
    taglineAfter: "等类似猜词游戏，创建你专属的单词列表。",
  },
  tree: {
    topics: "主题",
    loading: "正在加载主题…",
    loadError: (message) => `无法加载主题：${message}`,
    empty: "暂时没有可用的主题。",
    toggle: (expanded, title) => `${expanded ? "折叠" : "展开"}${title}`,
    loadingShort: "加载中…",
    wordsOf: (selected, total) => `${total} 个单词中的 ${selected} 个`,
    duplicatesRemoved: (count) => `已移除 ${count} 个重复项`,
    incompleteTopic: (url) => `此主题被标记为不完整。{br}[帮我们补全缺失的部分！](${url})`,
    plannedTopic: (url) => `此主题已在计划中，但尚未就绪。{br}[帮我们准备它的数据！](${url})`,
    incompleteCategory: (url) =>
      `此分类包含被标记为不完整的主题。{br}[帮我们补全缺失的部分！](${url})`,
    plannedCategory: (url) =>
      `此分类包含尚未就绪的计划中主题。{br}[帮我们准备它们的数据！](${url})`,
    plannedUnselectable: "计划中的主题暂时无法选择",
  },
  names: {
    form: { pref: "推荐", short: "短", long: "长", both: "两者", all: "全部" },
    formLabel: (group) => `${group}的名称形式`,
    formHint: {
      short: "优先使用简称",
      long: "优先使用全称/正式名称",
      both: "同时使用简称和全称",
      pref: "仅使用主要标签",
      all: "使用所有可用的写法",
    },
  },
  fame: {
    depthLabel: (group) => `${group}的知名度深度`,
    valueText: (depth, total) => `${total} 级中的前 ${depth} 级`,
    groupsDefined: (count) => `已定义的知名度分组：${count}`,
    none: "尚未定义知名度分组。可通过页脚的 Contribution Guide 提出建议。",
    selected: "已选择：",
    mostlySelected: "大部分已选择：",
    stored: (body) => `（已保存：${body}）`,
    toggle: (shown) =>
      shown ? "隐藏此列表的知名度滑块" : "显示此列表的知名度滑块",
    toggleAll: (allShown) =>
      allShown ? "隐藏这些知名度滑块" : "显示这些知名度滑块",
  },
  omitted: {
    label: "此列表未包含的内容",
    title: "已从此列表排除：",
    toggle: (omitted) => (omitted ? "打开以将其纳入列表" : "打开以将其排除"),
    locked: "这些是游戏数据而非单词，无法添加。",
    upTo: (n) => `最多 ${n} 个`,
    unknown: (n, primary, secondary) =>
      `源数据中最多有 ${n} 个条目没有${primary}${secondary}名称`,
    unknownHint: (omitted) =>
      omitted
        ? "打开以用它们唯一已知的英语名称纳入。"
        : "打开以将其再次排除。",
    unknownTier: (tier, n) => `第 ${tier} 级：${n} 个`,
    tooLong: (n, maxLen) => `最多 ${n} 个长度超过 ${maxLen} 个字符的名称`,
    tooLongHint: (omitted) =>
      omitted
        ? "打开以仍然纳入。skribbl.io 不接受，但其他游戏或许可以。"
        : "打开以将其再次排除。",
    helpAdd: (url) => `；[帮我们补全缺失的部分！](${url})`,
    tooShort: (n, minLen) => `最多 ${n} 个长度不足 ${minLen} 个字符的名称`,
    tooShortHint: (omitted) =>
      omitted ? "打开以仍然纳入。" : "打开以将其再次排除。",
    separatorIn: (n, sep, removing) =>
      `最多 ${n} 个${removing ? "{i}将会{/i}包含" : "包含"}所选分隔符（{code}${sep}{/code}）的名称`,
    separatorHint: (omitted, removing) =>
      omitted
        ? removing
          ? "打开以保留它们，并去掉分隔符。"
          : "打开以仍然纳入：skribbl.io 会在分隔符处把它们各自拆开。"
        : removing
          ? "打开以将其排除，而不是去掉分隔符。"
          : "打开以将其再次排除。",
  },
  coverage: {
    label: "Geoguessr / 街景覆盖",
    all: "所有国家",
    withCoverage: "有官方覆盖",
    reliable: "仅可靠覆盖",
  },
  languageType: {
    label: "包含哪些语言类型",
    base: "现代在用语言",
    submillion: "也包含使用者不足 100 万的语言",
    notRecommended: "不太适合休闲绘画：相对使用者数量而言知名度低得多。",
    toggle: (included) =>
      included ? "已选择：已在列表中。取消勾选即可排除。" : "勾选即可加入列表。",
  },
  sovereignty: {
    label: "主权与承认",
    wiki: "https://zh.wikipedia.org/wiki/有限承认国家列表",
    axisRow: "法理上",
    axisCol: "事实上",
    cols: ["完全独立", "部分自治"],
    rows: ["普遍承认", "广泛承认", "部分承认", "未获承认"],
    colDefs: [
      "自行掌管边界、司法、军队与税收。",
      "拥有自己的法律与议会，但货币、国防、外交等核心权限与另一国共享。",
    ],
    rowDefs: [
      "联合国会员国，几乎所有国家都予以承认。",
      "获多数联合国会员国承认，但存在部分反对。",
      "仅少数国家承认，但通常在事实上或认知上存在感很强。",
      "在国际上被视为另一主权国家的一部分。",
    ],
    regular: "常规国家",
  },
  language: {
    label: (current) => `语言：${current}`,
    unsupported: (language) => `${language}尚未确认，此主题可能不完整。`,
    fallback: "没有翻译时会使用英语。",
    usesEnglish: (primary, secondary) =>
      `${primary}${secondary}也官方使用英语名称。`,
    variant: {
      romaji: "列表条目使用罗马字",
      es419: "列表条目使用拉丁美洲西班牙语",
    },
    variantNote: { romaji: "长音以重复元音表示的平文式罗马字（Moomoomiruku）。{br}不支持文字处理式罗马字：它会与官方写法冲突（是 Butterfree 而非 Batafurii），{br}而解决这一问题及其引发的后续问题目前超出了范围。" },
    generatedRomaji:
      "这些罗马字由日语名称自动生成。若实际写法不同，欢迎[告诉我们](https://github.com/Trummler12/custom-wordlists/issues/new)！",
    variantDiffers: (n) => `${n} 个条目的写法不同`,
    variantShowList: "查看是哪些条目",
    panelTitle: "语言设置",
    slot: { primary: "主要：", interface: "界面：", fallback: "界面备用：" },
    slotHint: {
      primary: "列表条目的主要语言，也是其他大多数语言设置的默认值。",
      interface: "专用于界面的语言。",
      fallback: "在界面语言没有翻译的地方使用。{br}如果这里也没有，则使用英语。",
    },
    followPrimary: "{i}主要{/i}",
    showSecondaryBefore: "显示使用", showSecondaryAfter: "条目的选项",
    showSecondaryHint:
      "例如，可以让国家名称使用你的母语，而剧集角色的名称使用你偏好的配音语言。",
    secondaryMoot: "只有在主要语言和次要语言不同时，这些开关才会出现。",
    flagType: "旗帜类型：",
    flagTypes: { country: "国家", mixed: "混合", linguistic: "语言" },
    useSecondary: (forced, secondary) =>
      forced ? "以所选语言使用此列表" : `使用此列表的${secondary}条目`,
    useSecondaryAll: (allForced, secondary) =>
      allForced ? "以所选语言使用这些列表" : `使用这些列表的${secondary}条目`,
  },
  settings: {
    label: "设置",
    reset: "重置{br}选择设置",
    resetConfirm: "再次点击以确认",
    resetCancel: "取消",
    outputSeparator: "输出分隔符：",
    outputSeparatorHint:
      "skribbl.io 只接受 {code},{/code} 作为分隔符。其他分隔符只改变复制的内容；输出的显示无论如何都一样。",
    charLimits: "字符数限制：",
    minChars: "最少",
    maxChars: "最多",
    removeSeparator: (sep) => `去掉名称中的 {code}${sep}{/code}`,
    charMaxOver: (gameMax) => `skribbl.io 每个名称最多接受 ${gameMax} 个字符。`,
    scriptLimitsHint:
      "针对以该语言自身文字书写的名称的限制，这类文字中一个字符通常代表一个完整的音节或词。罗马字及其他拉丁字母名称遵循通用限制。",
    showTopicsBefore: "显示",
    showTopicsAfter: "主题",
    showTopicsKind: { incomplete: "不完整的", planned: "计划中的", all: "所有" },
    showTopicsHint:
      "不完整的主题仍缺少条目。计划中的主题已公布，但暂时无法选择。",
  },
  output: {
    label: "结果",
    copy: "复制",
    copied: "已复制",
    copyFailed: "复制失败",
    copyManual: "已选中列表，请手动复制。",
    empty: "选择主题、分类或自定义列表即可生成输出。",
    generatedList: "生成的单词列表",
    words: "单词",
    chars: "字符",
    belowMin: (min) => `· 低于 skribbl 最小数量（${min}）`,
    overMax: "· 超过上限",
    overLong: (count, maxLen) => `${count} 个单词超过 ${maxLen} 个字符`,
    splitting: (count, sep) => `${count} 个单词含有分隔符“${sep}”（粘贴时会被拆开）`,
  },
  footer: {
    repository: "GitHub 仓库",
    helpOut: "想帮助这个项目吗？欢迎看看",
    // The guide itself is English only, so the link keeps its name.
    contributionGuide: "Contribution Guide",
    helpOutAfter: "。",
  },
  coveragePage: {
    home: "前往主应用",
    topicLabel: "主题：",
    uiLanguage: "界面语言",
    title: "语言覆盖",
    intro: "选择一个主题，查看每个条目在 Wikidata 上已有哪些语言的标签。",
    lead: "此主题的内容来自 [Wikidata](https://www.wikidata.org/wiki/Wikidata:Main_Page)。下表显示每个条目已拥有哪些语言的标签。",
    notesTitle: "如何帮忙",
    noteAdd: "从第一列打开一个条目，登录后补充你确定的缺失标签。",
    noteLabelLister: "要添加完全未列出的语言，请前往你的 [Wikidata 设置](https://www.wikidata.org/wiki/Special:Preferences#mw-prefsection-gadgets)，在“小工具”标签页中启用 {i}labelLister{/i} 小工具；之后每个条目会显示“Labels list”（右上角“工具”下），可接受任意语言代码。",
    noteProtected: "部分 Wikidata 条目受保护，需要注册满 4 天且编辑达 100 次以上的账户才能修改。",
    noteStale: "此表基于手动转储，因此这里显示的覆盖率可能比 Wikidata 的最新状态落后数周，甚至数月。",
    itemCount: (n) => `${n.toLocaleString()} 个条目`,
    uiOnly: "仅界面语言",
    uiOnlyHint: "原始数据转储已经涵盖 skribbl.io 支持的所有语言，{br}外加几种用户众多的语言。{br}也就是说，数据其实已支持所有计划中的语言，{br}而界面由我们维护者打理，自然明显滞后。{br}而且在几乎没有主题覆盖某种语言时，{br}想新增该界面语言意义不大。{br}不过帮忙的人越多，新语言就能越早获批！{br}=> 欢迎看看下方的 Contribution Guide！",
    item: "条目",
    numeric: { population: "人口", area: "面积 (km{smaller sup}2{/smaller sup})", users: "使用者", atomicNumber: "原子序数", wikipedias: "维基百科数" },
    first: "第一页",
    prev: "上一页",
    next: "下一页",
    last: "最后一页",
    pageParts: (current, total) => ["", `第 ${current} 页`, ` / 共 ${total} 页`],
    loading: (topic) => `正在加载${topic}…`,
    loadError: (topic, message) => `无法加载${topic}的覆盖数据：${message}`,
    pageJumpHint: (numeric) =>
      numeric
        ? `点击：跳转到某一页、某个（英文）条目名称或“${numeric}”中的某个值`
        : "点击：跳转到某一页或某个（英文）条目名称",
    pageJumpInput: "页码、数值或条目名称",
    pageNoNumeric: "此表格没有数值列。",
  },
  tip: {
    unpin: "取消固定",
  },
  custom: {
    title: "Custom",
    infoHint:
      "使用下方的输入框添加你自己的单词列表。{br}" +
      "适用以下规则：{br}" +
      "- 所有条目用同一个分隔符隔开，整个输入保持一致。{br}" +
      "- 避免使用本身含有分隔符的条目。{br}" +
      "- 每次内容变动时，出现最多的分隔符会被自动识别为分隔符。{br}" +
      "- skribbl.io 会忽略标点、其他特殊字符以及首尾空格；其中一部分在这里就已被清理。",
    separatorLabel: "分隔符：",
    separatorPick: "分隔符",
    internalDupes: (n) => `某个启用的 Custom 列表内有 ${n} 个重复条目`,
    localDupes: (n) => `你启用的 Custom 列表之间有 ${n} 个重复项`,
    globalDupes: (n) => `与所选主题有 ${n} 个重复项`,
    dupesNote: "重复项在输出中只保留一份。",
    dupesNoteSave: "列表内的重复项在保存时也会被移除。",
    dupesSamples: {
      internal: "列表内的重复项：",
      local: "你启用的 Custom 列表之间的重复项：",
      global: "与所选主题的重复项：",
    },
    fitToggle: "让输入框适应完整高度",
    fewerRows: "显示更少行",
    moreRows: "显示更多行",
    moreRowsOver: (steps) => `（比内容高度多 ${steps} 档）`,
    clearHint: "清空 Custom 输入框",
    clearConfirm: "你即将清空 Custom 输入框。",
    clearConfirmButton: "点击此处确认",
    listsLabel: "已保存的列表",
    listsTitle: "已保存的 Custom 列表",
    listsInfo:
      "Custom 列表保存在本地存储中。{br}" +
      "每个浏览器都有自己的本地存储，{br}" +
      "与其他浏览器或设备互不相通。{br}" +
      "要把你的 Custom 列表带到别处，{br}" +
      "请在这里导出，再在目标位置导入。{br}{br}" +
      "{b}重要{/b}：每次较大改动后请导出列表，" +
      "并把导出的文件留作备份；浏览器的多种操作" +
      "都可能清除本地存储，Safari 甚至会在网站" +
      "连续 7 天未被访问后自动清除。",
    listActivate: "使用此列表",
    listRename: "重命名",
    listSave: "将当前输入保存到此列表",
    listLoad: "将此列表载入输入框",
    listDelete: "删除此列表",
    listUp: "上移",
    listDown: "下移",
    listSaveNew: "将当前输入另存为新列表",
    phActivate: "占位项无法使用",
    phRename: "占位项无法重命名",
    phLoad: "占位项无法载入",
    phDelete: "占位项无法删除",
    phMove: "占位项无法移动",
    exportLabel: "导出列表",
    exportTitle: "导出已保存的列表",
    selectAll: "全选",
    exportDownload: "下载",
    importLabel: "导入列表",
    importTitle: "导入已保存的列表",
    importColName: "名称",
    importColSize: "大小",
    importColDupes: "重复",
    importColWith: "对象",
    importButton: "导入所选",
    importEmpty: "此文件中没有已保存的列表。",
    importDupesSecondary: (pct) => `次要：${pct}`,
    listReplaceConfirm: (name) => `用当前输入替换列表“${name}”？`,
    listDeleteConfirm: (name) => `删除列表“${name}”？`,
    listLoadConfirm: "用此列表覆盖输入框？",
    confirm: "确认",
    cancel: "取消",
    charsLabel: "skribbl.io 很可能会忽略的字符",
    charsIgnored: "skribbl.io 很可能会忽略的字符：",
    charsProblematic: "有问题的字符：",
    charsTolerated: "可容许的字符：",
    charsRemove: "建议去掉这个字符。",
    charsLists: "受影响的列表：",
    inputName: "{i}输入框{/i}",
    charsAccepted: "可接受的字符：",
    charsRemoveMaybe: "也许可以考虑去掉这个字符。",
    charsLone: (char, partner) => `单独的 {code}${char}{/code}，没有配对的 {code}${partner}{/code}；`,
    charsPaired: (open, close) => `作为一对 {code}${open}{/code}-{code}${close}{/code} 的一部分；`,
    cleanChars: "你的列表含有不常见的特殊字符，保存时可以去掉：",
    cleanDupes: (n) => `你的列表内有 ${n} 个重复项，保存时会被移除：`,
    settingsLabel: "Custom 设置",
    settingsTitle: "Custom 设置",
    maxPreviewItems: "预览最多条目数",
    maxPreviewChars: "预览最多字符数",
    exampleListS: "示例列表 S",
    exampleListL: "示例列表 L",
    examplePreviewEmpty: "尚未载入任何主题名称。",
  },
  sportType: {
    label: "要包含哪些运动项目",
  },
};
