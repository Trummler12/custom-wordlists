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
  <!-- `tooltip`, not `status`: help text the reader asked for, not a live update
       that should interrupt whatever is being read. An unranked ruler points its
       aria-describedby at this note; the language warning instead carries the text
       in its own aria-label, where the note is a visual echo. -->
  <p class="tip-note" class:above={overlays.tipAbove} class:pinned={overlays.tipPinned} {id} role="tooltip">
    <!-- Says the note is staying, which is otherwise only discoverable by moving
         the cursor away and seeing what happens. `aria-hidden`: it marks a
         pointer affordance, and the trigger's `aria-expanded` already carries the
         part that matters to a reader who has no pointer. -->
    {#if overlays.tipPinned}<span class="tip-pin" aria-hidden="true">📌</span>{/if}
    <Msg text={text} />
  </p>
{/if}
