// The two things that float above the page: the language menu and the tooltip
// notes. They share a module because they share the way they close — one
// pointerdown handler on the window decides for both.
//
// Every method is an arrow property, not a prototype method: these are passed
// straight to event attributes, where a plain method reference would arrive
// without its `this`.

import { lang } from "./lang.svelte";

class OverlayState {
  /** Which language menu is open, by instance id, or null. Two pickers share the
   *  language but each has its own trigger. */
  langMenu = $state<string | null>(null);
  /** Which settings menu is open, by instance id, or null — same two-instance
   *  arrangement as the language picker it sits beside. */
  settingsMenu = $state<string | null>(null);
  /** The open tooltip's id, or null — at most one is open at a time. Ids double
   *  as the notes' DOM ids, so triggers can point `aria-controls` at them. */
  tip = $state<string | null>(null);
  /** Whether that note sits above its row instead of below. */
  tipAbove = $state(false);
  /** The same for the omissions panel. */
  omittedAbove = $state(false);

  /** What kind of pointer last went down anywhere on the page. A click event
   *  doesn't carry that, and it decides whether a tooltip follows the cursor or
   *  the tap. */
  #lastPointerType = "mouse";

  // --- Language menu ---------------------------------------------------------

  toggleLangMenu = (id: string): void => {
    this.langMenu = this.langMenu === id ? null : id;
  };
  chooseLanguage = (l: string): void => {
    this.langMenu = null;
    lang.set(l);
  };

  // --- Settings menu ---------------------------------------------------------

  toggleSettingsMenu = (id: string): void => {
    this.settingsMenu = this.settingsMenu === id ? null : id;
  };

  // --- Omissions panel -------------------------------------------------------

  /** Which list is showing what it leaves out, keyed `${topicId}:${groupId}`. */
  omittedPanel = $state<string | null>(null);
  toggleOmittedPanel = (id: string, trigger: Element): void => {
    if (this.omittedPanel === id) {
      this.omittedPanel = null;
      return;
    }
    this.omittedAbove = opensUpward(trigger);
    this.omittedPanel = id;
  };

  // --- Tooltips --------------------------------------------------------------

  /** Show a note, flipping it above its row when there is more room upward. */
  openTip = (id: string, trigger: Element): void => {
    this.tipAbove = opensUpward(trigger);
    this.tip = id;
  };
  closeTip = (): void => {
    this.tip = null;
  };

  // With a cursor the note follows the cursor; without one it answers to the tap,
  // and the click handler stays out of the way when a mouse produced the click.
  tipEnter = (e: PointerEvent, id: string): void => {
    if (e.pointerType === "mouse") this.openTip(id, e.currentTarget as Element);
  };
  tipLeave = (e: PointerEvent): void => {
    if (e.pointerType === "mouse") this.closeTip();
  };
  tipClick = (e: MouseEvent, id: string): void => {
    if (this.#lastPointerType === "mouse") return;
    if (this.tip === id) this.closeTip();
    else this.openTip(id, e.currentTarget as Element);
  };

  // --- Window handlers -------------------------------------------------------

  onPointerDown = (e: PointerEvent): void => {
    if (e.pointerType) this.#lastPointerType = e.pointerType;
    const target = e.target as Element | null;
    if (this.langMenu && !target?.closest?.(".lang-picker")) this.langMenu = null;
    if (this.settingsMenu && !target?.closest?.(".settings-picker")) this.settingsMenu = null;
    if (this.omittedPanel && !target?.closest?.(".omitted-host")) this.omittedPanel = null;
    // Only for pointers without hover — with a mouse, leaving the trigger closes it.
    if (this.tip && this.#lastPointerType !== "mouse" && !target?.closest?.(".tip-trigger")) {
      this.closeTip();
    }
  };
  onKeyDown = (e: KeyboardEvent): void => {
    if (e.key === "Escape") {
      this.langMenu = null;
      this.settingsMenu = null;
      this.omittedPanel = null;
      this.closeTip();
    }
  };
}

/** Which way an overlay should open from its trigger. The middle of the viewport,
 *  not some fraction of it: whichever half the trigger is in, the other half is
 *  where the room is — and a box that opens the wrong way is cut off by an edge
 *  either way, so there is no reason to prefer one direction near the middle.
 *
 *  Shared by the tip-notes and the omissions panel so the two can't drift. */
function opensUpward(trigger: Element): boolean {
  return trigger.getBoundingClientRect().bottom > window.innerHeight / 2;
}

export const overlays = new OverlayState();
