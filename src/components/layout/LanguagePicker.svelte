<script lang="ts">
  import { lang } from "../../state/lang.svelte";
  import { overlays } from "../../state/overlays.svelte";
  import { tagChip } from "../../lib/languages";

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
      aria-haspopup="true"
      aria-expanded={overlays.langMenu === id}
      aria-label={lang.ui.language.label(lang.nameInUi(lang.current))}
      onclick={(e) => overlays.toggleLangMenu(id, e.currentTarget)}
    >🌐</button>
    {#if overlays.langMenu === id}
      <!-- A list of buttons in a popover, and nothing more. `role="menu"` promises
           the WAI-ARIA menu pattern — arrow keys between items, Home/End, focus
           moving in as it opens — and none of that is implemented here: the
           buttons are reached with Tab, like the buttons they are. Announcing a
           menu and then behaving otherwise is worse for a screen-reader user than
           announcing nothing, so the roles are gone rather than half-kept. -->
      <ul class="lang-menu" aria-label={lang.ui.language.menu}>
        {#each lang.available as l (l)}
          <li>
            <button
              type="button"
              aria-current={l === lang.current ? "true" : undefined}
              class:selected={l === lang.current}
              onclick={() => overlays.chooseLanguage(l)}
              title={l}
            >
              <span class="lang-code">{tagChip(l, lang.available)}</span>
              <span class="lang-name">{lang.name(l)}</span>
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
{/if}
