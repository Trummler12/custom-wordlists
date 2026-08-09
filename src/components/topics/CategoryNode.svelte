<script lang="ts">
  import { setIndeterminate } from "../../lib/dom";
  import { controlledTopics } from "../../lib/rulers";
  import type { CatNode } from "../../lib/tree";
  import { lang } from "../../state/lang.svelte";
  import { selection } from "../../state/selection.svelte";
  import { topics } from "../../state/topics.svelte";
  import CategoryNode from "./CategoryNode.svelte";
  import TopicRow from "./TopicRow.svelte";

  let { node }: { node: CatNode } = $props();

  // Every topic below this node, precomputed with the tree — the checkbox and the
  // counter speak for the whole subtree, not just this level's own topics.
  const all = $derived(node.all);
  const open = $derived(selection.catOpen(node));
  const id = $derived("cat-" + (node.path.replace(/\//g, "-") || "root"));

  // Topics whose ruler this category governs (this node is their control root).
  // Non-empty only when the category declares hideRulersByDefault; then its row
  // carries a tri-state toggle rolling up over exactly these.
  const governed = $derived(controlledTopics(node.path, all, topics.categories));
</script>

<div class="category">
  <button
    type="button"
    class="expander"
    aria-expanded={open}
    aria-controls={`${id}-children`}
    aria-label={lang.ui.toggle(open, topics.categoryTitle(node))}
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
          >{topics.categoryIcon(node)}</span
        > {/if}{topics.categoryTitle(node)}
    </label>
  </h3>
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
      aria-label={lang.ui.rulerToggleAll(selection.allRulersShown(governed))}
      title={lang.ui.rulerToggleAll(selection.allRulersShown(governed))}
      onclick={() => {
        // A collapsed category renders none of its topic rows, so a toggle either
        // way leaves nothing visibly changed — open it to show the result (rulers
        // appearing, or gone).
        selection.toggleCatRulers(governed);
        if (!open) selection.toggleCat(node);
      }}
    >📏</button>
  {/if}
  <span class="meta">{lang.ui.wordsOf(selection.catSel(all), selection.catTotal(all))}</span>
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
