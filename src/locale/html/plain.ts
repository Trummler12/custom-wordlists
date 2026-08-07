// The text-only counterpart to Msg.svelte, for the places a string has to be a
// string: aria-label, title, placeholder. It must know the same set of tags —
// adding one to Msg.svelte without adding it here leaks a literal `{br}` into a
// screen reader.

/** Strip inline locale markup, leaving readable plain text. */
export function plain(text: string): string {
  return text.replaceAll("{br}", " ");
}
