<script lang="ts">
  import { baseTag } from "../../lib/languages";
  import { variantPairs } from "../../lib/words";
  import { variantFor } from "../../locale/variants";
  import { lang } from "../../state/lang.svelte";
  import { overlays } from "../../state/overlays.svelte";
  import { topics } from "../../state/topics.svelte";

  let { tid }: { tid: string } = $props();

  const variant = $derived(variantFor(lang.current));
  // Only entries carrying the tag, which is only the ones that deviate — the
  // enrichment writes a variant key nowhere else. So this count is the answer to
  // "does this variant matter here", and the panel appearing at all is half of it.
  const pairs = $derived(
    variant?.perTopic
      ? variantPairs(topics.rawGroups(tid), variant.tag, baseTag(variant.tag))
      : [],
  );
  const id = $derived(`variant-${tid}`);
  const open = $derived(overlays.omittedPanel === id);
</script>

<!-- Shares the 🧹 panel's slot and its styling: they are the same kind of overlay,
     one lists what a list leaves out and the other how it spells things, and only
     one of them should ever be open. -->
{#if variant?.perTopic && pairs.length > 0}
  <div class="omitted-host">
    <button
      type="button"
      class="omitted-btn"
      aria-haspopup="true"
      aria-expanded={open}
      aria-label={lang.ui.language.variant[variant.id]}
      title={lang.ui.language.variant[variant.id]}
      onclick={(e) => overlays.toggleOmittedPanel(id, e.currentTarget)}>{variant.icon}</button
    >
    {#if open}
      <div
        class="omitted-panel"
        class:above={overlays.omittedAbove}
        role="group"
        aria-label={lang.ui.language.variant[variant.id]}
      >
        <ul>
          <li>
            <label>
              <input
                type="checkbox"
                checked={lang.variantOnFor(tid)}
                onchange={() => lang.toggleVariantFor(tid)}
              />
              <span>{lang.ui.language.variant[variant.id]}</span>
            </label>
          </li>
        </ul>
        <!-- A collapsible rather than a hover: the list can run to hundreds, and the
             panel already handles its own height against the viewport. -->
        <details class="variant-list">
          <summary>
            {lang.ui.language.variantDiffers(pairs.length)} — {lang.ui.language.variantShowList}
          </summary>
          <!-- Unkeyed: the list is one fixed array rendered in order, never
               reordered or added to, and the only key available is a spelling —
               which two entries may share, and a duplicate key is an error rather
               than a rendering glitch. -->
          <ul>
            {#each pairs as p}
              <li><span class="from">{p.from}</span> → <span class="to">{p.to}</span></li>
            {/each}
          </ul>
        </details>
      </div>
    {/if}
  </div>
{/if}
