<script lang="ts">
  // Why a placeholder and not HTML in the string: Svelte escapes interpolated
  // text, and the alternative ({@html}) would put every translation on an
  // unescaped path to the DOM. A placeholder keeps the strings plain data.
  //
  // Only `{br}` so far. plain.ts has to know the same set; docs/BACKLOG.md has
  // the tags that might follow.
  let { text }: { text: string } = $props();

  const parts = $derived(text.split("{br}"));
</script>

{#each parts as part, i (i)}{#if i}<br />{/if}{part}{/each}
