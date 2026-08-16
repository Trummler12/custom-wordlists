// The two things that float above the page: the language menu and the tooltip
// notes. They share a module because they share the way they close — one
// pointerdown handler on the window decides for both.
//
// Every method is an arrow property, not a prototype method: these are passed
// straight to event attributes, where a plain method reference would arrive
// without its `this`.

import { tick } from "svelte";
import { lang } from "./lang.svelte";

/** The overlays that remember what opened them, and the container each one lives
 *  in — how Escape works out which of them the focus is sitting in. A tip is
 *  matched on its note rather than a host, since the note is the only part of it
 *  that can hold a focusable thing: the link inviting a romaji correction. */
type OverlayKind = "lang" | "settings" | "omitted" | "tip";
const HOSTS: Record<OverlayKind, string> = {
  lang: ".lang-picker",
  settings: ".settings-picker",
  omitted: ".omitted-host",
  tip: ".tip-note",
};

class OverlayState {
  /** The control that opened each overlay. Escape removes a popover from the
   *  document, and with it the focus that was inside it — a keyboard user then
   *  lands on `<body>` and has to tab back to where they were.
   *
   *  One slot per kind rather than one between them, because they overlap: the
   *  settings menu holds a ⚠️ of its own, and merely moving the cursor across it
   *  opens a note. A single slot would be overwritten by that hover, and Escape
   *  would then aim the focus at a marker inside the menu it had just closed.
   *
   *  Not `$state`: read in event handlers, never rendered. */
  #openers: Record<OverlayKind, HTMLElement | null> = {
    lang: null,
    settings: null,
    omitted: null,
    tip: null,
  };
  #remember(kind: OverlayKind, trigger: Element | null | undefined): void {
    this.#openers[kind] = trigger instanceof HTMLElement ? trigger : null;
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
    if (this.langMenu) this.#remember("lang", trigger);
  };
  chooseLanguage = (l: string): void => {
    this.langMenu = null;
    lang.set(l);
  };

  // --- Settings menu ---------------------------------------------------------

  toggleSettingsMenu = (id: string, trigger?: Element): void => {
    this.settingsMenu = this.settingsMenu === id ? null : id;
    if (this.settingsMenu) this.#remember("settings", trigger);
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
    this.#remember("omitted", trigger);
  };

  // --- Tooltips --------------------------------------------------------------

  /** Show a note, flipping it above its row when there is more room upward. */
  openTip = (id: string, trigger: Element, pinned = false): void => {
    this.tipAbove = opensUpward(trigger);
    this.tip = id;
    this.tipPinned = pinned;
    this.#remember("tip", trigger);
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
    if (!this.#holding(id)) {
      this.openTip(id, e.currentTarget as Element, true);
      return;
    }
    // A second click unpins — but under a cursor the note stays up, because the
    // pointer is still on the marker and that is the very condition that opens it
    // on hover. Closing it here would blink it away and bring it straight back on
    // the next mouse move, which reads as the click having malfunctioned. Moving
    // off the marker closes it, as an unpinned note always does.
    //
    // A finger has no hover to hand it back to, so there a second tap closes.
    if (this.#pointerType === "mouse") this.tipPinned = false;
    else this.closeTip();
  };

  // --- Window handlers -------------------------------------------------------

  /** What kind of pointer is being used right now. Read by `tipClick`, which has
   *  only a `MouseEvent` to go on and needs to know whether there is a hover to
   *  fall back on. This handler runs before every click, so it is always current
   *  without a listener of its own. */
  #pointerType = "mouse";

  onPointerDown = (e: PointerEvent): void => {
    this.#pointerType = e.pointerType;
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
    // Read before anything closes: whichever overlay currently holds the focus is
    // the one about to take it away, and so the one whose trigger it goes back to.
    // Asked of the focus rather than of what happens to be open, because several
    // can be — a note stands open over a menu often enough.
    const back = this.#focusedOverlay();
    this.langMenu = null;
    this.settingsMenu = null;
    this.omittedPanel = null;
    this.closeTip();
    if (back) void returnFocus(back);
  };

  /** The trigger of the overlay the focus is inside, or null when the focus is
   *  somewhere Escape isn't about to disturb — on a trigger itself, most often,
   *  which needs nothing done to it. */
  #focusedOverlay(): HTMLElement | null {
    const active = document.activeElement as Element | null;
    if (!active?.closest) return null;
    for (const kind of Object.keys(HOSTS) as OverlayKind[]) {
      if (active.closest(HOSTS[kind])) return this.#openers[kind];
    }
    return null;
  }
}

/** Hand an element the focus, but only where closing an overlay is what cost the
 *  focus its home.
 *
 *  Waiting for the DOM to settle is what makes that answerable: an element inside
 *  a popover that has just gone leaves the focus on `<body>`, and nothing else
 *  here does. So a reader whose focus was on the trigger all along keeps it
 *  exactly where it was, without a redundant `focus()` scrolling the row. */
async function returnFocus(el: HTMLElement): Promise<void> {
  await tick();
  // A list can rerender under a panel and take its trigger with it; there is
  // nothing to return to then.
  const active = document.activeElement;
  if (el.isConnected && (!active || active === document.body)) el.focus();
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
