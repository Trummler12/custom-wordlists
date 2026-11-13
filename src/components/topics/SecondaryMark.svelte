<script lang="ts">
  import { tagChip } from "../../lib/languages";
  import { flagFor } from "../../locale/flags";
  import { lang } from "../../state/lang.svelte";
  import { settings } from "../../state/settings.svelte";

  // What the per-list language switch shows: the secondary language's flag in the
  // reader's preferred kind, or its code where it has no flag at all. Decorative —
  // the button around it carries the name.
  const flag = $derived(flagFor(lang.secondary, settings.flagType));
</script>

{#if flag}<img class="flag" src={flag.url} alt="" />{:else}<span class="code"
    >{tagChip(lang.secondary, lang.available)}</span
  >{/if}

<style>
  /* One height for every flag; the width follows each image's own proportions. */
  .flag {
    display: block;
    height: 0.8rem;
    width: auto;
    border-radius: 1px;
  }
  .code {
    font-size: 0.7rem;
    font-weight: 600;
  }
</style>
