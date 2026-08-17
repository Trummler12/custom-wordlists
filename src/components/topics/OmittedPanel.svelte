<script lang="ts">
  import { baseTag, splitName } from "../../lib/languages";
  import { allRules, isOnByDefault, TOO_LONG_RULE, UNKNOWN_RULE } from "../../lib/omitted";
  import { SKRIBBL } from "../../lib/skribbl";
  import type { Group, Omission } from "../../lib/types";
  import { groupEntries, overlongForms, resolveStr } from "../../lib/words";
  import Msg from "../../locale/html/Msg.svelte";
  import { lang } from "../../state/lang.svelte";
  import { overlays } from "../../state/overlays.svelte";
  import { selection } from "../../state/selection.svelte";
  import { settings } from "../../state/settings.svelte";

  let { tid, group }: { tid: string; group: Group } = $props();

  const rules = $derived(allRules(group));
  const id = $derived(`omitted-${tid}-${group.id}`);
  const open = $derived(overlays.omittedPanel === id);

  // Set by `visibleGroup`, and only in a language the list is missing names in —
  // so this row appears exactly where there is something to report. It reads as one
  // more thing the list leaves out, because in effect that is what it is.
  //
  // The whole list, not the part the ruler has reached. Scoping it to the
  // selection sounds truer and reads worse: a reader looks through a topic's
  // controls *before* switching it on, so a row that is only there once something
  // is selected is missing at the one moment it was going to be read.
  //
  // What varies with the ruler is said instead — the count is phrased as an upper
  // bound, and the tiers it falls in are named below, which is the part a reader
  // can act on: it says how far down they have to go to meet these entries.
  const byTier = $derived(group.unknownByTier ?? []);
  const unknown = $derived(byTier.reduce((a, b) => a + b, 0));

  // Tier numbers as the ruler counts its stops, from the famous end — however few
  // there are. An unranked list counts as one tier holding everything, the same
  // reading `tierSizes` in lib/fame takes: a reader sees a list and a ruler, not a
  // shape in a file, and there is no telling a one-tier list from a flat one from
  // the outside. So the line is redundant there rather than absent, which is the
  // cheaper of the two ways to be wrong.
  const affected = $derived(
    byTier.map((n, i) => [i + 1, n] as const).filter(([, n]) => n > 0),
  );
  const hidingUnknown = $derived(!settings.isToggled(tid, group.id, UNKNOWN_RULE));

  // Named rather than counted per tier, unlike the row above: these have names —
  // that is the whole trouble with them — so the hint can show which, the way the
  // output counter used to before this became something a reader can switch.
  const tooLong = $derived(
    overlongForms(
      groupEntries(group),
      selection.modeOf(tid, group),
      lang.contentLang(tid),
      lang.derivesRomaji(tid),
      SKRIBBL.maxWordLen,
    ),
  );
  const hidingTooLong = $derived(!settings.isToggled(tid, group.id, TOO_LONG_RULE));
  const tooLongTitle = $derived(
    [lang.ui.omitted.tooLongHint(hidingTooLong), tooLong.join(", ")].join("\n"),
  );
  const unknownTitle = $derived(
    [
      lang.ui.omitted.unknownHint(hidingUnknown),
      ...affected.map(([t, n]) => lang.ui.omitted.unknownTier(t, n)),
    ].join("\n"),
  );
  // The language the entries are missing, named in the interface language —
  // the two can differ, and the row is about the former.
  const missing = $derived(splitName(lang.nameInUi(baseTag(lang.contentLang(tid)))));

  // Ticked means "currently left out". An `omitted` rule starts ticked and an
  // `omittable` one doesn't, so the stored flip is the same bit either way — and
  // a locked rule is ticked whatever the reader once chose.
  const isOmitting = (r: Omission) =>
    r.locked || isOnByDefault(group, r) !== settings.isToggled(tid, group.id, r.id);
</script>

{#if rules.length > 0 || unknown > 0 || tooLong.length > 0}
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
              <label title={unknownTitle}>
                <input
                  type="checkbox"
                  checked={hidingUnknown}
                  onchange={() => settings.toggleOmission(tid, group.id, UNKNOWN_RULE)}
                />
                <span>{lang.ui.omitted.unknown(unknown, ...missing)}</span>
              </label>
            </li>
          {/if}
          {#if tooLong.length > 0}
            <li>
              <label title={tooLongTitle}>
                <input
                  type="checkbox"
                  checked={hidingTooLong}
                  onchange={() => settings.toggleOmission(tid, group.id, TOO_LONG_RULE)}
                />
                <span>{lang.ui.omitted.tooLong(tooLong.length, SKRIBBL.maxWordLen)}</span>
              </label>
            </li>
          {/if}
        </ul>
      </div>
    {/if}
  </div>
{/if}
