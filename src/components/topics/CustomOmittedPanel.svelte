<script lang="ts">
  import { SKRIBBL } from "../../lib/skribbl";
  import { custom } from "../../state/custom.svelte";
  import { lang } from "../../state/lang.svelte";
  import { output } from "../../state/output.svelte";
  import { overlays } from "../../state/overlays.svelte";

  // The Custom row's 🚫 panel. Unlike a curated list's OmittedPanel it reads no
  // topic file: the rows are computed live from the reader's own input
  // (output.customBreakdown, the same classification the output ran). The >32 rule
  // is a real toggle; the duplicate rows only report — their checkboxes are disabled.
  //
  // Reuses the shared `.omitted-*` classes (app.css) and the `omitted` overlay slot,
  // so the panel styles, opens and dismisses exactly like a topic's.
  const id = "custom-omitted";
  const open = $derived(overlays.omittedPanel === id);

  const b = $derived(output.customBreakdown);
  const hidingTooLong = $derived(!custom.keepTooLong);
  const tooLongTitle = $derived(
    [lang.ui.omitted.tooLongHint(hidingTooLong), b.tooLong.samples.join(", ")].join("\n"),
  );
  const dupeTitle = (samples: string[]): string =>
    samples.length ? [lang.ui.custom.dupesHint, samples.join(", ")].join("\n") : lang.ui.custom.dupesHint;

  const anything = $derived(
    b.tooLong.count > 0 || b.internal.count > 0 || b.local.count > 0 || b.global.count > 0,
  );
</script>

{#if anything}
  <div class="omitted-host">
    <button
      type="button"
      class="omitted-btn"
      aria-haspopup="true"
      aria-expanded={open}
      aria-label={lang.ui.omitted.label}
      title={lang.ui.omitted.label}
      onclick={(e) => overlays.toggleOmittedPanel(id, e.currentTarget)}>🚫</button
    >
    {#if open}
      <div
        class="omitted-panel"
        class:above={overlays.omittedAbove}
        role="group"
        aria-label={lang.ui.omitted.label}
      >
        <p class="omitted-title">{lang.ui.omitted.title}</p>
        <ul>
          <!-- Duplicate rows, in the precedence they are classified: within this
               list, across the active custom lists (X3), then against the topics. -->
          {#if b.internal.count > 0}
            <li>
              <label title={dupeTitle(b.internal.samples)}>
                <input type="checkbox" checked disabled />
                <span>{lang.ui.custom.internalDupes(b.internal.count)}</span>
              </label>
            </li>
          {/if}
          {#if b.local.count > 0}
            <li>
              <label title={dupeTitle(b.local.samples)}>
                <input type="checkbox" checked disabled />
                <span>{lang.ui.custom.localDupes(b.local.count)}</span>
              </label>
            </li>
          {/if}
          {#if b.global.count > 0}
            <li>
              <label title={dupeTitle(b.global.samples)}>
                <input type="checkbox" checked disabled />
                <span>{lang.ui.custom.globalDupes(b.global.count)}</span>
              </label>
            </li>
          {/if}
          <!-- The one real toggle: unchecking it keeps the over-long items in the
               output (reported through output.overlong), like a topic's ✂️ rule. -->
          {#if b.tooLong.count > 0}
            <li>
              <label title={tooLongTitle}>
                <input
                  type="checkbox"
                  checked={hidingTooLong}
                  onchange={(e) => custom.setKeepTooLong(!e.currentTarget.checked)}
                />
                <span>{lang.ui.omitted.tooLong(b.tooLong.count, SKRIBBL.maxWordLen)}</span>
              </label>
            </li>
          {/if}
        </ul>
      </div>
    {/if}
  </div>
{/if}
