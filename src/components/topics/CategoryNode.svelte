<script lang="ts">
  import { setIndeterminate } from "../../lib/dom";
  import { sharedEnglishTopics } from "../../lib/english";
  import { controlledTopics } from "../../lib/rulers";
  import type { CatNode } from "../../lib/tree";
  import { lang } from "../../state/lang.svelte";
  import { selection } from "../../state/selection.svelte";
  import { settings } from "../../state/settings.svelte";
  import { topics } from "../../state/topics.svelte";
  import { sovRules } from "../../lib/matrix";
  import CategoryNode from "./CategoryNode.svelte";
  import CoveragePanel from "./CoveragePanel.svelte";
  import SovereigntyMatrix from "./SovereigntyMatrix.svelte";
  import TopicRow from "./TopicRow.svelte";

  let { node }: { node: CatNode } = $props();

  // Every topic below this node, precomputed with the tree — the checkbox and the
  // counter speak for the whole subtree, not just this level's own topics.
  const all = $derived(node.all);
  const open = $derived(selection.catOpen(node));
  const name = $derived(topics.categoryName(node));
  const id = $derived("cat-" + (node.path.replace(/\//g, "-") || "root"));

  // Topics whose ruler this category governs (this node is their control root).
  // Non-empty only when the category declares hideRulersByDefault; then its row
  // carries a tri-state toggle rolling up over exactly these.
  const governed = $derived(controlledTopics(node.path, all, topics.categories));

  // The lists this category's shared English toggle governs — empty unless it
  // declares sharedEnglishToggle and something below it would actually change.
  const englishGoverned = $derived(
    settings.showEnglishToggle
      ? sharedEnglishTopics(node.path, all, topics.categories, lang.current)
      : [],
  );

  // The Geoguessr coverage control this category syncs (syncControls), commanding
  // every icon-carrying real leaf below at once. From the manifest — no file load,
  // and synth topics are skipped so a country isn't counted through both.
  const coverageTargets = $derived(
    (topics.categories[node.path]?.syncControls ?? []).includes("geoguessr")
      ? all
          .filter((t) => !topics.isSynth(t.id) && t.controls?.["geoguessr"])
          .map((t) => ({ tid: t.id, rules: t.controls!["geoguessr"].map((r) => r.id) }))
      : [],
  );

  // The sovereignty matrix this category syncs, same shape — each rule with its cell.
  const sovTargets = $derived(
    (topics.categories[node.path]?.syncControls ?? []).includes("sovereignty")
      ? all
          .filter((t) => !topics.isSynth(t.id) && t.controls?.["sovereignty"])
          .map((t) => ({ tid: t.id, rules: sovRules(t.controls!["sovereignty"]) }))
      : [],
  );
</script>

<div class="category">
  <button
    type="button"
    class="expander"
    aria-expanded={open}
    aria-controls={`${id}-children`}
    aria-label={lang.ui.tree.toggle(open, name.long)}
    onclick={() => selection.toggleCat(node)}
  >
    {open ? "▾" : "▸"}
  </button>
  <input
    type="checkbox"
    {id}
    checked={selection.catFull(all)}
    use:setIndeterminate={selection.catPartial(all)}
    onchange={() => selection.toggleCategory(all)}
  />
  <h3 class="category-title">
    <label for={id}>
      {#if topics.categoryIcon(node)}<span class="icon" aria-hidden="true"
          title={name.short !== name.long ? name.long : undefined}
          >{topics.categoryIcon(node)}</span
        > {/if}<span title={name.short !== name.long ? name.long : undefined}>{name.short}</span>
    </label>
  </h3>
  {#if englishGoverned.length > 0}
    <button
      type="button"
      class="english-toggle"
      class:on={lang.allForcedEnglish(englishGoverned)}
      class:mixed={lang.someForcedEnglish(englishGoverned)}
      aria-pressed={lang.allForcedEnglish(englishGoverned)
        ? "true"
        : lang.someForcedEnglish(englishGoverned)
          ? "mixed"
          : "false"}
      aria-label={lang.ui.language.useEnglishAll(lang.allForcedEnglish(englishGoverned))}
      title={lang.ui.language.useEnglishAll(lang.allForcedEnglish(englishGoverned))}
      onclick={() => {
        // Same reasoning as the ruler toggle below: a collapsed category shows
        // none of the rows this changes, so open it to show what happened.
        lang.toggleCatEnglish(englishGoverned);
        if (!open) selection.toggleCat(node);
      }}
    >🇬🇧</button>
  {/if}
  {#if governed.length > 0}
    <button
      type="button"
      class="ruler-toggle"
      class:shown={selection.allRulersShown(governed)}
      class:mixed={selection.someRulersHidden(governed)}
      aria-pressed={selection.allRulersShown(governed)
        ? "true"
        : selection.someRulersHidden(governed)
          ? "mixed"
          : "false"}
      aria-label={lang.ui.fame.toggleAll(selection.allRulersShown(governed))}
      title={lang.ui.fame.toggleAll(selection.allRulersShown(governed))}
      onclick={() => {
        // A collapsed category renders none of its topic rows, so a toggle either
        // way leaves nothing visibly changed — open it to show the result (rulers
        // appearing, or gone).
        selection.toggleCatRulers(governed);
        if (!open) selection.toggleCat(node);
      }}
    >📏</button>
  {/if}
  {#if coverageTargets.length > 0}
    <CoveragePanel id={`coverage-${id}`} targets={coverageTargets} />
  {/if}
  {#if sovTargets.length > 0}
    <SovereigntyMatrix id={`sovereignty-${id}`} targets={sovTargets} />
  {/if}
  <!-- The ratio alone, since it reads the same in every language; the sentence it
       stands for is a hover away. The row needs the width for its controls. -->
  <span class="meta" title={lang.ui.tree.wordsOf(selection.catSel(all), selection.catTotal(all))}>
    {selection.catSel(all)}/<span class="total">{selection.catTotal(all)}</span>
  </span>
</div>
{#if open}
  <!-- One nesting level per category, so gaming/pokemon/pokemon sits inside
       gaming/pokemon rather than repeating the whole path. -->
  <div class="cat-children" id={`${id}-children`}>
    {#each node.topics as t (t.id)}
      <TopicRow topic={t} />
    {/each}
    {#each node.children as child (child.path)}
      <CategoryNode node={child} />
    {/each}
  </div>
{/if}
