<script lang="ts">
  import { AUTO, lang } from "../../state/lang.svelte";
  import { UI_LANGS } from "../../locale";
  import { variantFor } from "../../locale/variants";
  import { plain } from "../../locale/html/plain";
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

  // The selected language's second way of being written, if it has one. Its whole
  // existence is language-specific, so it appears and vanishes with the picker.
  const variant = $derived(variantFor(lang.current));

  // A setting that exists for one language and no other is easy never to notice,
  // and there is nowhere else it could live. So the gear says so — briefly, once,
  // each time a language with one is selected.
  let nudge = $state(false);
  $effect(() => {
    // Cleared before anything else. Leaving it set when the new language has no
    // variant latches the class on, and a class that never comes off never goes
    // back on — after one badly timed switch the gear would never blink again.
    nudge = false;
    if (!variant) return;
    // Back on a frame later rather than at once, for the same reason: an animation
    // restarts only if its class actually left. Spanish straight to Japanese would
    // otherwise blink once for the two of them.
    const start = requestAnimationFrame(() => (nudge = true));
    const stop = setTimeout(() => (nudge = false), 1600);
    return () => {
      cancelAnimationFrame(start);
      clearTimeout(stop);
    };
  });

  /** Hold the menu still — its width *and* where it sits — for as long as it is
   *  open. Height is free to move: the menu hangs from a fixed top edge, so only
   *  its bottom travels.
   *
   *  Two separate things move it, and neither is the menu's own doing. Changing
   *  the interface language rewrites the labels inside it, and a box sized to its
   *  content is anchored on the right, so every pixel it gains comes off the left.
   *  It also rewrites the *Copy* button beside the ⚙️, which shifts the button,
   *  which is what the menu is positioned against — the same shift the button's
   *  own "Copied!" produces. So rather than react to the causes, the menu watches
   *  where its anchor actually is and cancels any drift with an equal `right`
   *  offset.
   *
   *  A viewport resize releases both: the pin exists to keep the box under the
   *  cursor that is using it, and holding a stale width across a real layout
   *  change would be the bug rather than the fix. */
  function pinBox(node: HTMLElement) {
    const anchor = node.parentElement;
    if (!anchor) return;
    let left = 0;
    let viewport = window.innerWidth;
    let frame = 0;

    const baseline = () => {
      node.style.width = "";
      node.style.right = "";
      node.style.width = `${node.getBoundingClientRect().width}px`;
      left = anchor.getBoundingClientRect().left;
    };
    const hold = () => {
      if (window.innerWidth !== viewport) {
        viewport = window.innerWidth;
        baseline();
      } else {
        const drift = anchor.getBoundingClientRect().left - left;
        const right = drift ? `${drift}px` : "";
        if (node.style.right !== right) node.style.right = right;
      }
      frame = requestAnimationFrame(hold);
    };

    baseline();
    frame = requestAnimationFrame(hold);
    return { destroy: () => cancelAnimationFrame(frame) };
  }
</script>

<div class="settings-picker">
  <button
    type="button"
    class="lang-btn"
    class:nudge
    aria-haspopup="dialog"
    aria-expanded={overlays.settingsMenu === id}
    aria-label={lang.ui.settings.label}
    onclick={() => overlays.toggleSettingsMenu(id)}
  >⚙️</button>
  {#if overlays.settingsMenu === id}
    <div class="settings-menu" role="group" aria-label={lang.ui.settings.label} use:pinBox>
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
      {#if variant}
        <div class="setting-row">
          <label class="setting">
            <input
              type="checkbox"
              checked={lang.variantOn(lang.current)}
              onchange={() => lang.toggleVariant(lang.current)}
            />
            <!-- `{br}` as a newline rather than a space: a browser tooltip honours
                 one, and two sentences on a line run off the side of the screen. -->
            <span title={plain(lang.ui.language.variantNote[variant.id] ?? "", "\n")}
              >{lang.ui.language.variant[variant.id]}</span
            >
          </label>
        </div>
      {/if}
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
