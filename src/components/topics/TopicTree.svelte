<script lang="ts">
  import { lang } from "../../state/lang.svelte";
  import { topics } from "../../state/topics.svelte";
  import CategoryNode from "./CategoryNode.svelte";
  import CustomTopic from "./CustomTopic.svelte";
  import TopicRow from "./TopicRow.svelte";
</script>

{#if topics.loading}
  <p class="status">{lang.ui.tree.loading}</p>
{:else if topics.error}
  <p class="status error">{lang.ui.tree.loadError(topics.error)}</p>
{:else if topics.all.length === 0}
  <p class="status">{lang.ui.tree.empty}</p>
{:else}
  <section class="topics" aria-label={lang.ui.tree.topics}>
    <h2>{lang.ui.tree.topics}</h2>
    {#each topics.tree.topics as t (t.id)}
      <TopicRow topic={t} />
    {/each}
    {#each topics.tree.children as node (node.path)}
      <CategoryNode {node} />
    {/each}
    <!-- A failed topic load is not fatal: the rest of the tree still works. -->
    {#if topics.topicError}
      <p class="status error">{topics.topicError}</p>
    {/if}
    <!-- The reader's own list, pinned to the foot of the tree (§X). -->
    <CustomTopic />
  </section>
{/if}

<style>
  /* Tree-wide styling owned by the tree root. The rules below reach into the child
     rows (CategoryNode / TopicRow) on purpose — hence `:global` — but stay confined to
     `.topics`, so nothing leaks past the tree. Each row's own layout is in its component.

     The expander column and the word-count meta are shared by both row kinds, so they
     live here rather than being duplicated in each. */

  /* Only the first TOP-LEVEL category hugs the "Topics" heading. Nested first children
     (e.g. Science → Chemistry) keep the normal above-gap so they aren't cramped. */
  .topics > :global(.category):first-of-type {
    margin-top: 0.25rem;
  }
  /* Any list inside the tree (e.g. a panel's) drops the native list chrome. */
  .topics :global(ul) {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .topics :global(.expander) {
    background: none;
    border: none;
    cursor: pointer;
    /* Tighter on the checkbox side only: the outer padding is this small glyph's tap
       area and has to stay. */
    padding: 0 0.1rem 0 0.25rem;
    color: var(--muted-2);
    font-size: 0.9rem;
    line-height: 1;
  }
  /* Same box as the button, minus the arrow — so a topic that can't expand keeps the
     column width a topic that can would occupy. */
  .topics :global(.expander.placeholder) {
    visibility: hidden;
  }
  .topics :global(.meta) {
    margin-left: auto;
    color: var(--muted-2);
    font-size: 0.85rem;
    /* Every digit one width, so the counts below each other line up as a column
       rather than drifting with the number. */
    font-variant-numeric: tabular-nums;
    /* The count is one unit: never let "/38" break onto a second line, and never shrink it
       when the row is tight — the title gives way instead (an ellipsis in each row type). */
    white-space: nowrap;
    flex-shrink: 0;
  }
  /* Right-aligning the row only lines up the right edge; the slash still moves with the
     total's digit count. Reserving four digits and setting the total flush right inside
     them fixes the slash too, leaving the blank width where it reads as breathing room. */
  .topics :global(.meta .total) {
    display: inline-block;
    min-width: 4ch;
    text-align: right;
  }

  /* The two row toggles: 📏 for a fame ruler's visibility, 🇬🇧 for a list's content
     language — shared by category rows (CategoryNode) and topic rows (TopicRow), so they
     sit at the tree root. Both read their state as opacity (off is present but receded),
     so the row keeps its width when one is switched; an emoji can't take a colour, and
     opacity is the only channel — full = shown/on, dim = mixed (category roll-up), faint
     = hidden/off. */
  .topics :global(.ruler-toggle),
  .topics :global(.english-toggle) {
    background: none;
    border: none;
    padding: 0 0.2rem;
    font-size: 0.8rem;
    line-height: 1;
    cursor: pointer;
    opacity: 0.3;
  }
  .topics :global(.ruler-toggle.mixed),
  .topics :global(.english-toggle.mixed) {
    opacity: 0.6;
  }
  .topics :global(.ruler-toggle.shown),
  .topics :global(.english-toggle.on) {
    opacity: 1;
  }
</style>
