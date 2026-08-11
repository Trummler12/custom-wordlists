<script lang="ts">
  import { parseMarkup } from "../../lib/markup";

  // Renders the inline markup a translatable string may carry — `{br}` and
  // `[text](url)`. The tag set and its safety rules live in lib/markup, which
  // plain.ts reads too; see there for why this is parsed rather than {@html}.
  let { text }: { text: string } = $props();

  const parts = $derived(parseMarkup(text));
</script>

{#each parts as part, i (i)}{#if part.kind === "br"}<br />{:else if part.kind === "link"}<a
      href={part.href}
      target="_blank"
      rel="noopener noreferrer">{part.text}</a
    >{:else}{part.text}{/if}{/each}
