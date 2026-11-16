import type { LocaleDict } from "./index";

/** Japanese UI strings. Machine-written and unreviewed by a native speaker — see
 *  the proofreading note in CONTRIBUTING.md.
 *
 *  Japanese marks no plural, so the counters that other locales branch on read the
 *  same at one as at many — and the language name needs no article or ending, so
 *  the two halves of a display name are simply joined. */
export const ja: LocaleDict = {
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
    duplicatesRemoved: (count) => `重複${count}件を削除しました`,
    incompleteTopic: (url) => `このトピックは未完成とされています。{br}[不足分の追加にご協力ください](${url})`,
    plannedTopic: (url) => `このトピックは予定されていますが、まだ準備ができていません。{br}[データの準備にご協力ください](${url})`,
    incompleteCategory: (url) =>
      `このカテゴリには未完成とされているトピックが含まれています。{br}[不足分の追加にご協力ください](${url})`,
    plannedCategory: (url) =>
      `このカテゴリには、まだ準備ができていない予定のトピックが含まれています。{br}[データの準備にご協力ください](${url})`,
    plannedUnselectable: "予定のトピックはまだ選択できません",
  },
  names: {
    form: { pref: "推奨", short: "短い", long: "長い", both: "両方", all: "すべて" },
    formLabel: (group) => `${group}の名前の形式`,
    formHint: {
      short: "短い名前を優先する",
      long: "正式名称・フルネームを優先する",
      both: "短い名前と正式名称の両方を使う",
      pref: "主要なラベルだけを使う",
      all: "利用できるすべての表記を使う",
    },
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
    helpAdd: (url) => `（[不足分の追加にご協力ください](${url})）`,
    tooShort: (n, minLen) => `${minLen}文字未満の名前が最大${n}件`,
    tooShortHint: (omitted) =>
      omitted ? "オンにすると、それでも含めます。" : "オンにすると、再び除外します。",
    separatorIn: (n, sep, removing) =>
      `選択した区切り文字（{code}${sep}{/code}）を${removing ? "{i}含むことになる{/i}" : "含む"}名前が最大${n}件`,
    separatorHint: (omitted, removing) =>
      omitted
        ? removing
          ? "オンにすると、区切り文字を取り除いたうえで残します。"
          : "オンにすると、それでも含めます。skribbl.io は区切り文字の位置でそれぞれを分割します。"
        : removing
          ? "オンにすると、区切り文字を取り除く代わりに除外します。"
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
    notRecommended: "カジュアルなお絵描きには不向き：話者数の割に知名度が低い。",
    toggle: (included) =>
      included ? "選択中：リストに含まれています。外すと除外します。" : "チェックするとリストに追加します。",
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
    unsupported: (language) => `${language}はまだ未確認です。このトピックは不完全かもしれません。`,
    fallback: "翻訳がない場合は英語が使われます。",
    usesEnglish: (primary, secondary) =>
      `${primary}${secondary}でも公式に英語の名前が使われています。`,
    variant: {
      romaji: "リストの項目にローマ字を使う",
      es419: "リストの項目にラテンアメリカのスペイン語を使う",
    },
    variantNote: { romaji: "長音を母音の重ねで表すヘボン式（Moomoomiruku）。{br}ワープロローマ字には対応していません。公式表記（Batafurii ではなく Butterfree）と衝突するためです。{br}この問題と、そこから生じる問題の解決は、現時点では対象外です。" },
    generatedRomaji:
      "このローマ字は日本語名から自動生成したものです。実際の表記と違う場合は、お気軽に[お知らせください](https://github.com/Trummler12/custom-wordlists/issues/new)！",
    variantDiffers: (n) => `${n}件の項目が異なる表記です`,
    variantShowList: "どの項目か見る",
    panelTitle: "言語設定",
    slot: { primary: "メイン：", interface: "表示言語：", fallback: "表示の予備：" },
    slotHint: {
      primary: "リスト項目のメイン言語で、ほかの言語設定の多くの既定値にもなります。",
      interface: "画面表示に使う言語です。",
      fallback: "表示言語に翻訳がない箇所で使われます。{br}ここにもない場合は英語が使われます。",
    },
    followPrimary: "{i}メイン{/i}",
    showSecondaryBefore: "", showSecondaryAfter: "の項目を使う選択肢を表示する",
    showSecondaryHint:
      "たとえば国名は母語で、シリーズのキャラクター名はお好みの吹き替え言語で使えるようになります。",
    secondaryMoot: "このスイッチは、メイン言語と第2言語が異なる場合にのみ表示されます。",
    flagType: "旗の種類：",
    flagTypes: { country: "国", mixed: "混合", linguistic: "言語" },
    useSecondary: (forced, secondary) =>
      forced ? "このリストを選択した言語で表示する" : `このリストの${secondary}の項目を使う`,
    useSecondaryAll: (allForced, secondary) =>
      allForced ? "これらのリストを選択した言語で表示する" : `これらのリストの${secondary}の項目を使う`,
  },
  settings: {
    label: "設定",
    reset: "選択設定を{br}リセット",
    resetConfirm: "もう一度クリックで確定",
    resetCancel: "キャンセル",
    outputSeparator: "出力の区切り文字：",
    outputSeparatorHint:
      "skribbl.io が区切り文字として受け付けるのは {code},{/code} だけです。ほかの区切り文字はコピーされる内容を変えるだけで、出力の表示はどれでも同じです。",
    charLimits: "文字数制限：",
    minChars: "最小",
    maxChars: "最大",
    removeSeparator: (sep) => `名前に含まれる {code}${sep}{/code} を取り除く`,
    charMaxOver: (gameMax) => `skribbl.io が受け付けるのは1つの名前につき最大${gameMax}文字です。`,
    scriptLimitsHint:
      "この言語固有の文字で書かれた名前の制限です。1文字が音節や単語全体を表すことが多いためです。ローマ字などラテン文字の名前には全般の制限が適用されます。",
    showTopicsBefore: "",
    showTopicsAfter: "トピックを表示",
    showTopicsKind: { incomplete: "未完成の", planned: "予定の", all: "すべての" },
    showTopicsHint:
      "未完成のトピックにはまだ足りない項目があります。予定のトピックは告知済みですが、まだ選択できません。",
  },
  output: {
    label: "出力",
    copy: "コピー",
    copied: "コピーしました",
    copyFailed: "コピーできませんでした",
    copyManual: "リストを選択しました。手動でコピーしてください。",
    empty: "トピック、カテゴリ、またはカスタムリストを選ぶと出力が生成されます。",
    generatedList: "生成された単語リスト",
    words: "単語",
    chars: "文字",
    belowMin: (min) => `· skribbl の最小数(${min})未満`,
    overMax: "· 上限超過",
    overLong: (count, maxLen) => `${maxLen}文字を超える単語が${count}件`,
    splitting: (count, sep) => `区切り文字「${sep}」を含む単語が${count}件（貼り付け時に分割されます）`,
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
    lead: "このトピックの内容は[Wikidata](https://www.wikidata.org/wiki/Wikidata:Main_Page)に由来します。表は各項目がどの言語のラベルをすでに持っているかを示します。",
    notesTitle: "協力する方法",
    noteAdd: "最初の列から項目を開き、ログインのうえ、確信のある不足ラベルを追加してください。",
    noteLabelLister: "まったく掲載されていない言語を追加するには、[Wikidataの設定](https://www.wikidata.org/wiki/Special:Preferences#mw-prefsection-gadgets)を開き、「ガジェット」タブで{i}labelLister{/i}ガジェットを有効にしてください。すると各項目に「Labels list」（右上の「ツール」内）が表示され、任意の言語コードを受け付けます。",
    noteProtected: "一部のWikidata項目は保護されており、編集には作成から4日以上・100回以上編集したアカウントが必要です。",
    noteStale: "この表は手動ダンプに基づくため、ここに表示されるカバレッジはWikidataの最新状態より数週間、場合によっては数か月遅れることがあります。",
    itemCount: (n) => `${n.toLocaleString()} 項目`,
    uiOnly: "UI言語のみ",
    uiOnlyHint: "生データのダンプには、skribbl.io が対応するすべての言語に加え、{br}利用者の多い言語もいくつか含まれています。{br}つまりデータはすでにすべての計画言語に対応していますが、{br}インターフェースは私たちメンテナーが手入れしているため、当然ながら大きく遅れています。{br}また、その言語を扱うトピックがまだほとんどない状態で{br}新しい UI 言語を増やそうとしても、あまり意味がありません。{br}ただし協力者が増えるほど、新しい言語が早く承認されます！{br}=> よければ下の Contribution Guide をご覧ください！",
    item: "項目",
    numeric: { population: "人口", area: "面積 (km{smaller sup}2{/smaller sup})", users: "使用者数", atomicNumber: "原子番号", wikipedias: "ウィキペディア数" },
    first: "最初のページ",
    prev: "前のページ",
    next: "次のページ",
    last: "最後のページ",
    pageParts: (current, total) => [`${total} ページ中 `, `${current} ページ`, ""],
    loading: (topic) => `${topic}を読み込み中…`,
    loadError: (topic, message) => `${topic}のカバレッジを読み込めませんでした：${message}`,
    pageJumpHint: (numeric) =>
      numeric
        ? `クリック：ページ、（英語の）項目名、または「${numeric}」の値へ移動`
        : "クリック：ページまたは（英語の）項目名へ移動",
    pageJumpInput: "ページ、値、または項目名",
    pageNoNumeric: "この表には数値の列がありません。",
  },
  tip: {
    unpin: "固定を解除",
  },
  custom: {
    title: "Custom",
    infoHint:
      "下の入力欄を使って、自分の単語リストを追加できます。{br}" +
      "次のルールが適用されます：{br}" +
      "- すべての項目は、入力全体で統一された1種類の区切り文字で区切ります。{br}" +
      "- 区切り文字そのものを含む項目は避けてください。{br}" +
      "- 内容を変更するたびに、最も多く使われている区切り文字が自動的に区切り文字として検出されます。{br}" +
      "- skribbl.io は句読点、その他の特殊文字、前後の空白を無視します。その一部はここですでに取り除かれます。",
    separatorLabel: "区切り文字：",
    separatorPick: "区切り文字",
    internalDupes: (n) => `有効なCustomリスト内の重複項目が${n}件`,
    localDupes: (n) => `有効なCustomリスト同士の重複が${n}件`,
    globalDupes: (n) => `選択したトピックとの重複が${n}件`,
    dupesNote: "重複は出力で1つにまとめられます。",
    dupesNoteSave: "リスト内の重複は、保存時にも取り除かれます。",
    dupesSamples: {
      internal: "リスト内の重複：",
      local: "有効なCustomリスト同士の重複：",
      global: "選択したトピックとの重複：",
    },
    fitToggle: "入力欄を内容の高さに合わせる",
    fewerRows: "表示行数を減らす",
    moreRows: "表示行数を増やす",
    moreRowsOver: (steps) => `（内容の高さより${steps}段階上）`,
    clearHint: "Custom入力欄を空にする",
    clearConfirm: "Custom入力欄を空にしようとしています。",
    clearConfirmButton: "ここをクリックして確定",
    listsLabel: "保存したリスト",
    listsTitle: "保存したCustomリスト",
    listsInfo:
      "Customリストはローカルストレージに保存されます。{br}" +
      "ローカルストレージはブラウザごとに別々で、{br}" +
      "ほかのブラウザや端末とは共有されません。{br}" +
      "Customリストをほかの場所へ持っていくには、{br}" +
      "ここでエクスポートし、移行先でインポートしてください。{br}{br}" +
      "{b}重要{/b}：大きな変更のたびにリストをエクスポートし、" +
      "バックアップとして保管してください。ブラウザのさまざまな操作で" +
      "ローカルストレージが消去されることがあり、Safari ではサイトを" +
      "7日間訪れないだけで自動的に消去されます。",
    listActivate: "このリストを使う",
    listRename: "名前を変更",
    listSave: "現在の入力をこのリストに保存",
    listLoad: "このリストを入力欄に読み込む",
    listDelete: "このリストを削除",
    listUp: "上へ移動",
    listDown: "下へ移動",
    listSaveNew: "現在の入力を新しいリストとして保存",
    phActivate: "空き枠は使用できません",
    phRename: "空き枠の名前は変更できません",
    phLoad: "空き枠は読み込めません",
    phDelete: "空き枠は削除できません",
    phMove: "空き枠は移動できません",
    exportLabel: "リストをエクスポート",
    exportTitle: "保存したリストをエクスポート",
    selectAll: "すべて選択",
    exportDownload: "ダウンロード",
    importLabel: "リストをインポート",
    importTitle: "保存したリストをインポート",
    importColName: "名前",
    importColSize: "サイズ",
    importColDupes: "重複",
    importColWith: "対象",
    importButton: "選択したものをインポート",
    importEmpty: "このファイルに保存したリストはありません。",
    importDupesSecondary: (pct) => `第2候補：${pct}`,
    listReplaceConfirm: (name) => `リスト「${name}」を現在の入力で置き換えますか？`,
    listDeleteConfirm: (name) => `リスト「${name}」を削除しますか？`,
    listLoadConfirm: "入力欄をこのリストで上書きしますか？",
    confirm: "確定",
    cancel: "キャンセル",
    charsLabel: "skribbl.io がおそらく無視する文字",
    charsIgnored: "skribbl.io がおそらく無視する文字：",
    charsProblematic: "問題のある文字：",
    charsTolerated: "許容される文字：",
    charsRemove: "この文字は取り除くことをおすすめします。",
    charsLists: "該当するリスト：",
    inputName: "{i}入力欄{/i}",
    charsAccepted: "受け付けられる文字：",
    charsRemoveMaybe: "この文字は取り除いたほうがよいかもしれません。",
    charsLone: (char, partner) => `対になる {code}${partner}{/code} のない {code}${char}{/code}；`,
    charsPaired: (open, close) => `{code}${open}{/code}-{code}${close}{/code} の組の一部として；`,
    cleanChars: "リストに、保存時に取り除ける珍しい特殊文字が含まれています：",
    cleanDupes: (n) => `リスト内に重複が${n}件あり、保存時に取り除かれます：`,
    settingsLabel: "Custom設定",
    settingsTitle: "Custom設定",
    maxPreviewItems: "プレビューの最大項目数",
    maxPreviewChars: "プレビューの最大文字数",
    exampleListS: "サンプルリスト S",
    exampleListL: "サンプルリスト L",
    examplePreviewEmpty: "トピック名はまだ読み込まれていません。",
  },
  sportType: {
    label: "含める競技",
  },
};
