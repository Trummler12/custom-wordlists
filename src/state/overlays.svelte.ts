// The two things that float above the page: the language menu and the language
// warning's note. They share a module because they share the way they close —
// one pointerdown handler on the window decides for both.
//
// Every method is an arrow property, not a prototype method: these are passed
// straight to event attributes, where a plain method reference would arrive
// without its `this`.

import { lang } from "./lang.svelte";

class OverlayState {
  /** Which language menu is open, by instance id, or null. Two pickers share the
   *  language but each has its own trigger. */
  langMenu = $state<string | null>(null);
  /** Topic whose language warning shows its note, or null. */
  warnTopic = $state<string | null>(null);
  /** Whether that note sits above its row instead of below. */
  warnAbove = $state(false);

  /** What kind of pointer last went down anywhere on the page. A click event
   *  doesn't carry that, and it decides whether the warning follows the cursor
   *  or the tap. */
  #lastPointerType = "mouse";

  // --- Language menu ---------------------------------------------------------

  toggleLangMenu = (id: string): void => {
    this.langMenu = this.langMenu === id ? null : id;
  };
  chooseLanguage = (l: string): void => {
    this.langMenu = null;
    lang.set(l);
  };

  // --- Language warning ------------------------------------------------------

  /** Show a topic's note, flipping it above the row when the marker sits low
   *  enough that a note below would be cut off by the bottom of the viewport. */
  openWarn = (id: string, marker: Element): void => {
    this.warnAbove = marker.getBoundingClientRect().bottom > window.innerHeight * (2 / 3);
    this.warnTopic = id;
  };
  closeWarn = (): void => {
    this.warnTopic = null;
  };

  // With a cursor the note follows the cursor; without one it answers to the tap,
  // and the click handler stays out of the way when a mouse produced the click.
  warnEnter = (e: PointerEvent, id: string): void => {
    if (e.pointerType === "mouse") this.openWarn(id, e.currentTarget as Element);
  };
  warnLeave = (e: PointerEvent): void => {
    if (e.pointerType === "mouse") this.closeWarn();
  };
  warnClick = (e: MouseEvent, id: string): void => {
    if (this.#lastPointerType === "mouse") return;
    if (this.warnTopic === id) this.closeWarn();
    else this.openWarn(id, e.currentTarget as Element);
  };

  // --- Window handlers -------------------------------------------------------

  onPointerDown = (e: PointerEvent): void => {
    if (e.pointerType) this.#lastPointerType = e.pointerType;
    const target = e.target as Element | null;
    if (this.langMenu && !target?.closest?.(".lang-picker")) this.langMenu = null;
    // Only for pointers without hover — with a mouse, leaving the marker closes it.
    if (this.warnTopic && this.#lastPointerType !== "mouse" && !target?.closest?.(".lang-warning")) {
      this.closeWarn();
    }
  };
  onKeyDown = (e: KeyboardEvent): void => {
    if (e.key === "Escape") {
      this.langMenu = null;
      this.closeWarn();
    }
  };
}

export const overlays = new OverlayState();
