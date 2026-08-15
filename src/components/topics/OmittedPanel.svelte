<script lang="ts">
  import { baseTag, splitName } from "../../lib/languages";
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
  // The language the entries are missing, named in the interface language —
  // the two can differ, and the row is about the former.
  const missing = $derived(splitName(lang.nameInUi(baseTag(lang.contentLang(tid)))));

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
      aria-haspopup="true"
      aria-expanded={open}
      aria-label={lang.ui.omitted.label}
      title={lang.ui.omitted.label}
      onclick={(e) => overlays.toggleOmittedPanel(id, e.currentTarget)}>🧹</button
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
          {#each rules as rule (rule.id)}
            {@const omitting = isOmitting(rule)}
            <li>
              <label title={rule.locked ? lang.ui.omitted.locked : lang.ui.omitted.toggle(omitting)}>
                <input
                  type="checkbox"
                  checked={omitting}
                  disabled={rule.locked}
                  onchange={() => settings.toggleOmission(tid, group.id, rule.id)}
                />
                <!-- Through Msg: a reason may carry a link to what was left out,
                     which is the whole reason it is worth reading. -->
                <span><Msg text={resolveStr(rule.reason, lang.uiLang)} /></span>
              </label>
            </li>
          {/each}
          {#if unknown > 0}
            <li>
              <label title={lang.ui.omitted.unknownHint(hidingUnknown)}>
                <input
                  type="checkbox"
                  checked={hidingUnknown}
                  onchange={() => settings.toggleOmission(tid, group.id, UNKNOWN_RULE)}
                />
                <span>{lang.ui.omitted.unknown(unknown, ...missing)}</span>
              </label>
            </li>
          {/if}
        </ul>
      </div>
    {/if}
  </div>
{/if}
