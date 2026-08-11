<script lang="ts">
  import { lang } from "../../state/lang.svelte";
  import LanguagePicker from "./LanguagePicker.svelte";
  import SettingsMenu from "./SettingsMenu.svelte";
</script>

<!-- Sits in the left column, not above it, so the output panel can span the full
     viewport height from the very top. -->
<header>
  <div class="title-row">
    <h1>Custom Wordlists</h1>
    <!-- Only shown once the output stacks below the topics; in the wide layout
         the picker lives in the output head instead (see app.css). -->
    <div class="lang-header-slot">
      <SettingsMenu id="header" />
      <LanguagePicker id="header" />
    </div>
  </div>
  <p class="tagline">
    {lang.ui.taglineBefore}
    <a href="https://skribbl.io" target="_blank" rel="noopener noreferrer">skribbl.io</a>
    {lang.ui.taglineAfter}
  </p>
</header>
