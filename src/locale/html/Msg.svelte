<script lang="ts">
  // Renders a locale string that carries inline markup. Only `{br}` so far — see
  // plain.ts, which has to know the same set, and docs/BACKLOG.md for the rest.
  //
  // Why a placeholder and not HTML in the string: Svelte escapes interpolated
  // text, and the alternative ({@html}) would put every translation on the path
  // to the DOM unescaped. A placeholder keeps the strings plain data.
  let { text }: { text: string } = $props();

  const parts = $derived(text.split("{br}"));
</script>

{#each parts as part, i (i)}{#if i}<br />{/if}{part}{/each}
