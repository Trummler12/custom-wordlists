<script lang="ts">
  import { parseMarkup } from "./markup";

  // Renders the inline markup a translatable string may carry — `{br}`, `[text](url)`,
  // and the `{b}bold{/b}` / `{i}italic{/i}` emphasis. The tag set and its safety rules
  // live in ./markup, which plain.ts reads too; see there for why this is parsed rather
  // than {@html}.
  let { text }: { text: string } = $props();

  const parts = $derived(parseMarkup(text));
</script>

{#each parts as part, i (i)}{#if part.kind === "br"}<br />{:else if part.kind === "link"}<a
      href={part.href}
      target="_blank"
      rel="noopener noreferrer">{part.text}</a
    >{:else if part.kind === "b"}<strong>{part.text}</strong>{:else if part.kind === "i"}<em
    >{part.text}</em>{:else}{part.text}{/if}{/each}
