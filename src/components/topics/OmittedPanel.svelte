<script lang="ts">
  import { allRules, isOnByDefault, UNKNOWN_RULE } from "../../lib/omitted";
  import type { Group, Omission } from "../../lib/types";
  import { resolveStr } from "../../lib/words";
  import Msg from "../../locale/html/Msg.svelte";
  import { lang } from "../../state/lang.svelte";
  import { overlays } from "../../state/overlays.svelte";
  import { settings } from "../../state/settings.svelte";

  let { tid, group }: { tid: string; group: Group } = $props();

  const rules = $derived(allRules(group));
  const id = $derived(`omitted-${tid}-${group.id}`);
  const open = $derived(overlays.omittedPanel === id);

  // Set by `visibleGroup`, and only in a language the list is missing names in —
  // so this row appears exactly where there is something to report. It reads as one
  // more thing the list leaves out, because in effect that is what it is.
  const unknown = $derived(group.unknownCount ?? 0);
  const hidingUnknown = $derived(!settings.isToggled(tid, group.id, UNKNOWN_RULE));

  // Ticked means "currently left out". An `omitted` rule starts ticked and an
  // `omittable` one doesn't, so the stored flip is the same bit either way — and
  // a locked rule is ticked whatever the reader once chose.
  const isOmitting = (r: Omission) =>
    r.locked || isOnByDefault(group, r) !== settings.isToggled(tid, group.id, r.id);
</script>

{#if rules.length > 0 || unknown > 0}
  <div class="omitted-host">
    <button
      type="button"
      class="omitted-btn"
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-label={lang.ui.omittedLabel}
      title={lang.ui.omittedLabel}
      onclick={() => overlays.toggleOmittedPanel(id)}>🧹</button
    >
    {#if open}
      <div class="omitted-panel" role="group" aria-label={lang.ui.omittedLabel}>
        <p class="omitted-title">{lang.ui.omittedTitle}</p>
        <ul>
          {#each rules as rule (rule.id)}
            {@const omitting = isOmitting(rule)}
            <li>
              <label title={rule.locked ? lang.ui.omitLocked : lang.ui.omitToggle(omitting)}>
                <input
                  type="checkbox"
                  checked={omitting}
                  disabled={rule.locked}
                  onchange={() => settings.toggleOmission(tid, group.id, rule.id)}
                />
                <!-- Through Msg: a reason may carry a link to what was left out,
                     which is the whole reason it is worth reading. -->
                <span><Msg text={resolveStr(rule.reason, lang.current)} /></span>
              </label>
            </li>
          {/each}
          {#if unknown > 0}
            <li>
              <label title={lang.ui.omitUnknownHint(hidingUnknown)}>
                <input
                  type="checkbox"
                  checked={hidingUnknown}
                  onchange={() => settings.toggleOmission(tid, group.id, UNKNOWN_RULE)}
                />
                <span>{lang.ui.omitUnknown(unknown)}</span>
              </label>
            </li>
          {/if}
        </ul>
      </div>
    {/if}
  </div>
{/if}
