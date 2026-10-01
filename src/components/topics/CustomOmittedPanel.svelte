<script lang="ts">
  import { plain } from "../../locale/html/plain";
  import Msg from "../../locale/html/Msg.svelte";
  import { custom } from "../../state/custom.svelte";
  import { lang } from "../../state/lang.svelte";
  import { output } from "../../state/output.svelte";
  import { overlays } from "../../state/overlays.svelte";

  // The Custom row's 🚫 panel. Unlike a curated list's OmittedPanel it reads no
  // topic file: the rows are computed live from the reader's own input
  // (output.customBreakdown, the same classification the output ran). The length rules
  // are real toggles; the duplicate rows only report — their checkboxes are disabled.
  //
  // Reuses the shared `.omitted-*` classes (app.css) and the `omitted` overlay slot,
  // so the panel styles, opens and dismisses exactly like a topic's.
  const id = "custom-omitted";
  const open = $derived(overlays.omittedPanel === id);

  const b = $derived(output.customBreakdown);
  const hidingTooLong = $derived(!custom.keepTooLong);
  const tooLongTitle = $derived(
    [plain(lang.ui.omitted.tooLongHint(hidingTooLong), "\n"), b.tooLong.samples.join(", ")].join("\n"),
  );
  const sepRules = $derived(custom.outputSeparatorRules);
  const sepTitle = $derived(
    [plain(lang.ui.omitted.separatorHint(sepRules.omit, sepRules.remove), "\n"), b.withSeparator.samples.join(", ")].join("\n"),
  );
  const hidingTooShort = $derived(!custom.keepTooShort);
  const tooShortTitle = $derived(
    [plain(lang.ui.omitted.tooShortHint(hidingTooShort), "\n"), b.tooShort.samples.join(", ")].join("\n"),
  );

  // One line per clause: a native tooltip keeps the newlines, and the save note only concerns
  // duplicates inside one list (saving cleans those, not the ones between lists or topics).
  const dupeTitle = (type: "internal" | "local" | "global", samples: string[]): string =>
    [
      plain(lang.ui.custom.dupesNote, "\n"),
      ...(type === "internal" ? [plain(lang.ui.custom.dupesNoteSave, "\n")] : []),
      ...(samples.length ? [plain(lang.ui.custom.dupesSamples[type], "\n"), samples.join(", ")] : []),
    ].join("\n");

  const anything = $derived(
    b.tooLong.count > 0 || b.tooShort.count > 0 || b.withSeparator.count > 0 || b.internal.count > 0 || b.local.count > 0 || b.global.count > 0,
  );
</script>

{#if anything}
  <div class="omitted-host">
    <button
      type="button"
      class="omitted-btn"
      aria-haspopup="true"
      aria-expanded={open}
      aria-label={plain(lang.ui.omitted.label)}
      title={plain(lang.ui.omitted.label)}
      onclick={(e) => overlays.toggleOmittedPanel(id, e.currentTarget)}>🚫</button
    >
    {#if open}
      <div
        class="omitted-panel"
        class:above={overlays.omittedAbove}
        role="group"
        aria-label={plain(lang.ui.omitted.label)}
      >
        <p class="omitted-title"><Msg text={lang.ui.omitted.title} /></p>
        <ul>
          <!-- Duplicate rows, in the precedence they are classified: within this
               list, across the active custom lists (X3), then against the topics. -->
          {#if b.internal.count > 0}
            <li>
              <label title={dupeTitle("internal", b.internal.samples)}>
                <input type="checkbox" checked disabled />
                <span><Msg text={lang.ui.custom.internalDupes(b.internal.count)} /></span>
              </label>
            </li>
          {/if}
          {#if b.local.count > 0}
            <li>
              <label title={dupeTitle("local", b.local.samples)}>
                <input type="checkbox" checked disabled />
                <span><Msg text={lang.ui.custom.localDupes(b.local.count)} /></span>
              </label>
            </li>
          {/if}
          {#if b.global.count > 0}
            <li>
              <label title={dupeTitle("global", b.global.samples)}>
                <input type="checkbox" checked disabled />
                <span><Msg text={lang.ui.custom.globalDupes(b.global.count)} /></span>
              </label>
            </li>
          {/if}
          <!-- The real toggles: unchecking one keeps those items in the output (an
               over-long one reported through output.overlong), like a topic's rules. -->
          {#if b.tooLong.count > 0}
            <li>
              <label title={tooLongTitle}>
                <input
                  type="checkbox"
                  checked={hidingTooLong}
                  onchange={(e) => custom.setKeepTooLong(!e.currentTarget.checked)}
                />
                <span><Msg text={lang.ui.omitted.tooLong(b.tooLong.count, custom.lengths.limits.max)} /></span>
              </label>
            </li>
          {/if}
          {#if b.withSeparator.count > 0}
            <li>
              <label title={sepTitle}>
                <input type="checkbox" checked={sepRules.omit} onchange={() => custom.toggleSeparatorRule()} />
                <span><Msg text={lang.ui.omitted.separatorIn(b.withSeparator.count, sepRules.sep, sepRules.remove)} /></span>
              </label>
            </li>
          {/if}
          {#if b.tooShort.count > 0}
            <li>
              <label title={tooShortTitle}>
                <input
                  type="checkbox"
                  checked={hidingTooShort}
                  onchange={(e) => custom.setKeepTooShort(!e.currentTarget.checked)}
                />
                <span><Msg text={lang.ui.omitted.tooShort(b.tooShort.count, custom.lengths.limits.min)} /></span>
              </label>
            </li>
          {/if}
        </ul>
      </div>
    {/if}
  </div>
{/if}
