<script lang="ts" module>
  import type { UIStrings } from "../../locale";

  /** What one rule icon's panel adds to the plain checklist. Every field is optional:
   *  a panel without extras is a heading and one box per rule. */
  type PanelConfig = {
    /** The heading, also the button's aria-label. */
    label: (ui: UIStrings) => string;
    /** Rule ids in visual groups, a wider gap between them; rules not named go last. */
    groups?: string[][];
    /** Rules marked 👎, with the note it opens. */
    notRecommended?: { ids: string[]; note: (ui: UIStrings) => string };
    /** A box on top for the entries no rule covers (only an INCLUDE control has them). */
    base?: (ui: UIStrings) => string;
    /** A box lifting a capped ruler (`extendFrom`) to the whole list. */
    extend?: (ui: UIStrings) => string;
  };

  /** One entry per rule icon that gets an inclusion panel. The ids in `groups` and
   *  `notRecommended` match the builds' rule ids. */
  export const PANELS: Record<string, PanelConfig> = {
    "language-type": {
      label: (ui) => ui.languageType.label,
      groups: [
        ["dead", "extinct", "historical"],
        ["dialect", "dialect-group", "language-group", "language-family"],
        ["constructed", "fictional"],
      ],
      // Terms far less known than their speaker counts.
      notRecommended: {
        ids: ["dialect-group", "language-group", "language-family"],
        note: (ui) => ui.languageType.notRecommended,
      },
      base: (ui) => ui.languageType.base,
      extend: (ui) => ui.languageType.submillion,
    },
    "sport-type": {
      label: (ui) => ui.sportType.label,
    },
  };
</script>

<script lang="ts">
  import { placement, rowPopup } from "../shared/placement";
  import { plain } from "../../locale/html/plain";
  import { allRules, BASE_RULE, EXTEND_RULE, isOnByDefault } from "../../lib/omitted";
  import type { Group, Omission } from "../../lib/types";
  import { resolveReason } from "../../lib/words";
  import Msg from "../../locale/html/Msg.svelte";
  import { lang } from "../../state/lang.svelte";
  import { overlays } from "../../state/overlays.svelte";
  import { selection } from "../../state/selection.svelte";
  import TipMarker from "../shared/TipMarker.svelte";
  import TipNote from "../shared/TipNote.svelte";

  // The inclusion panel, the 🚫 panel's counterpart: one checkbox per rule carrying this
  // icon, ticked = in the list. So an `omitted` rule starts unticked and an `omittable` one
  // ticked, and the rules filter exactly as in the 🚫 panel (the languages' overlapping
  // types filter by union, which lib/omitted.ts handles, not this panel).
  let { tid, group, icon }: { tid: string; group: Group; icon: string } = $props();

  const cfg = $derived(PANELS[icon]);
  const rules = $derived(allRules(group).filter((r) => r.icon === icon));
  const id = $derived(`${icon}-${tid}-${group.id}`);
  const open = $derived(overlays.inclusionPanel === id);
  const label = $derived(cfg.label(lang.ui));

  // The 👎 opens a pinnable note. It is a `local` tip (see overlays): it renders as an overlay
  // above the panel like any tip-note, but a scroll of the panel closes it (its trigger scrolls
  // away under it) while a page scroll keeps it. Its note lives in the host, not the panel, so
  // the panel's `overflow` can't clip it.
  const notRec = $derived(new Set(cfg.notRecommended?.ids ?? []));
  const notRecId = (ruleId: string) => `notrec-${tid}-${ruleId}`;
  const notRecRules = $derived(rules.filter((r) => notRec.has(r.id)));
  const grouped = $derived.by(() => {
    const named = cfg.groups ?? [];
    const rest = rules.filter((r) => !named.flat().includes(r.id));
    return [
      ...named.map((ids) => ids.map((i) => rules.find((r) => r.id === i)).filter((r): r is Omission => !!r)),
      rest,
    ].filter((g) => g.length > 0);
  });

  const countOf = (r: Omission) => (Array.isArray(r.match) ? r.match.length : 1);
  // "Included" is the mirror of `omitting`, which reports whether a rule is hiding.
  const included = (ruleId: string) => !selection.omitting(tid, group, ruleId);
  // The button reads "on" once the reader has changed anything from the default: a rule
  // flipped, the base switched out, or the ruler's cap lifted.
  const active = $derived(
    rules.some((r) => included(r.id) === isOnByDefault(group, r)) ||
      (!!cfg.base && !included(BASE_RULE)) ||
      (!!cfg.extend && group.extendFrom != null && included(EXTEND_RULE)),
  );
</script>

{#snippet box(ruleId: string, text: string, rule?: Omission)}
  <li>
    <label title={plain(lang.ui.languageType.toggle(included(ruleId)))}>
      <input type="checkbox" checked={included(ruleId)} onchange={() => selection.toggleOmission(tid, group, ruleId)} />
      <span
        >{#if rule}<Msg text={lang.ui.omitted.upTo(countOf(rule))} />{" "}{/if}<Msg {text} /></span
      >
      {#if rule && notRec.has(rule.id) && cfg.notRecommended}
        <!-- Empty title so the 👎 keeps its own tip alone: the label's
             "tick to add" title would otherwise show over it too. -->
        <span class="thumb" title="">
          <TipMarker tipId={notRecId(rule.id)} icon="👎" text={cfg.notRecommended.note(lang.ui)} local />
        </span>
      {/if}
    </label>
  </li>
{/snippet}

{#if rules.length > 0}
  <div class="inclusion-host">
    <button
      type="button"
      class="inclusion-btn"
      class:on={active}
      aria-haspopup="true"
      aria-expanded={open}
      aria-label={plain(label)}
      title={plain(label)}
      onclick={(e) => overlays.toggleInclusionPanel(id, e.currentTarget)}>☑️</button
    >
    {#if open}
      <div
        class="popup inclusion-panel"
        use:placement={rowPopup(overlays.opener("inclusion"))}
        role="group"
        aria-label={plain(label)}
        onscroll={overlays.onLocalScroll}
      >
        <p class="inclusion-title"><Msg text={label} /></p>
        <!-- The base, shown by default, on its own so the gap sets it apart from the rules. -->
        {#if cfg.base}
          <ul>{@render box(BASE_RULE, cfg.base(lang.ui))}</ul>
        {/if}
        <!-- The ruler-range box, right under the base rather than at the foot: most rules
             may live below the capped floor, so without it ticking one below would move
             the count by nothing. -->
        {#if cfg.extend && group.extendFrom != null}
          <ul>{@render box(EXTEND_RULE, cfg.extend(lang.ui))}</ul>
        {/if}
        {#each grouped as g, gi (gi)}
          <ul>
            {#each g as rule (rule.id)}
              {@render box(rule.id, resolveReason(rule.reason, lang.uiLang, rule.wd), rule)}
            {/each}
          </ul>
        {/each}
      </div>
    {/if}
    <!-- The 👎 notes: siblings of the panel, not children, so they overlay it (z-order) and
         span the row from the positioned host rather than being clipped by the panel's
         `overflow`. They are `local` tips (see the TipMarkers), closed on a panel scroll. -->
    {#if cfg.notRecommended}
      {#each notRecRules as rule (rule.id)}
        <TipNote id={notRecId(rule.id)} text={cfg.notRecommended.note(lang.ui)} local />
      {/each}
    {/if}
  </div>
{/if}

<style>
  /* The button sits in the row directly, like the 🚫 host it mirrors. */
  .inclusion-host {
    display: contents;
  }
  .inclusion-btn {
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
  /* On when the filter differs from its default, so the row doesn't change width — the
     same opacity-as-state the 📏 and 🇬🇧 toggles use. */
  .inclusion-btn.on,
  .inclusion-btn:hover,
  .inclusion-btn:focus-visible {
    opacity: 1;
  }
  .inclusion-panel {
    font-size: 0.8rem;
    font-weight: 400;
    line-height: 1.35;
  }
  .inclusion-title {
    margin: 0 0 0.35rem;
  }
  .inclusion-panel ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }
  /* The wider gap that sets the visual groups (and the base) apart. */
  .inclusion-panel ul + ul {
    margin-top: 0.7rem;
  }
  .inclusion-panel label {
    display: inline-flex;
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
