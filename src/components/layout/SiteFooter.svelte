<script lang="ts">
  import type { FooterStrings } from "../../locale";

  // The strings come in as a prop, not from the global `lang` state, so the coverage
  // page (a separate entry that never loads that state) can reuse this in its own
  // interface language. `flow` renders it in-flow (the coverage page wants it at the
  // bottom of its capped content) instead of the main app's fixed viewport-bottom bar.
  let { footer, flow = false }: { footer: FooterStrings; flow?: boolean } = $props();

  const REPO_URL = "https://github.com/Trummler12/custom-wordlists";
</script>

<footer class="site-footer" class:flow>
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
  /* The help side grows to fill the bar and keeps its left edge; the repo link takes only its
     own text — so its hitbox doesn't stretch across the empty half a `flex: 1` gave it — and
     is pushed to the right edge by the help side's growth. */
  .footer-help {
    flex: 1 1 auto;
  }
  .footer-repo {
    flex: 0 0 auto;
    text-align: right;
  }
  .site-footer a {
    color: inherit;
  }
  /* In-flow variant (the coverage page): at the bottom of that page's own capped content
     rather than pinned to the viewport bottom, so it never overlaps the table, and its inner
     box fills the content cap (not the main app's --content-max) — its 1rem side padding then
     lines up with the coverage main's padding. */
  .site-footer.flow {
    position: static;
    height: auto;
    z-index: auto;
  }
  .site-footer.flow .footer-inner {
    max-width: none;
  }
  @media (max-width: 50rem) {
    /* Only the main app's fixed bar un-pins and full-bleeds here; the coverage page's `.flow`
       footer is already in-flow inside its capped .wrap, and the -1rem bleed would push it past
       that wrapper and open a horizontal page scrollbar. */
    .site-footer:not(.flow) {
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
