// Languages that are written two ways, and the option that switches between them.
//
// A variant is NOT a second entry in the language picker. Nobody wants a Romaji
// interface, and Latin American Spanish is the same language as Spanish — but for
// a word game they behave like two, because what you type is different. So a
// variant is a second tag consulted ahead of the language's own:
//
//     variant tag (if on) → language tag → en
//
// which is the chain `matchTag` already walks. The whole feature is which tag goes
// first; counts, de-duplication, the output and `?` follow from that for free.
//
// The labels live in the ordinary dictionaries rather than here, keyed by `id`.
// The option only appears while its own language is selected, but the interface
// it appears in is a separate choice — a German reader browsing Japanese lists
// reads about romaji in German.

/** Which variant a string belongs to. A new one adds a member here and a line to
 *  every dictionary, which is exactly the work a new variant is. */
export type VariantId = "romaji" | "es419";

/** One language's second way of being written. */
export interface Variant {
  /** Names its label in `LanguageStrings.variant`. */
  id: VariantId;
  /** The tag its entries carry. */
  tag: string;
  /** Whether a single list may deviate from the global choice. Worth it only
   *  where lists genuinely disagree: Latin American Spanish differs on 5 of 1330
   *  items and 254 of 937 moves, and a control that appears on one list and not
   *  the other says where — a romanization applies to every name alike. */
  perTopic: boolean;
}

/** Keyed by the content language the variant belongs to. */
export const VARIANTS: Record<string, Variant> = {
  ja: { id: "romaji", tag: "ja-Latn", perTopic: false },
  es: { id: "es419", tag: "es-419", perTopic: true },
};

/** The variant for a content language, if it has one. */
export function variantFor(lang: string): Variant | undefined {
  return VARIANTS[lang];
}
