// Which flag stands for which language, on the toggle that switches a list to its
// entries in another language.
//
// Here rather than in the dictionaries: a flag belongs to the language, not to the
// interface talking about it, and a dictionary leaving it out would inherit the
// fallback language's flag. The images and their sources are in
// assets/flags/languages/ (see CREDITS.md there).

/** What a flag stands for: one country's, several countries' combined, or a symbol
 *  of the language itself. Also the folder it lives in. */
export type FlagType = "country" | "mixed" | "linguistic";
export const FLAG_TYPES: readonly FlagType[] = ["country", "mixed", "linguistic"];

/** Paths below assets/flags/languages/, without the extension. The first one is the
 *  language's default; the rest follow the order of `FLAG_TYPES`. */
export const FLAGS: Record<string, readonly string[]> = {
  de: ["country/Germany", "mixed/German"],
  en: ["mixed/English"],
  es: ["mixed/Spanish", "linguistic/Spanish"],
  fr: ["country/France", "mixed/French", "linguistic/French"],
  it: ["country/Italy", "mixed/Italian"],
  ja: ["country/Japan"],
  ko: ["country/South Korea"],
  pt: ["mixed/Portuguese", "linguistic/Portuguese"],
  ru: ["mixed/Russian"],
  "zh-Hans": ["country/China", "mixed/Chinese"],
  "zh-Hant": ["country/Taiwan", "mixed/Chinese"],
};

const files = import.meta.glob<string>("../../assets/flags/languages/*/*.png", {
  eager: true,
  query: "?url",
  import: "default",
});
const PREFIX = "../../assets/flags/languages/";

/** Every flag image there is, by the path `FLAGS` names it with. */
export const FLAG_URLS: Record<string, string> = Object.fromEntries(
  Object.entries(files).map(([file, url]) => [file.slice(PREFIX.length, -".png".length), url]),
);

export interface Flag {
  type: FlagType;
  url: string;
}

/** A language's flags, default first. Empty for a language without one. */
export function flagsFor(lang: string): Flag[] {
  return (FLAGS[lang] ?? []).flatMap((path) => {
    const url = FLAG_URLS[path];
    return url ? [{ type: path.slice(0, path.indexOf("/")) as FlagType, url }] : [];
  });
}

/** The flag to show for a language: the reader's preferred type where the language
 *  has one, its default otherwise. */
export function flagFor(lang: string, preferred?: FlagType): Flag | undefined {
  const all = flagsFor(lang);
  return all.find((f) => f.type === preferred) ?? all[0];
}
