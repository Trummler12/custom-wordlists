// The text-only counterpart to Msg.svelte, for the places a string has to be a
// string: aria-label, title, placeholder. Both go through lib/markup, so neither
// can learn a tag the other doesn't — adding one to Msg.svelte alone used to leak
// a literal `{br}` into a screen reader.

export { plainText as plain } from "../../lib/markup";
