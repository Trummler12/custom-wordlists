<script lang="ts">
  import { placement, rowPopup } from "../shared/placement";
  import Msg from "../../locale/html/Msg.svelte";
  import { plain } from "../../locale/html/plain";
  import { baseTag } from "../../lib/languages";
  import { variantPairs } from "../../lib/words";
  import { variantFor } from "../../locale/variants";
  import { lang } from "../../state/lang.svelte";
  import { overlays } from "../../state/overlays.svelte";
  import { topics } from "../../state/topics.svelte";

  let { tid }: { tid: string } = $props();

  // None while the list is switched to the secondary language: the per-list answer
  // belongs to the primary language's variant, which the list then doesn't use.
  const variant = $derived(lang.forceSecondary[tid] ? undefined : variantFor(lang.current));
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
      aria-label={plain(lang.ui.language.variant[variant.id])}
      title={plain(lang.ui.language.variant[variant.id])}
      onclick={(e) => overlays.toggleOmittedPanel(id, e.currentTarget)}>{variant.icon}</button
    >
    {#if open}
      <div
        class="popup omitted-panel"
        use:placement={rowPopup(overlays.opener("omitted"))}
        role="group"
        aria-label={plain(lang.ui.language.variant[variant.id])}
      >
        <ul>
          <li>
            <label>
              <input
                type="checkbox"
                checked={lang.variantOnFor(tid)}
                onchange={() => lang.toggleVariantFor(tid)}
              />
              <span><Msg text={lang.ui.language.variant[variant.id]} /></span>
            </label>
          </li>
        </ul>
        <!-- A collapsible rather than a hover: the list can run to hundreds, and the
             panel already handles its own height against the viewport. -->
        <details class="variant-list">
          <summary>
            <Msg text={lang.ui.language.variantDiffers(pairs.length)} /> — <Msg text={lang.ui.language.variantShowList} />
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

<style>
  /* The side-by-side spellings a variant changes, inside the shared 🧹 panel (whose chrome
     comes from TopicRow). Only the variant-specific bits are here. */
  .variant-list > summary {
    cursor: pointer;
    margin-top: 0.35rem;
    opacity: 0.85;
  }
  .variant-list .from {
    opacity: 0.7;
  }
</style>
