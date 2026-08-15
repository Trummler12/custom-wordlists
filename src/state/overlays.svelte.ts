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
  /** Whether the open note stays put instead of following the pointer.
   *
   *  A note can hold a link — the one inviting a romaji correction does — and a
   *  note that closes the moment the cursor leaves its marker is a link nobody
   *  with a mouse can reach: it is gone before the pointer arrives. So a click
   *  pins it, with a cursor exactly as with a finger, and it stays until it is
   *  dismissed. */
  tipPinned = $state(false);
  /** The same for the omissions panel. */
  omittedAbove = $state(false);

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
  openTip = (id: string, trigger: Element, pinned = false): void => {
    this.tipAbove = opensUpward(trigger);
    this.tip = id;
    this.tipPinned = pinned;
  };
  closeTip = (): void => {
    this.tip = null;
    this.tipPinned = false;
  };
  /** Close unless the note is pinned — what leaving the marker and losing focus
   *  both want, neither of them being a dismissal once the reader has asked for
   *  the note to stay. */
  releaseTip = (): void => {
    if (!this.tipPinned) this.closeTip();
  };

  // Hovering or focusing shows the note for as long as the pointer or the focus
  // is there; clicking pins it. A pinned note ignores both, so moving the cursor
  // off its marker — towards the note, most likely — leaves it standing.
  #holding(id: string): boolean {
    return this.tipPinned && this.tip === id;
  }
  tipEnter = (e: PointerEvent, id: string): void => {
    if (e.pointerType !== "mouse" || this.#holding(id)) return;
    this.openTip(id, e.currentTarget as Element);
  };
  tipLeave = (e: PointerEvent): void => {
    if (e.pointerType === "mouse") this.releaseTip();
  };
  tipFocus = (e: FocusEvent, id: string): void => {
    if (this.#holding(id)) return;
    this.openTip(id, e.currentTarget as Element);
  };
  tipClick = (e: MouseEvent, id: string): void => {
    if (this.#holding(id)) this.closeTip();
    else this.openTip(id, e.currentTarget as Element, true);
  };

  // --- Window handlers -------------------------------------------------------

  onPointerDown = (e: PointerEvent): void => {
    const target = e.target as Element | null;
    if (this.langMenu && !target?.closest?.(".lang-picker")) this.langMenu = null;
    if (this.settingsMenu && !target?.closest?.(".settings-picker")) this.settingsMenu = null;
    if (this.omittedPanel && !target?.closest?.(".omitted-host")) this.omittedPanel = null;
    // Neither on the marker, whose own click toggles, nor inside the note: a note
    // exists to be read, and one carrying a link exists to be clicked — closing it
    // here would take the link out of the document before the click reached it.
    if (this.tip && !target?.closest?.(".tip-trigger") && !target?.closest?.(".tip-note")) {
      this.closeTip();
    }
  };
  /** A pinned note outlives the pointer, so it needs dismissals of its own: a
   *  press elsewhere, Escape, or this. Which way it opened was read off its row's
   *  place in the viewport, and a scroll makes that answer stale as well. */
  onScroll = (): void => {
    if (this.tipPinned) this.closeTip();
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
