// Kana → Latin script, for the lists PokéAPI gives no romaji for.
//
// Only kana. Kanji have several readings each and cannot be transliterated
// without knowing the word — but the Pokémon item and move names contain none:
// 0 of 2115 and 0 of 919 rows hold a single kanji, they are hiragana and katakana
// throughout. That is what makes this mechanical rather than a guess.
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

/** Marks that turn up inside a name and aren't plain full-width Latin. */
const PUNCT = { "・": " ", "　": " ", "×": "x" };

/** Names written in full-width Latin — Ｖジェネレート, ＧＢプレイヤー, ブリッジメールＳ
 *  — are common enough that refusing them would drop 421 of 3034. The block runs
 *  parallel to ASCII, so this is arithmetic like the kana above. */
function widthNormalize(text) {
  return text.replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
}

/** Kept as they stand: they read the same in any script. */
const PASSTHROUGH = new Set(["♀", "♂", "★", "☆", "※", "…"]);

const SMALL_TSU = "っ";
const LONG = "ー";

/** Katakana to hiragana, so one table serves both. Their blocks run in parallel,
 *  which is why this is arithmetic rather than a second map. */
function toHiragana(text) {
  return text.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
}

/** True for anything this can read: kana, the marks above, ASCII. */
export function isTransliterable(text) {
  return [...toHiragana(widthNormalize(text))].every(
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
export function toRomaji(text) {
  if (!isTransliterable(text)) return undefined;
  const src = toHiragana(widthNormalize(text));
  let out = "";
  let pending = ""; // a small つ waiting for the consonant it doubles

  for (let i = 0; i < src.length; i++) {
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
  return out.charAt(0).toUpperCase() + out.slice(1);
}
