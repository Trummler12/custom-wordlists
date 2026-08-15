<script lang="ts">
  import { lang } from "../../state/lang.svelte";
  import { topics } from "../../state/topics.svelte";
  import CategoryNode from "./CategoryNode.svelte";
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
  </section>
{/if}
