import type { UIStrings } from "./index";

/** Japanese UI strings. Machine-written and unreviewed by a native speaker — see
 *  the proofreading note in CONTRIBUTING.md.
 *
 *  Japanese marks no plural, so the counters that other locales branch on read the
 *  same at one as at many — and the language name needs no article or ending, so
 *  the two halves of a display name are simply joined. */
export const ja: UIStrings = {
  header: {
    // The link sits between the two halves, and Japanese puts it first.
    taglineBefore: "",
    taglineAfter: "などの言葉当てゲーム用に、自分だけの単語リストを作りましょう。",
  },
  tree: {
    topics: "トピック",
    loading: "トピックを読み込んでいます…",
    loadError: (message) => `トピックを読み込めませんでした: ${message}`,
    empty: "利用できるトピックはまだありません。",
    toggle: (expanded, title) => `${title}を${expanded ? "折りたたむ" : "展開する"}`,
    loadingShort: "読み込み中…",
    wordsOf: (selected, total) => `${total}語中${selected}語`,
  },
  names: {
    form: { pref: "推奨", short: "短い", long: "長い", both: "両方", all: "すべて" },
    formLabel: (group) => `${group}の名前の形式`,
  },
  fame: {
    depthLabel: (group) => `${group}の知名度の深さ`,
    valueText: (depth, total) => `${total}段階中の上位${depth}段階`,
    groupsDefined: (count) => `定義済みの知名度グループ: ${count}`,
    none: "知名度グループはまだ定義されていません。フッターの Contribution Guide から提案できます。",
    selected: "選択中：",
    mostlySelected: "大半を選択中：",
    stored: (body) => `（保存済み：${body}）`,
    toggle: (shown) =>
      shown ? "このリストの知名度スライダーを隠す" : "このリストの知名度スライダーを表示する",
    toggleAll: (allShown) =>
      allShown ? "これらの知名度スライダーを隠す" : "これらの知名度スライダーを表示する",
  },
  omitted: {
    label: "このリストに含まれないもの",
    title: "このリストから除外:",
    toggle: (omitted) => (omitted ? "オンにしてリストに含める" : "オンにして除外する"),
    locked: "これらは単語ではなくゲームのデータなので、追加できません。",
    upTo: (n) => `最大${n}件`,
    unknown: (n, primary, secondary) =>
      `元データに${primary}${secondary}の名前がない項目が最大${n}件`,
    unknownHint: (omitted) =>
      omitted
        ? "オンにすると、唯一分かっている英語名で含めます。"
        : "オンにすると、再び除外します。",
    unknownTier: (tier, n) => `第${tier}段階: ${n}件`,
    tooLong: (n, maxLen) => `${maxLen}文字を超える名前が最大${n}件`,
    tooLongHint: (omitted) =>
      omitted
        ? "オンにすると、それでも含めます。skribbl.io は受け付けませんが、他のゲームなら通るかもしれません。"
        : "オンにすると、再び除外します。",
  },
  coverage: {
    label: "Geoguessr / ストリートビューの対応",
    all: "すべての国",
    withCoverage: "公式対応あり",
    reliable: "十分な対応のみ",
  },
  languageType: {
    label: "含める言語の種類",
    base: "現代の生きた言語",
    submillion: "利用者100万人未満の言語も含める",
    notRecommended: "カジュアルなお絵描きには不向き — 話者数の割に知名度が低い。",
    toggle: (included) =>
      included ? "選択中 — リストに含まれています。外すと除外します。" : "チェックするとリストに追加します。",
  },
  sovereignty: {
    label: "主権と承認",
    wiki: "https://ja.wikipedia.org/wiki/国家承認を得た国連非加盟の国と地域の一覧",
    axisRow: "法律上",
    axisCol: "事実上",
    cols: ["完全独立", "部分的自治"],
    rows: ["普遍的承認", "広範な承認", "部分的承認", "未承認"],
    colDefs: [
      "国境・司法・軍隊・徴税を自ら管理する。",
      "独自の法律と議会を持つが、通貨・防衛・外交などの中核権限は他国と共有する。",
    ],
    rowDefs: [
      "国連加盟国で、ほぼ全ての国に承認されている。",
      "多くの国連加盟国に承認されているが、一部に反対がある。",
      "少数の国にしか承認されていないが、事実上・認識上の存在感は大きいことが多い。",
      "国際的に他の主権国家の一部と見なされている。",
    ],
    regular: "通常の国家",
  },
  language: {
    label: (current) => `言語: ${current}`,
    menu: "言語",
    unsupported: (language) => `${language}はまだ未確認です。このトピックは不完全かもしれません。`,
    fallback: "翻訳がない場合は英語が使われます。",
    usesEnglish: (primary, secondary) =>
      `${primary}${secondary}でも公式に英語の名前が使われています。`,
    variant: {
      romaji: "リストの項目にローマ字を使う",
      es419: "リストの項目にラテンアメリカのスペイン語を使う",
    },
    variantNote: { romaji: "長音を母音の重ねで表すヘボン式（Moomoomiruku）。{br}ワープロローマ字は非対応です。公式表記を上書きしてしまうため — Batafurii ではなく Butterfree。" },
    generatedRomaji:
      "このローマ字は日本語名から自動生成したものです。実際の表記と違う場合は[お知らせください](https://github.com/Trummler12/custom-wordlists/issues/new)。",
    variantDiffers: (n) => `${n}件の項目が異なる表記です`,
    variantShowList: "どの項目か見る",
    useEnglish: (forced) =>
      forced ? "このリストを選択した言語で表示する" : "このリストの英語の項目を使う",
    useEnglishAll: (allForced) =>
      allForced ? "これらのリストを選択した言語で表示する" : "これらのリストの英語の項目を使う",
  },
  settings: {
    label: "設定",
    showEnglish: "英語の項目を使う選択肢を表示する",
    showEnglishEn: "このスイッチは英語以外の言語でのみ表示されます。",
    interfaceLang: "表示言語:",
    interfaceAuto: "自動",
    reset: "設定を{br}リセット",
    resetConfirm: "もう一度クリックで確定",
    resetCancel: "キャンセル",
  },
  output: {
    label: "出力",
    copy: "コピー",
    copied: "コピーしました",
    copyFailed: "コピーできませんでした",
    copyManual: "リストを選択しました。手動でコピーしてください。",
    empty: "トピックまたはグループを選ぶとリストができます。",
    generatedList: "生成された単語リスト",
    words: "単語",
    chars: "文字",
    belowMin: (min) => `· skribbl の最小数(${min})未満`,
    overMax: "· 上限超過",
    overLong: (count, maxLen) => `${maxLen}文字を超える単語が${count}件`,
  },
  footer: {
    repository: "GitHub リポジトリ",
    helpOut: "プロジェクトを手伝いませんか？",
    // The guide itself is English only, so the link keeps its name.
    contributionGuide: "Contribution Guide",
    helpOutAfter: "をご覧ください。",
  },
  coveragePage: {
    home: "メインアプリへ",
    topicLabel: "トピック：",
    uiLanguage: "表示言語",
    title: "言語カバレッジ",
    intro: "トピックを選ぶと、各項目についてWikidataがどの言語のラベルを持っているかを確認できます。",
    itemCount: (n) => `${n.toLocaleString()} 項目`,
    item: "項目",
    numeric: { population: "人口", area: "面積 (km²)", users: "使用者数" },
    prev: "前へ",
    next: "次へ",
    page: (current, total) => `${total} ページ中 ${current} ページ`,
    loading: (topic) => `${topic}を読み込み中…`,
    loadError: (topic, message) => `${topic}のカバレッジを読み込めませんでした：${message}`,
  },
};
