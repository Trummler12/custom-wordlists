<script lang="ts">
  import Msg from "../../locale/html/Msg.svelte";
  import { overlays } from "../../state/overlays.svelte";

  // The note half of a tooltip; the trigger is whatever element carries the
  // matching `tip-trigger` class and opens `id`. Its parent has to be positioned,
  // since the note stretches across it — see the CSS for why it can't hang off the
  // trigger itself.
  let { id, text }: { id: string; text: string } = $props();
</script>

{#if overlays.tip === id}
  <!-- `tooltip`, not `status`: this is help text the reader asked for, not a live
       update that should interrupt whatever is being read. Screen readers get the
       same text from the trigger's aria-label, so the note is deliberately not
       also wired up as its description. -->
  <p class="tip-note" class:above={overlays.tipAbove} {id} role="tooltip">
    <Msg text={text} />
  </p>
{/if}
