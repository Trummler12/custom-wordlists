import { describe, expect, it } from "vitest";
import { isTransliterable, toRomaji } from "./kana";

describe("toRomaji", () => {
  it("reads a kana name one syllable at a time", () => {
    expect(toRomaji("はたく")).toBe("Hataku");
    expect(toRomaji("つるぎのまい")).toBe("Tsuruginomai");
    expect(toRomaji("マスターボール")).toBe("Masutaabooru");
  });

  it("doubles the consonant after a small tsu", () => {
    expect(toRomaji("ピッピにんぎょう")).toBe("Pippiningyou");
    // Except before `ch`, which Hepburn writes as `t`.
    expect(toRomaji("いっちょく")).toBe("Itchoku");
  });

  it("repeats the vowel a long mark lengthens", () => {
    // Not a macron: the output has to be typable into a word game.
    expect(toRomaji("モーモーミルク")).toBe("Moomoomiruku");
    expect(toRomaji("スーパーボール")).toBe("Suupaabooru");
  });

  it("keeps two vowels that merely sit side by side", () => {
    // ほのお is ho-no-o, three kana. This is why the conversion is one-way:
    // both it and モーモー come out with `oo`.
    expect(toRomaji("ほのおのパンチ")).toBe("Honoonopanchi");
  });

  it("normalizes full-width Latin and digits", () => {
    expect(toRomaji("Ｖジェネレート")).toBe("Vjenereeto");
    expect(toRomaji("１０００まんボルト")).toBe("1000manboruto");
  });

  it("reads a known word rather than its characters", () => {
    // 国 is `goku` here and `koku` next door — which is why the table is keyed on
    // words. A per-character mapping could not be right for both.
    expect(toRomaji("中国語")).toBe("Chuugokugo");
    expect(toRomaji("韓国語")).toBe("Kankokugo");
    // Longest match first, or 南部 would read as 南 + 部.
    expect(toRomaji("南部ソト語")).toBe("Nanbusotogo");
    expect(toRomaji("南ンデベレ語")).toBe("Minamindeberego");
  });

  it("spaces a bracket the way Latin script does, not the way Japanese does", () => {
    // The kana carries no space, its own brackets being full-width; the reading
    // is Latin script and wants one. Both halves are names, so both capitalize.
    expect(toRomaji("ノルウェー語(ブークモール)")).toBe("Noruweego (Buukumooru)");
  });

  it("gives up on a word it doesn't know rather than guessing", () => {
    expect(isTransliterable("手紙")).toBe(false);
    expect(toRomaji("手紙")).toBeUndefined();
  });
});
