<script lang="ts">
  import { parseMarkup, spanTag, type StyledPart } from "./markup";

  // Renders the inline markup a translatable string may carry: `{br}`, `[text](url)` and the
  // styled spans (./markup's SPANS plus colours). The tag set and its safety rules live
  // there, which plain.ts reads too; see there for why this is parsed rather than {@html}.
  let { text }: { text: string } = $props();

  const parts = $derived(parseMarkup(text));
</script>

<!-- One element per span name, outer to inner. The browser gives <mark> black text for its
     default yellow, readable in both themes, so a bare {mark} keeps that; with a background
     of its own it inherits the surrounding text colour instead. A text colour sits on an
     inner <span>, below the <mark> that would otherwise override it. -->
{#snippet styled(part: StyledPart, i: number)}
  {#if i < part.names.length}
    {@const own = part.names[i] === "mark" && part.bg}
    <svelte:element
      this={spanTag(part.names[i])}
      style:background-color={own ? part.bg : undefined}
      style:color={own ? "inherit" : undefined}
      >{@render styled(part, i + 1)}</svelte:element
    >
  {:else if part.color}<span style:color={part.color}>{part.text}</span>
  {:else}{part.text}{/if}
{/snippet}

{#each parts as part, i (i)}
  {#if part.kind === "br"}<br />
  {:else if part.kind === "link"}<a
      href={part.href}
      target="_blank"
      rel="noopener noreferrer">{part.text}</a>
  {:else if part.kind === "text"}{part.text}
  {:else}{@render styled(part, 0)}
  {/if}{/each}
