<script lang="ts">
  import { lang } from "../../state/lang.svelte";
  import { overlays } from "../../state/overlays.svelte";

  // Two pickers share the language but each needs its own open/closed state, so
  // the instance identifies itself: the header one shows only in the stacked
  // layout, the output-head one only in the wide one.
  let { id }: { id: string } = $props();
</script>

{#if lang.available.length > 1}
  <div class="lang-picker">
    <button
      type="button"
      class="lang-btn"
      aria-haspopup="menu"
      aria-expanded={overlays.langMenu === id}
      aria-label={lang.ui.language.label(lang.nameInUi(lang.current))}
      onclick={() => overlays.toggleLangMenu(id)}
    >🌐</button>
    {#if overlays.langMenu === id}
      <ul class="lang-menu" role="menu" aria-label={lang.ui.language.menu}>
        {#each lang.available as l (l)}
          <li role="none">
            <button
              type="button"
              role="menuitemradio"
              aria-checked={l === lang.current}
              class:selected={l === lang.current}
              onclick={() => overlays.chooseLanguage(l)}
            >
              <span class="lang-code">{l.toUpperCase()}</span>
              <span class="lang-name">{lang.name(l)}</span>
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
{/if}
