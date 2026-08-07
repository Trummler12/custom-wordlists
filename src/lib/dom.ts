// The two helpers that reach for the DOM directly, because the platform offers
// no other way: `indeterminate` is a property with no attribute, and a selection
// range is not something markup can express.

import type { Action } from "svelte/action";

/** Reflect a mixed parent-checkbox state. `indeterminate` is a DOM property, so
 *  it can't be set from markup — hence an action rather than an attribute. */
export const setIndeterminate: Action<HTMLInputElement, boolean> = (node, value) => {
  node.indeterminate = value;
  return { update: (v: boolean) => (node.indeterminate = v) };
};

/** Select a node's whole contents, the way a click into a text field would. */
export function selectAll(node: HTMLElement): void {
  const range = document.createRange();
  range.selectNodeContents(node);
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
}
