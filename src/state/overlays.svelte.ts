// The two things that float above the page: the language menu and the tooltip
// notes. They share a module because they share the way they close — one
// pointerdown handler on the window decides for both.
//
// Every method is an arrow property, not a prototype method: these are passed
// straight to event attributes, where a plain method reference would arrive
// without its `this`.

import { tick } from "svelte";
import { lang } from "./lang.svelte";

class OverlayState {
  /** The control that opened whatever is open. Escape removes a popover from the
   *  document, and with it the focus that was inside it — a keyboard user then
   *  lands on `<body>` and has to tab back to where they were.
   *
   *  Not `$state`: it is read in an event handler and never rendered. */
  #opener: HTMLElement | null = null;
  #remember(trigger: Element | null | undefined): void {
    this.#opener = trigger instanceof HTMLElement ? trigger : null;
  }
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

  toggleLangMenu = (id: string, trigger?: Element): void => {
    this.langMenu = this.langMenu === id ? null : id;
    if (this.langMenu) this.#remember(trigger);
  };
  chooseLanguage = (l: string): void => {
    this.langMenu = null;
    lang.set(l);
  };

  // --- Settings menu ---------------------------------------------------------

  toggleSettingsMenu = (id: string, trigger?: Element): void => {
    this.settingsMenu = this.settingsMenu === id ? null : id;
    if (this.settingsMenu) this.#remember(trigger);
  };

  // --- Omissions panel -------------------------------------------------------

  /** Which list is showing what it leaves out, keyed `${topicId}:${groupId}`.
   *
   *  `VariantPanel` shares the slot under `variant-${topicId}`, which is the point
   *  of sharing it: the 🧹 and the 🌎 sit on the same row and only one of them
   *  should ever be open. */
  omittedPanel = $state<string | null>(null);
  toggleOmittedPanel = (id: string, trigger: Element): void => {
    if (this.omittedPanel === id) {
      this.omittedPanel = null;
      return;
    }
    this.omittedAbove = opensUpward(trigger);
    this.omittedPanel = id;
    this.#remember(trigger);
  };

  // --- Tooltips --------------------------------------------------------------

  /** Show a note, flipping it above its row when there is more room upward. */
  openTip = (id: string, trigger: Element, pinned = false): void => {
    this.tipAbove = opensUpward(trigger);
    this.tip = id;
    this.tipPinned = pinned;
    this.#remember(trigger);
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
    // Only where a focus ring shows, which is to say: only for the keyboard, the
    // one input that has neither hover nor a click to open this with. It also
    // keeps out the focus a browser restores to the page on its own — returning to
    // a tab is not a request to see anything.
    const el = e.currentTarget as Element;
    if (this.#holding(id) || !focusIsVisible(el)) return;
    this.openTip(id, el);
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
    if (e.key !== "Escape") return;
    this.langMenu = null;
    this.settingsMenu = null;
    this.omittedPanel = null;
    this.closeTip();
    void this.#returnFocus();
  };

  /** Hand the focus back to the control that opened the overlay — but only where
   *  closing it is what cost the focus its home.
   *
   *  Waiting for the DOM to settle is what makes that answerable: an element
   *  inside a popover that has just gone leaves the focus on `<body>`, and
   *  nothing else here does. So a reader who was only hovering a marker keeps
   *  their focus where it was, and one who was inside the menu gets it back. */
  async #returnFocus(): Promise<void> {
    const el = this.#opener;
    this.#opener = null;
    if (!el) return;
    await tick();
    // A list can rerender under a panel and take its trigger with it; there is
    // nothing to return to then.
    if (el.isConnected && document.activeElement === document.body) el.focus();
  }
}

/** Whether this element is showing a focus ring: true when the keyboard put the
 *  focus there, false for a click and for focus an engine restores by itself.
 *
 *  `matches` throws on a selector it doesn't know, and an engine too old for
 *  `:focus-visible` loses nothing by saying yes — it goes back to opening on any
 *  focus, which is what every engine did before this. */
function focusIsVisible(el: Element): boolean {
  try {
    return el.matches(":focus-visible");
  } catch {
    return true;
  }
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
