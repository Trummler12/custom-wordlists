<script lang="ts">
  import { parseMarkup, spanTag } from "./markup";

  // Renders the inline markup a translatable string may carry: `{br}`, `[text](url)` and the
  // paired spans listed in ./markup's SPANS. The tag set and its safety rules live there,
  // which plain.ts reads too; see there for why this is parsed rather than {@html}.
  let { text }: { text: string } = $props();

  const parts = $derived(parseMarkup(text));
</script>

{#each parts as part, i (i)}
  {#if part.kind === "br"}<br />
  {:else if part.kind === "link"}<a
      href={part.href}
      target="_blank"
      rel="noopener noreferrer">{part.text}</a>
  {:else if part.kind === "text"}{part.text}
  {:else}<svelte:element this={spanTag(part.kind)}>{part.text}</svelte:element>
  {/if}{/each}
