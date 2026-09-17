<script lang="ts">
  import type { FooterStrings } from "../../locale";

  // The strings come in as a prop, not from the global `lang` state, so the coverage
  // page (a separate entry that never loads that state) can reuse this in its own
  // interface language.
  let { footer }: { footer: FooterStrings } = $props();

  const REPO_URL = "https://github.com/Trummler12/custom-wordlists";
</script>

<footer class="site-footer">
  <!-- Inner box repeats main's content width so the two ends line up with the
       topic column's left edge and the output panel's right edge. -->
  <div class="footer-inner">
    <span class="footer-help">
      {footer.helpOut}
      <a
        href={REPO_URL + "?tab=contributing-ov-file#contributing"}
        target="_blank"
        rel="noopener noreferrer">{footer.contributionGuide}</a
      >{footer.helpOutAfter}
    </span>
    <a
      class="footer-repo"
      href={REPO_URL + "#custom-wordlists"}
      target="_blank"
      rel="noopener noreferrer">{footer.repository}</a
    >
  </div>
</footer>

<style>
  /* The repo links. Wide layout pins the bar to the viewport bottom so it stays
     reachable beside the sticky output column (which reserves --footer-h above).
     Stacked layout un-pins it, so it comes to rest below the output block and
     scrolls with the page instead of following the viewport. */
  .site-footer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    /* Above the row-spanning tip-notes (z-index 10): they overlay the next row
       but must stop at this opaque bar rather than paint through it. */
    z-index: 20;
    height: var(--footer-h);
    display: flex;
    align-items: center;
    font-size: 0.85rem;
    color: var(--muted);
    /* Opaque so the scrolling left column passes behind it. `Canvas` is the
       browser's own page background, which follows the color-scheme like the
       rest of the page (body sets no background of its own). */
    background: Canvas;
    border-top: 1px solid var(--border);
  }
  /* Same content box as main, so the ends sit flush with the columns above. */
  .footer-inner {
    width: 100%;
    max-width: var(--content-max);
    margin: 0 auto;
    padding: 0 1rem;
    display: flex;
    /* Single line while the bar is a fixed --footer-h tall — a wrapped second
       line would spill out of it. The stacked layout below re-enables wrapping,
       where the bar grows with its content. */
    flex-wrap: nowrap;
    gap: 0.25rem 1.5rem;
  }
  /* Both halves grow equally, so each keeps its own edge alignment — and still
     does once they wrap onto separate lines, where each spans the full width. */
  .footer-help,
  .footer-repo {
    flex: 1 1 auto;
  }
  .footer-repo {
    text-align: right;
  }
  .site-footer a {
    color: inherit;
  }
  @media (max-width: 50rem) {
    .site-footer {
      position: static;
      height: auto;
      /* Full-bleed border across the narrow viewport, despite main's padding. */
      margin: 1rem -1rem 0;
      padding: 0.6rem 0;
    }
    .footer-inner {
      /* Height is free here, so the two halves may take a line each. */
      flex-wrap: wrap;
    }
  }
</style>
