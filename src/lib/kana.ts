// Kana → Latin script, for the lists no source gives romaji for.
//
// Lives in src/ and is imported by BOTH the app (which transliterates at render
// time) and the codemods under scripts/ — Node reads a .ts directly, so there is
// one table rather than two that drift.
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

/** Kana → romaji, longest key first at lookup so digraphs beat their halves. */
const KANA: Record<string, string> = {
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

/** Marks that turn up inside a name and aren't plain full-width Latin. */
const PUNCT: Record<string, string> = { "・": " ", "　": " ", "×": "x" };

/** Words this cannot spell out character by character, longest match first.
 *
 *  Every one is a compound whose reading is not the sum of its characters, so
 *  each is a claim about that word and not about the kanji in it. The twelve here
 *  are what the language list needs: `語` alone covers 170 of its 182 kanji names,
 *  and the rest name a place or a direction. */
const WORDS: Record<string, string> = {
  語: "go",
  中国: "chuugoku",
  韓国: "kankoku",
  日本: "nihon",
  英: "ei",
  南部: "nanbu",
  南: "minami",
  北: "kita",
  西: "nishi",
  四川: "shisen",
  教会: "kyoukai",
  島: "tou",
};

/** Longest first, so 南部 is read before 南. */
const WORD_KEYS = Object.keys(WORDS).sort((a, b) => b.length - a.length);

/** Names written in full-width Latin — Ｖジェネレート, ＧＢプレイヤー, ブリッジメールＳ
 *  — are common enough that refusing them would drop 421 of 3034. The block runs
 *  parallel to ASCII, so this is arithmetic like the kana above. */
function widthNormalize(text: string): string {
  return text.replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
}

/** Kept as they stand: they read the same in any script. */
const PASSTHROUGH = new Set(["♀", "♂", "★", "☆", "※", "…"]);

const SMALL_TSU = "っ";
const LONG = "ー";

/** Katakana to hiragana, so one table serves both. Their blocks run in parallel,
 *  which is why this is arithmetic rather than a second map. */
function toHiragana(text: string): string {
  return text.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
}

/** The word at `at`, if one starts there. */
function wordAt(text: string, at: number): string | undefined {
  return WORD_KEYS.find((w) => text.startsWith(w, at));
}

/** True for anything this can read: a word it knows, kana, the marks above, ASCII. */
export function isTransliterable(text: string): boolean {
  const src = toHiragana(widthNormalize(text));
  let rest = "";
  for (let i = 0; i < src.length; i++) {
    const word = wordAt(src, i);
    if (word) i += word.length - 1;
    else rest += src[i];
  }
  return [...rest].every(
    (c) =>
      KANA[c] !== undefined ||
      PUNCT[c] !== undefined ||
      PASSTHROUGH.has(c) ||
      c === SMALL_TSU ||
      c === LONG ||
      /[\x20-\x7E]/.test(c),
  );
}

/** A kana name in Latin script, capitalized. Returns undefined for anything
 *  holding a character this cannot read — a kanji, most likely — rather than
 *  dropping it silently. */
export function toRomaji(text: string): string | undefined {
  if (!isTransliterable(text)) return undefined;
  const src = toHiragana(widthNormalize(text));
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
 *  until it gets one. */
function spaceBrackets(text: string): string {
  return text.replace(/(\S)\(/g, "$1 (");
}

/** The name, and anything in brackets after it, start with a capital — both are
 *  names rather than sentences. */
function capitalize(text: string): string {
  return text.replace(/(^|\()\s*([a-z])/g, (m) => m.toUpperCase());
}
