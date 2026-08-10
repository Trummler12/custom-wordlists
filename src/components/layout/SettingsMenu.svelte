<script lang="ts">
  import { lang } from "../../state/lang.svelte";
  import { overlays } from "../../state/overlays.svelte";
  import { settings } from "../../state/settings.svelte";
  import TipMarker from "../common/TipMarker.svelte";
  import TipNote from "../common/TipNote.svelte";

  // Two instances, like the language picker it sits beside: one per layout, each
  // with its own open state.
  let { id }: { id: string } = $props();

  // The English toggles never appear while the interface is English. The setting
  // stays settable anyway — the language is going to change, and a control that
  // greys out under you explains nothing — and says why with the same ⚠️ a topic
  // row uses for a language it can't vouch for.
  const moot = $derived(lang.current === "en");
  const tipId = $derived(`setting-english-${id}`);
</script>

<div class="settings-picker">
  <button
    type="button"
    class="lang-btn"
    aria-haspopup="dialog"
    aria-expanded={overlays.settingsMenu === id}
    aria-label={lang.ui.settings}
    onclick={() => overlays.toggleSettingsMenu(id)}
  >⚙️</button>
  {#if overlays.settingsMenu === id}
    <div class="settings-menu" role="group" aria-label={lang.ui.settings}>
      <div class="setting-row">
        <label class="setting">
          <input
            type="checkbox"
            checked={settings.showEnglishToggle}
            onchange={(e) => settings.setShowEnglishToggle(e.currentTarget.checked)}
          />
          <span>{lang.ui.showEnglishToggle}</span>
        </label>
        <!-- Outside the label, as on a topic row: inside it, opening the note
             would tick the checkbox. -->
        {#if moot}
          <TipMarker {tipId} icon="⚠️" text={lang.ui.showEnglishToggleEn} />
          <TipNote id={tipId} text={lang.ui.showEnglishToggleEn} />
        {/if}
      </div>
    </div>
  {/if}
</div>
