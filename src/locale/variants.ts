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
// The labels are in their own language on purpose. A variant's option only exists
// while its language is selected, so a German or English translation of it could
// never be rendered — writing one would be writing a string that cannot appear.

/** One language's second way of being written. */
export interface Variant {
  /** The tag its entries carry. */
  tag: string;
  /** The option's label, in the language it belongs to. */
  label: string;
  /** Whether a single list may deviate from the global choice. Worth it only
   *  where lists genuinely disagree: Latin American Spanish differs on 5 of 1330
   *  items and 254 of 937 moves, and a control that appears on one list and not
   *  the other says where — a romanization applies to every name alike. */
  perTopic: boolean;
}

/** Keyed by the content language the variant belongs to. */
export const VARIANTS: Record<string, Variant> = {
  // "Use Romaji for list entries"
  ja: { tag: "ja-Latn", label: "リストの項目にローマ字を使う", perTopic: false },
  // "Use Latin American Spanish for list entries"
  es: { tag: "es-419", label: "Usar el español latinoamericano en las listas", perTopic: true },
};

/** The variant for a content language, if it has one. */
export function variantFor(lang: string): Variant | undefined {
  return VARIANTS[lang];
}
