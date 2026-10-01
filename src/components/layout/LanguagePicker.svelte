<script lang="ts">
  import { flagFor, flagsFor } from "../../locale/flags";
  import { plain } from "../../locale/html/plain";
  import { variantFor, type Variant } from "../../locale/variants";
  import { AUTO, lang } from "../../state/lang.svelte";
  import { overlays } from "../../state/overlays.svelte";
  import { settings } from "../../state/settings.svelte";
  import { pinBox } from "../common/pinBox";
  import TipMarker from "../common/TipMarker.svelte";
  import TipNote from "../common/TipNote.svelte";
  import LanguageSelect from "./LanguageSelect.svelte";

  // Two panels share the languages but each needs its own open/closed state, so
  // the instance identifies itself: the header one shows only in the stacked
  // layout, the output-head one only in the wide one.
  let { id }: { id: string } = $props();

  const ui = $derived(lang.ui.language);
  const open = $derived(overlays.langMenu === id);

  // The secondary switch does nothing while it names the primary language; the
  // setting stays settable anyway (a control that greys out explains nothing) and
  // says why with the ⚠️ a topic row uses.
  const moot = $derived(lang.current === lang.secondary);
  const secondaryFlags = $derived(flagsFor(lang.secondary));
  const shownFlag = $derived(flagFor(lang.secondary, settings.flagType));

  // The language-specific settings: the primary language's variant, and the
  // secondary one's while lists can actually be switched to it.
  const variants = $derived.by(() => {
    const out: { lang: string; v: Variant }[] = [];
    const primary = variantFor(lang.current);
    if (primary) out.push({ lang: lang.current, v: primary });
    const secondary = variantFor(lang.secondary);
    if (secondary && settings.showSecondaryToggle && !moot) out.push({ lang: lang.secondary, v: secondary });
    return out;
  });

  // A setting that exists for one language and no other is easy never to notice.
  // So the 🌐 says so — briefly, once, each time a language with one is selected.
  let nudge = $state(false);
  $effect(() => {
    // Cleared before anything else. Leaving it set when the new language has no
    // variant latches the class on, and a class that never comes off never goes
    // back on — after one badly timed switch the 🌐 would never blink again.
    nudge = false;
    if (!variantFor(lang.current)) return;
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

  const slots = ["primary", "interface", "fallback"] as const;
  const slotValue = (s: (typeof slots)[number]): string =>
    s === "primary" ? lang.current : s === "interface" ? lang.uiPref : lang.fallbackPref;
  const slotPick = (s: (typeof slots)[number], l: string): void =>
    s === "primary" ? lang.set(l) : s === "interface" ? lang.setUiPref(l) : lang.setFallback(l);
</script>

{#if lang.available.length > 1}
  <div class="lang-picker">
    <!-- `aria-haspopup="true"`, not `"dialog"`: what opens is a group of controls
         that never takes the focus and traps nothing, and claiming a dialog
         promises both. -->
    <button
      type="button"
      class="lang-btn"
      class:nudge
      aria-haspopup="true"
      aria-expanded={open}
      aria-label={ui.label(lang.nameInUi(lang.current))}
      onclick={(e) => overlays.toggleLangMenu(id, e.currentTarget)}
    >🌐</button>
    {#if open}
      <div class="lang-panel" role="group" aria-label={ui.panelTitle} use:pinBox>
        <p class="panel-title">{ui.panelTitle}</p>
        <div class="slots">
          {#each slots as s (s)}
            <div class="slot-row">
              <span class="slot-label" id={`${id}-slot-${s}`}>{ui.slot[s]}</span>
              <LanguageSelect
                id={`${id}-${s}`}
                labelledby={`${id}-slot-${s}`}
                value={slotValue(s)}
                onpick={(l) => slotPick(s, l)}
                lead={s === "interface" ? { value: AUTO, label: ui.followPrimary, resolves: lang.uiLang } : undefined}
              />
              <TipMarker tipId={`${id}-hint-${s}`} icon="ℹ️" text={ui.slotHint[s]} />
              <TipNote id={`${id}-hint-${s}`} text={ui.slotHint[s]} />
            </div>
          {/each}
        </div>

        <div class="setting-row rule">
          <label class="setting">
            <input
              id={`${id}-secondary`}
              type="checkbox"
              checked={settings.showSecondaryToggle}
              onchange={(e) => settings.setShowSecondaryToggle(e.currentTarget.checked)}
            />
            <span id={`${id}-secondary-before`}>{ui.showSecondaryBefore}</span>
          </label>
          <!-- Beside the label rather than inside it, so a click on the list never
               ticks the checkbox. The words after it get a label of their own. -->
          <LanguageSelect
            id={`${id}-secondary-lang`}
            labelledby={`${id}-secondary-before ${id}-secondary-after`}
            value={lang.secondary}
            onpick={(l) => lang.setSecondary(l)}
          />
          <label class="setting" for={`${id}-secondary`} id={`${id}-secondary-after`}
            >{ui.showSecondaryAfter}</label
          >
          <TipMarker tipId={`${id}-hint-secondary`} icon="ℹ️" text={ui.showSecondaryHint} />
          <TipNote id={`${id}-hint-secondary`} text={ui.showSecondaryHint} />
          {#if moot}
            <TipMarker tipId={`${id}-moot`} icon="⚠️" text={ui.secondaryMoot} />
            <TipNote id={`${id}-moot`} text={ui.secondaryMoot} />
          {/if}
        </div>
        {#if settings.showSecondaryToggle && secondaryFlags.length > 1}
          <div class="setting-row flag-row" role="radiogroup" aria-labelledby={`${id}-flag-type`}>
            <span id={`${id}-flag-type`}>{ui.flagType}</span>
            {#each secondaryFlags as f (f.type)}
              <label class="setting">
                <input
                  type="radio"
                  name={`${id}-flag-type`}
                  checked={shownFlag?.type === f.type}
                  onchange={() => settings.setFlagType(f.type)}
                />
                <img class="flag" src={f.url} alt="" />
                <span>{ui.flagTypes[f.type]}</span>
              </label>
            {/each}
          </div>
        {/if}

        {#each variants as { lang: l, v }, i (v.id)}
          <div class="setting-row" class:rule={i === 0}>
            <label class="setting">
              <input type="checkbox" checked={lang.variantOn(l)} onchange={() => lang.toggleVariant(l)} />
              <!-- `{br}` as a newline rather than a space: a browser tooltip honours
                   one, and two sentences on a line run off the side of the screen. -->
              <span title={plain(ui.variantNote[v.id] ?? "", "\n")}>{ui.variant[v.id]}</span>
            </label>
          </div>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  .lang-picker {
    position: relative;
  }
  /* The 🌐 button's box (.lang-btn) is shared with SettingsMenu's ⚙️, so it lives in
     app.css; the nudge and the panel it opens are here. Selecting a language that has a
     second way of being written puts a setting in the panel that exists for no other
     language; three blinks say so, since nothing else on screen can. */
  @keyframes nudge {
    0%, 100% { transform: none; }
    50% { transform: scale(1.25); filter: brightness(1.4); }
  }
  .lang-btn.nudge {
    animation: nudge 0.45s ease-in-out 3;
  }
  @media (prefers-reduced-motion: reduce) {
    .lang-btn.nudge {
      animation: none;
    }
  }
  /* Same box as the ⚙️ menu beside it. */
  .lang-panel {
    position: absolute;
    top: calc(100% + 0.25rem);
    right: 0;
    z-index: 10;
    width: max-content;
    max-width: min(24rem, 90vw);
    padding: 0.5rem 0.6rem;
    background: var(--chip-bg);
    border: 1px solid var(--panel-border);
    border-radius: var(--radius);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
    font-size: 0.85rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .panel-title {
    margin: 0;
    font-weight: 600;
  }
  /* The three slots share their columns, so the fields line up whatever the captions'
     lengths. Each row is still a box of its own (subgrid), which its note spans. */
  .slots {
    display: grid;
    grid-template-columns: max-content max-content max-content;
    align-items: center;
    column-gap: 0.4rem;
    row-gap: 0.35rem;
  }
  .slot-row {
    position: relative;
    display: grid;
    grid-column: 1 / -1;
    grid-template-columns: subgrid;
    align-items: center;
  }
  /* One preference and whatever has to be said about it. Positioned, so its note spans
     this row rather than the whole panel. */
  .setting-row {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.35rem;
  }
  .setting {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    cursor: pointer;
  }
  /* A rule over the first row of a new block: the slots, the secondary-language
     switch and the language-specific settings are three separate things. */
  .rule {
    padding-top: 0.5rem;
    border-top: 1px solid var(--panel-border);
  }
  .flag-row {
    column-gap: 0.7rem;
  }
  .flag {
    height: 0.8rem;
    width: auto;
    border-radius: 1px;
  }
</style>
