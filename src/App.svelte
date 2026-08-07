<script lang="ts">
  import { onMount } from "svelte";
  import { lang } from "./state/lang.svelte";
  import { overlays } from "./state/overlays.svelte";
  import { topics } from "./state/topics.svelte";
  import PageHeader from "./components/layout/PageHeader.svelte";
  import SiteFooter from "./components/layout/SiteFooter.svelte";
  import OutputPanel from "./components/output/OutputPanel.svelte";
  import TopicTree from "./components/topics/TopicTree.svelte";

  onMount(async () => {
    await topics.init();
    // Only once the manifest is there, as before: a failed load keeps the error
    // message in English rather than resolving a language nobody can act on.
    if (!topics.error) lang.init();
  });
</script>

<!-- One pair of window handlers for the whole app: both overlays close the same
     way, and this is also where the last pointer type is recorded. -->
<svelte:window onpointerdown={overlays.onPointerDown} onkeydown={overlays.onKeyDown} />

<main>
  <!-- Two columns, stacking on narrow screens; one column while there is nothing
       to show beside the topics. The document scrolls as a whole and the output
       panel is sticky, so the header sits in the left column rather than above
       both — that is what lets the panel span the full viewport height. -->
  <div class="layout" class:single={!topics.ready}>
    <div class="col-topics">
      <PageHeader />
      <TopicTree />
    </div>

    {#if topics.ready}
      <OutputPanel />
    {/if}
  </div>

  <SiteFooter />
</main>
