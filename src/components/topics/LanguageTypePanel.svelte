<script lang="ts">
  import { BASE_RULE, EXTEND_RULE, includeRules } from "../../lib/omitted";
  import type { Group, Omission } from "../../lib/types";
  import { resolveStr } from "../../lib/words";
  import Msg from "../../locale/html/Msg.svelte";
  import { lang } from "../../state/lang.svelte";
  import { overlays } from "../../state/overlays.svelte";
  import { selection } from "../../state/selection.svelte";
  import TipMarker from "../common/TipMarker.svelte";
  import TipNote from "../common/TipNote.svelte";

  // The language-type inclusion panel: one checkbox per Wikidata type the list carries,
  // each default-off, plus a base box for the living-modern languages no type covers. It
  // is an INCLUDE control (see INCLUDE_ICON) — ticking a type folds its languages in, and
  // because the types overlap, an entry shows as soon as ANY of its boxes is on.
  let { tid, group }: { tid: string; group: Group } = $props();

  // The icon rules the list carries, in file order (dead … fictional).
  const rules = $derived(includeRules(group));
  const id = $derived(`language-type-${tid}-${group.id}`);
  const open = $derived(overlays.languageTypePanel === id);

  // The panel's visual groups — a wider gap between them, no gap within. The ids match
  // the build's rule ids; `dialect-group`, `language-group` and `language-family` are the
  // three whose term is far less known than their speaker count, so they carry a 👎.
  const GROUPS = [
    ["dead", "extinct", "historical"],
    ["dialect", "dialect-group", "language-group", "language-family"],
    ["constructed", "fictional"],
  ];
  const NOT_RECOMMENDED = new Set(["dialect-group", "language-group", "language-family"]);
  // The 👎 opens a pinnable note. It is a `local` tip (see overlays): it renders as an overlay
  // above the panel like any tip-note, but a scroll of the panel closes it (its trigger scrolls
  // away under it) while a page scroll keeps it. Its note lives in the host, not the panel, so
  // the panel's `overflow` can't clip it.
  const notRecId = (ruleId: string) => `notrec-${tid}-${ruleId}`;
  const notRecRules = $derived(rules.filter((r) => NOT_RECOMMENDED.has(r.id)));
  const grouped = $derived(
    GROUPS.map((ids) =>
      ids.map((i) => rules.find((r) => r.id === i)).filter((r): r is Omission => r !== undefined),
    ).filter((g) => g.length > 0),
  );

  const countOf = (r: Omission) => (Array.isArray(r.match) ? r.match.length : 1);
  // "Included" is the mirror of `omitting`, which reports whether a rule is hiding: a type
  // whose box is ticked is in the list, the base box ticked keeps the base shown.
  const included = (ruleId: string) => !selection.omitting(tid, group, ruleId);
  // The button reads "on" once the reader has changed anything from the default — a type
  // switched in, the base switched out, or the ruler's <1M cap lifted.
  const active = $derived(
    rules.some((r) => included(r.id)) ||
      !included(BASE_RULE) ||
      (group.extendFrom != null && included(EXTEND_RULE)),
  );
</script>

{#if rules.length > 0}
  <div class="language-type-host">
    <button
      type="button"
      class="language-type-btn"
      class:on={active}
      aria-haspopup="true"
      aria-expanded={open}
      aria-label={lang.ui.languageType.label}
      title={lang.ui.languageType.label}
      onclick={(e) => overlays.toggleLanguageTypePanel(id, e.currentTarget)}>☑️</button
    >
    {#if open}
      <div
        class="language-type-panel"
        class:above={overlays.languageTypeAbove}
        role="group"
        aria-label={lang.ui.languageType.label}
        onscroll={overlays.onLocalScroll}
      >
        <p class="language-type-title">{lang.ui.languageType.label}</p>
        <!-- The base, shown by default, on its own so the gap sets it apart from the types. -->
        <ul>
          <li>
            <label title={lang.ui.languageType.toggle(included(BASE_RULE))}>
              <input
                type="checkbox"
                checked={included(BASE_RULE)}
                onchange={() => selection.toggleOmission(tid, group, BASE_RULE)}
              />
              <span>{lang.ui.languageType.base}</span>
            </label>
          </li>
        </ul>
        {#each grouped as g, gi (gi)}
          <ul>
            {#each g as rule (rule.id)}
              <li>
                <label title={lang.ui.languageType.toggle(included(rule.id))}>
                  <input
                    type="checkbox"
                    checked={included(rule.id)}
                    onchange={() => selection.toggleOmission(tid, group, rule.id)}
                  />
                  <span
                    >{lang.ui.omitted.upTo(countOf(rule))}{" "}<Msg
                      text={resolveStr(rule.reason, lang.uiLang)}
                    /></span
                  >
                  {#if NOT_RECOMMENDED.has(rule.id)}
                    <span class="thumb">
                      <TipMarker
                        tipId={notRecId(rule.id)}
                        icon="👎"
                        text={lang.ui.languageType.notRecommended}
                        local
                      />
                    </span>
                  {/if}
                </label>
              </li>
            {/each}
          </ul>
        {/each}
        <!-- The ruler-range box, apart at the bottom: it lifts the default ≥ 1M cap rather
             than folding a type in, so it reaches the long tail of every stratum at once. -->
        {#if group.extendFrom != null}
          <ul>
            <li>
              <label title={lang.ui.languageType.toggle(included(EXTEND_RULE))}>
                <input
                  type="checkbox"
                  checked={included(EXTEND_RULE)}
                  onchange={() => selection.toggleOmission(tid, group, EXTEND_RULE)}
                />
                <span>{lang.ui.languageType.submillion}</span>
              </label>
            </li>
          </ul>
        {/if}
      </div>
    {/if}
    <!-- The 👎 notes: siblings of the panel, not children, so they overlay it (z-order) and
         span the row from the positioned host rather than being clipped by the panel's
         `overflow`. They are `local` tips (see the TipMarkers), closed on a panel scroll. -->
    {#each notRecRules as rule (rule.id)}
      <TipNote id={notRecId(rule.id)} text={lang.ui.languageType.notRecommended} local />
    {/each}
  </div>
{/if}

<style>
  /* The button sits in the row directly, like the 🚫 host it mirrors. */
  .language-type-host {
    display: contents;
  }
  .language-type-btn {
    display: inline-flex;
    align-items: center;
    background: none;
    border: none;
    padding: 0 0.2rem;
    line-height: 1;
    cursor: pointer;
    font-size: 0.8rem;
    opacity: 0.45;
  }
  /* On when the filter is doing something, so the row doesn't change width — the same
     opacity-as-state the 📏 and 🇬🇧 toggles use. */
  .language-type-btn.on,
  .language-type-btn:hover,
  .language-type-btn:focus-visible {
    opacity: 1;
  }
  /* Stretched across the row rather than hung off the button, as the 🚫 panel is, and for
     the same reason: the trigger sits at an unknown offset. */
  .language-type-panel {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 10;
    max-height: clamp(9rem, calc(40vh - var(--footer-h)), 24rem);
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 0.5rem 0.6rem;
    background: var(--chip-bg);
    border: 1px solid var(--panel-border);
    border-radius: var(--radius);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
    font-size: 0.8rem;
    font-weight: 400;
    line-height: 1.35;
    text-align: left;
    cursor: auto;
  }
  .language-type-panel.above {
    top: auto;
    bottom: 100%;
  }
  .language-type-title {
    margin: 0 0 0.35rem;
  }
  .language-type-panel ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }
  /* The wider gap that sets the visual groups (and the base) apart. */
  .language-type-panel ul + ul {
    margin-top: 0.7rem;
  }
  .language-type-panel label {
    display: flex;
    align-items: baseline;
    gap: 0.45rem;
    cursor: pointer;
  }
  .thumb {
    margin-left: auto;
    padding-left: 0.3rem;
    cursor: help;
  }
</style>
