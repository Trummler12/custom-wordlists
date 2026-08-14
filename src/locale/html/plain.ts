// The text-only counterpart to Msg.svelte, for the places a string has to be a
// string: aria-label, title, placeholder. Both go through ./markup, so neither
// can learn a tag the other doesn't — adding one to Msg.svelte alone used to leak
// a literal `{br}` into a screen reader.
//
// `{br}` becomes a space by default, which is what an aria-label wants. Pass a
// newline for a `title`: the browser's own tooltip honours one, and without it a
// two-sentence note runs off the side of the screen.

export { plainText as plain } from "./markup";
