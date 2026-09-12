// Kana → Latin script, for the lists no source gives romaji for.
//
// A plain ES module (JSDoc-typed) rather than TypeScript, so the one table serves
// BOTH the app (which transliterates at render time) and the Node codemods and
// checks under scripts/ — Node imports .mjs directly, .ts it cannot, so this is the
// only shape that keeps a single table rather than two that drift.
//
// Mostly kana, and kana alone is mechanical: one character, one syllable. The
// Pokémon items and moves hold no kanji at all — 0 of 2115 and 0 of 919 — so they
// need nothing else.
//
// Kanji do not work that way: 国 is `goku` in 中国 and `koku` in 韓国, two entries
// of the same list. So they are read from WORDS below, longest match first, keyed
// on whole words rather than characters — which is how the ambiguity disappears
// rather than being resolved. A list that needs a word this doesn't know reports
// it (see `isTransliterable`) instead of guessing at it.
//
// ASCII, and no macrons: the output is meant to be typed into a word game, where
// `Mōmō` is unreachable on most keyboards. A long vowel repeats instead —
// モーモーミルク → Moomoomiruku.
//
// That is Hepburn's consonants (shi, chi, tsu, ji) with the long vowels doubled
// rather than marked. It is neither strict Hepburn, which would write `Mōmō`, nor
// strict wāpuro, which types the ー as a hyphen (`mo-mo-miruku`) — those are the
// two named conventions and this is the readable ASCII middle.
//
// The conversion is one-way. `oo` cannot be turned back into a long vowel,
// because ほのお is ho-no-o — three kana, no long vowel — and モーモー is not, and
// both arrive here as `oo`. Anything wanting macrons has to start from the kana,
// which is why no such option is offered on top of the stored romaji.
//
// This is NOT the style PokéAPI uses for the Pokémon themselves. Those are
// trademark romanizations decided by a marketing department (ブイゼル → Buoysel,
// ビーダル → Beadaru), and nothing derives them from the kana. Where they exist
// they win; this fills in only where they don't.

/** Kana → romaji, longest key first at lookup so digraphs beat their halves.
 *  @type {Record<string, string>} */
const KANA = {
  あ: "a", い: "i", う: "u", え: "e", お: "o",
  か: "ka", き: "ki", く: "ku", け: "ke", こ: "ko",
  が: "ga", ぎ: "gi", ぐ: "gu", げ: "ge", ご: "go",
  さ: "sa", し: "shi", す: "su", せ: "se", そ: "so",
  ざ: "za", じ: "ji", ず: "zu", ぜ: "ze", ぞ: "zo",
  た: "ta", ち: "chi", つ: "tsu", て: "te", と: "to",
  だ: "da", ぢ: "ji", づ: "zu", で: "de", ど: "do",
  な: "na", に: "ni", ぬ: "nu", ね: "ne", の: "no",
  は: "ha", ひ: "hi", ふ: "fu", へ: "he", ほ: "ho",
  ば: "ba", び: "bi", ぶ: "bu", べ: "be", ぼ: "bo",
  ぱ: "pa", ぴ: "pi", ぷ: "pu", ぺ: "pe", ぽ: "po",
  ま: "ma", み: "mi", む: "mu", め: "me", も: "mo",
  や: "ya", ゆ: "yu", よ: "yo",
  ら: "ra", り: "ri", る: "ru", れ: "re", ろ: "ro",
  わ: "wa", ゐ: "i", ゑ: "e", を: "o", ん: "n",
  きゃ: "kya", きゅ: "kyu", きょ: "kyo",
  ぎゃ: "gya", ぎゅ: "gyu", ぎょ: "gyo",
  しゃ: "sha", しゅ: "shu", しょ: "sho", しぇ: "she",
  じゃ: "ja", じゅ: "ju", じょ: "jo", じぇ: "je",
  ちゃ: "cha", ちゅ: "chu", ちょ: "cho", ちぇ: "che",
  にゃ: "nya", にゅ: "nyu", にょ: "nyo",
  ひゃ: "hya", ひゅ: "hyu", ひょ: "hyo",
  びゃ: "bya", びゅ: "byu", びょ: "byo",
  ぴゃ: "pya", ぴゅ: "pyu", ぴょ: "pyo",
  みゃ: "mya", みゅ: "myu", みょ: "myo",
  りゃ: "rya", りゅ: "ryu", りょ: "ryo",
  てぃ: "ti", でぃ: "di", とぅ: "tu", どぅ: "du",
  ふぁ: "fa", ふぃ: "fi", ふぇ: "fe", ふぉ: "fo", ふゅ: "fyu",
  うぃ: "wi", うぇ: "we", うぉ: "wo",
  ゔ: "bu", ゔぁ: "ba", ゔぃ: "bi", ゔぇ: "be", ゔぉ: "bo",
  つぁ: "tsa", つぃ: "tsi", つぇ: "tse", つぉ: "tso",
  ぁ: "a", ぃ: "i", ぅ: "u", ぇ: "e", ぉ: "o",
  ゃ: "ya", ゅ: "yu", ょ: "yo", ゎ: "wa",
};

/** Marks that turn up inside a name and aren't plain full-width Latin.
 *  @type {Record<string, string>} */
const PUNCT = { "・": " ", "　": " ", "×": "x", "、": ", " };

/** Words this cannot spell out character by character, longest match first.
 *
 *  Every one is a compound whose reading is not the sum of its characters, so
 *  each is a claim about that word and not about the kanji in it. Longest-first at
 *  lookup means a compound beats the shorter words inside it (中国 before 国,
 *  連邦共和国 as 連邦 then 共和国), so a suffix and the whole that contains it can
 *  both live here. Two lists feed off this: the language names and the country /
 *  capital names.
 *  @type {Record<string, string>} */
const WORDS = {
  // The language list (see build-languages): 語 alone covers most of its kanji
  // names; the rest name a type of language, a place, or a direction.
  語: "go",
  中国: "chuugoku",
  韓国: "kankoku",
  日本: "nihon",
  英: "ei",
  南部: "nanbu",
  南: "minami",
  北: "kita",
  西: "nishi",
  東: "higashi",
  四川: "shisen",
  教会: "kyoukai",
  島: "tou",

  // Language-type suffixes and qualifiers the Wikidata list added in bulk — dialects,
  // groups, families, sign languages, "modern/standard", the compass regions. Each is
  // a productive suffix rather than a one-off, so it composes with 語 and the rest
  // (語族 → gozoku, 諸語 → shogo, アラビア語エジプト方言 → …hougen).
  方言: "hougen",
  手話: "shuwa",
  諸: "sho",
  族: "zoku",
  派: "ha",
  群: "gun",
  現代: "gendai",
  標準: "hyoujun",
  民国: "minkoku",
  北部: "hokubu",
  中部: "chuubu",
  東部: "toubu",
  西部: "seibu",
  中東: "chuutou",
  低地: "teichi",
  低: "tei",
  上部: "joubu",
  高地: "kouchi",
  平原: "heigen",
  山地: "sanchi",
  牧地: "bokuchi",
  海峡: "kaikyou",
  露: "ro",
  新: "shin",
  台: "tai",
  // Places the language names reach that the country/capital lists didn't: the
  // Ryukyuan tongues, a few East-Asian regions, a French colony.
  沖縄: "okinawa",
  奄美: "amami",
  大島: "ooshima",
  琉球: "ryuukyuu",
  八重山: "yaeyama",
  与那国: "yonaguni",
  喜界島: "kikaijima",
  宮窪: "miyakubo",
  北海道: "hokkaidou",
  済州: "saishuu",
  満洲: "manshuu",
  海南: "kainan",
  広東: "kanton",
  客家: "hakka",
  仏領: "futsuryou",
  // The Sinitic topolects the list names by their standard on-reading, plus a few
  // one-off terms. 閩南 as a whole so its 南 isn't read `minami`.
  呉: "go",
  晋: "shin",
  湘: "shou",
  粤: "etsu",
  贛: "kan",
  徽: "ki",
  温州: "onshuu",
  閩南: "binnan",
  系: "kei",
  地球: "chikyuu",
  同: "dou",
  標: "hyou",
  赤: "aka",
  // The last topolects and two country abbreviations. A bound Sino-Japanese compound
  // reads its kanji on-reading, so 北/東 here are hoku/tou, not the isolated kita/higashi
  // — hence the two-kanji entries that pin them.
  閩北: "binhoku",
  閩東: "bintou",
  邕北: "youhoku",
  東紅水河: "toukousuiga",
  莆: "ho",
  仙: "sen",
  彝: "i",
  載: "sai",
  瓦: "ga",
  五: "go",
  屯: "ton",
  回: "kai",
  輝: "ki",
  康: "kou",
  家: "ka",
  印: "in",
  尼: "ni",
  首: "shu",
  連: "ren",

  // Country names (see build-country-data): the administrative tails of the formal
  // `long` names. They recur across dozens of countries and compose left to right —
  // 連邦共和国 is 連邦 + 共和国, 民主共和国 is 民主 + 共和国 — so each is one entry
  // rather than one per country that ends in it.
  国: "koku",
  共和国: "kyouwakoku",
  民主: "minshu",
  人民: "jinmin",
  社会: "shakai",
  主義: "shugi",
  王国: "oukoku",
  公国: "koukoku",
  連邦: "renpou",
  連合: "rengou",
  合衆国: "gasshuukoku",
  首長国: "shuchoukoku",
  中央: "chuuou",
  中華: "chuuka",
  諸島: "shotou",
  領: "ryou", // the territory suffix: アメリカ領・イギリス領・フランス領 (…ヴァージン諸島)
  // Capital names: the administrative tail on a city's formal name.
  市: "shi",
  都: "to",
  特別: "tokubetsu",
  地区: "chiku",
  地域: "chiiki",
  // Places written in kanji whose reading is not the sum of its characters. The
  // foreign capitals take the reading a Japanese speaker gives them today (北京
  // ペキン, 台北 タイペイ, 平壌 ピョンヤン), which is the katakana form written back
  // in kanji.
  台湾: "taiwan",
  台灣: "taiwan",
  香港: "honkon",
  象牙: "zouge",
  海岸: "kaigan",
  赤道: "sekidou",
  朝鮮: "chousen",
  大韓民国: "daikanminkoku",
  北京: "pekin",
  台北: "taipei",
  平壌: "pyonyan",
  東京: "toukyou",
  沿: "en",
  旧: "kyuu",
  及び: "oyobi",
  法王: "houou",
  教皇: "kyoukou",
  庁: "chou",
};

/** Longest first, so 南部 is read before 南.
 *  @type {string[]} */
const WORD_KEYS = Object.keys(WORDS).sort((a, b) => b.length - a.length);

/** Names written in full-width Latin — Ｖジェネレート, ＧＢプレイヤー, ブリッジメールＳ
 *  — are common enough that refusing them would drop 421 of 3034. The block runs
 *  parallel to ASCII, so this is arithmetic like the kana above.
 *  @param {string} text @returns {string} */
function widthNormalize(text) {
  return text.replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
}

/** Kept as they stand: they read the same in any script.
 *  @type {Set<string>} */
const PASSTHROUGH = new Set(["♀", "♂", "★", "☆", "※", "…"]);

const SMALL_TSU = "っ";
const LONG = "ー";

/** Katakana to hiragana, so one table serves both. Their blocks run in parallel,
 *  which is why this is arithmetic rather than a second map.
 *  @param {string} text @returns {string} */
function toHiragana(text) {
  return text.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
}

/** The word at `at`, if one starts there.
 *  @param {string} text @param {number} at @returns {string | undefined} */
function wordAt(text, at) {
  return WORD_KEYS.find((w) => text.startsWith(w, at));
}

/** Katakana folded to hiragana and full-width Latin brought down to ASCII — the
 *  one form both the readability check and the conversion work on. Done once and
 *  passed along rather than repeated in each, which is how the two would drift.
 *  @param {string} text @returns {string} */
function normalize(text) {
  return toHiragana(widthNormalize(text));
}

/** True for anything this can read: a word it knows, kana, the marks above, ASCII.
 *  @param {string} text @returns {boolean} */
export function isTransliterable(text) {
  return canRead(normalize(text));
}

/** The characters this can't read in an already-normalized string, after known
 *  words are stripped — kana, marks and ASCII all pass, so what's left is the kanji
 *  (or the like) WORDS is missing.
 *  @param {string} src @returns {string[]} */
function unread(src) {
  let rest = "";
  for (let i = 0; i < src.length; i++) {
    const word = wordAt(src, i);
    if (word) i += word.length - 1;
    else rest += src[i];
  }
  return [...rest].filter(
    (c) =>
      KANA[c] === undefined &&
      PUNCT[c] === undefined &&
      !PASSTHROUGH.has(c) &&
      c !== SMALL_TSU &&
      c !== LONG &&
      !/[\x20-\x7E]/.test(c),
  );
}

/** @param {string} src @returns {boolean} */
function canRead(src) {
  return unread(src).length === 0;
}

/** The characters that keep `text` from transliterating — what the WORDS table
 *  would need for it. Empty when the name reads cleanly. Feeds the coverage report
 *  (scripts/check-romaji), so its verdict is kana's own rather than a copy that drifts.
 *  @param {string} text @returns {string[]} */
export function unreadable(text) {
  return unread(normalize(text));
}

/** Readings already worked out. The app derives at render time, and a render walks
 *  every entry of a list — 23 ms per pass over the 1795 Japanese item names, several
 *  passes per render — so without this the same two thousand names are re-read on
 *  every reactive change. Unbounded on purpose: the keys are the names a list holds,
 *  so the map is bounded by the data rather than by how long the page stays open.
 *  @type {Map<string, string | undefined>} */
const readings = new Map();

/** A kana name in Latin script, capitalized. Returns undefined for anything
 *  holding a character this cannot read — a kanji, most likely — rather than
 *  dropping it silently.
 *  @param {string} text @returns {string | undefined} */
export function toRomaji(text) {
  let hit = readings.get(text);
  if (hit === undefined && !readings.has(text)) {
    hit = read(normalize(text));
    readings.set(text, hit);
  }
  return hit;
}

/** The conversion itself, on an already-normalized name.
 *  @param {string} src @returns {string | undefined} */
function read(src) {
  if (!canRead(src)) return undefined;
  let out = "";
  let pending = ""; // a small つ waiting for the consonant it doubles

  for (let i = 0; i < src.length; i++) {
    const word = wordAt(src, i);
    if (word) {
      out += WORDS[word];
      i += word.length - 1;
      pending = "";
      continue;
    }
    const two = src.slice(i, i + 2);
    const one = src[i];

    if (one === SMALL_TSU) {
      pending = one;
      continue;
    }
    if (one === LONG) {
      // Repeat whatever vowel we last wrote; at the start of a name there is
      // none to repeat and the mark is simply dropped.
      const last = out.at(-1);
      if (last && "aiueo".includes(last)) out += last;
      continue;
    }

    let romaji = KANA[two] !== undefined ? KANA[two] : KANA[one];
    if (romaji === undefined) {
      out += PUNCT[one] ?? one;
      pending = "";
      continue;
    }
    if (KANA[two] !== undefined) i++;

    if (pending) {
      // Hepburn doubles the consonant, except before `ch`, which takes a `t`.
      out += romaji.startsWith("ch") ? "t" : romaji[0];
      pending = "";
    }
    out += romaji;
  }
  return capitalize(spaceBrackets(out));
}

/** Latin script wants a space before an opening bracket; Japanese doesn't, its
 *  own brackets being full-width and carrying their own side-bearing. So
 *  `ノルウェー語(ブークモール)` arrives without one and reads as `Noruweego(…)`
 *  until it gets one.
 *  @param {string} text @returns {string} */
function spaceBrackets(text) {
  return text.replace(/(\S)\(/g, "$1 (");
}

/** The name, and anything in brackets after it, start with a capital — both are
 *  names rather than sentences.
 *  @param {string} text @returns {string} */
function capitalize(text) {
  return text.replace(/(^|\()\s*([a-z])/g, (m) => m.toUpperCase());
}
