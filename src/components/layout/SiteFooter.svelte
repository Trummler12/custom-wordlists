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
