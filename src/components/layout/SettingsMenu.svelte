<script lang="ts">
  import { AUTO, lang } from "../../state/lang.svelte";
  import { UI_LANGS } from "../../locale";
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
    aria-label={lang.ui.settings.label}
    onclick={() => overlays.toggleSettingsMenu(id)}
  >⚙️</button>
  {#if overlays.settingsMenu === id}
    <div class="settings-menu" role="group" aria-label={lang.ui.settings.label}>
      <div class="setting-row">
        <label class="setting">
          <input
            type="checkbox"
            checked={settings.showEnglishToggle}
            onchange={(e) => settings.setShowEnglishToggle(e.currentTarget.checked)}
          />
          <span>{lang.ui.settings.showEnglish}</span>
        </label>
        <!-- Outside the label, as on a topic row: inside it, opening the note
             would tick the checkbox. -->
        {#if moot}
          <TipMarker {tipId} icon="⚠️" text={lang.ui.settings.showEnglishEn} />
          <TipNote id={tipId} text={lang.ui.settings.showEnglishEn} />
        {/if}
      </div>
      <!-- Only worth showing once there is a choice, the same guard the language
           picker itself uses. -->
      {#if UI_LANGS.length > 1}
        <div class="setting-row">
          <label class="setting">
            <span>{lang.ui.settings.interfaceLang}</span>
            <select
              value={lang.uiPref}
              onchange={(e) => lang.setUiPref(e.currentTarget.value)}
            >
              <option value={AUTO}>{lang.ui.settings.interfaceAuto}</option>
              {#each UI_LANGS as l (l)}
                <option value={l}>{lang.name(l)}</option>
              {/each}
            </select>
          </label>
        </div>
      {/if}
    </div>
  {/if}
</div>
