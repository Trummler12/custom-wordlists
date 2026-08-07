// The target game's custom-wordlist rules (PLANNING §4/§6.2). The only preset so
// far; a second game would live beside it and become a selectable option.

export const SKRIBBL = {
  separator: ",",
  minWords: 10,
  maxWordLen: 32,
  maxTotal: 20000,
} as const;
