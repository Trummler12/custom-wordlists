<script lang="ts">
  import { lang } from "../../state/lang.svelte";

  const REPO_URL = "https://github.com/Trummler12/custom-wordlists";
</script>

<footer class="site-footer">
  <!-- Inner box repeats main's content width so the two ends line up with the
       topic column's left edge and the output panel's right edge. -->
  <div class="footer-inner">
    <span class="footer-help">
      {lang.ui.helpOut}
      <a
        href={REPO_URL + "?tab=contributing-ov-file#contributing"}
        target="_blank"
        rel="noopener noreferrer">{lang.ui.contributionGuide}</a
      >{lang.ui.helpOutAfter}
    </span>
    <a
      class="footer-repo"
      href={REPO_URL + "#custom-wordlists"}
      target="_blank"
      rel="noopener noreferrer">{lang.ui.repository}</a
    >
  </div>
</footer>
