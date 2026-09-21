import type { UIStrings } from "./index";
import { en } from "./en";

/** Simplified Chinese UI strings. Machine-written and unreviewed by a native speaker —
 *  see the proofreading note in CONTRIBUTING.md.
 *
 *  Chinese marks no plural, so the counters that other locales branch on read the same
 *  at one as at many — and a name needs no article or ending, so the two halves of a
 *  display name are simply joined. */
export const zhHans: UIStrings = {
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
  },
  names: {
    form: { pref: "推荐", short: "短", long: "长", both: "两者", all: "全部" },
    formLabel: (group) => `${group}的名称形式`,
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
    helpAdd: (url) => ` — [帮我们补全缺失的部分！](${url})`,
  },
  // custom: English stopgap until the UI-language PR translates it (§X).
  custom: en.custom,
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
    notRecommended: "不太适合休闲绘画 — 相对使用者数量而言知名度低得多。",
    toggle: (included) =>
      included ? "已选择 — 已在列表中。取消勾选即可排除。" : "勾选即可加入列表。",
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
    menu: "语言",
    unsupported: (language) => `${language}尚未确认，此主题可能不完整。`,
    fallback: "没有翻译时会使用英语。",
    usesEnglish: (primary, secondary) =>
      `${primary}${secondary}也官方使用英语名称。`,
    variant: {
      romaji: "列表条目使用罗马字",
      es419: "列表条目使用拉丁美洲西班牙语",
    },
    variantNote: { romaji: "长音以重复元音表示的平文式罗马字（Moomoomiruku）。{br}不提供文字处理式罗马字，因为它会覆盖官方写法 — 是 Butterfree 而非 Batafurii。" },
    generatedRomaji:
      "这些罗马字由日语名称自动生成。若实际写法不同，请[告诉我们](https://github.com/Trummler12/custom-wordlists/issues/new)。",
    variantDiffers: (n) => `${n} 个条目的写法不同`,
    variantShowList: "查看是哪些条目",
    useEnglish: (forced) =>
      forced ? "以所选语言显示此列表" : "使用此列表的英语条目",
    useEnglishAll: (allForced) =>
      allForced ? "以所选语言显示这些列表" : "使用这些列表的英语条目",
  },
  settings: {
    label: "设置",
    showEnglish: "显示使用英语条目的选项",
    showEnglishEn: "此开关仅在非英语语言下出现。",
    interfaceLang: "界面语言：",
    interfaceAuto: "自动",
    reset: "重置{br}设置",
    resetConfirm: "再次点击以确认",
    resetCancel: "取消",
  },
  output: {
    label: "结果",
    copy: "复制",
    copied: "已复制",
    copyFailed: "复制失败",
    copyManual: "已选中列表，请手动复制。",
    empty: "选择主题或分组即可生成列表。",
    generatedList: "生成的单词列表",
    words: "单词",
    chars: "字符",
    belowMin: (min) => `· 低于 skribbl 最小数量（${min}）`,
    overMax: "· 超过上限",
    overLong: (count, maxLen) => `${count} 个单词超过 ${maxLen} 个字符`,
  },
  footer: {
    repository: "GitHub 仓库",
    helpOut: "想帮助这个项目吗？请看看",
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
    noteLabelLister: "要添加完全未列出的语言，请在你的 [Wikidata 设置](https://www.wikidata.org/wiki/Special:Preferences#mw-prefsection-gadgets)中的“小工具”里启用 labelLister 小工具；之后每个条目会显示“Labels list”（右上角“工具”下），可接受任意语言代码。",
    noteProtected: "部分 Wikidata 条目受保护，需要注册满 4 天且编辑达 100 次以上的账户才能修改。",
    noteStale: "此表基于手动转储，因此这里显示的覆盖率可能比 Wikidata 的最新状态落后最多数周。",
    itemCount: (n) => `${n.toLocaleString()} 个条目`,
    uiOnly: "仅界面语言",
    uiOnlyHint: "原始数据转储已经涵盖 skribbl.io 支持的所有语言，{br}外加几种用户众多的语言。{br}也就是说，数据其实已支持所有计划中的语言，{br}而界面由我们维护者打理，自然明显滞后。{br}而且在几乎没有主题覆盖某种语言时，{br}想新增该界面语言意义不大。{br}不过帮忙的人越多，新语言就能越早获批！{br}=> 欢迎看看下方的 Contribution Guide！",
    item: "条目",
    numeric: { population: "人口", area: "面积 (km²)", users: "使用者" },
    first: "第一页",
    prev: "上一页",
    next: "下一页",
    last: "最后一页",
    page: (current, total) => `第 ${current} 页 / 共 ${total} 页`,
    loading: (topic) => `正在加载${topic}…`,
    loadError: (topic, message) => `无法加载${topic}的覆盖数据：${message}`,
  },
};
