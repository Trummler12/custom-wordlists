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
    {lang.ui.header.taglineBefore}
    <a href="https://skribbl.io" target="_blank" rel="noopener noreferrer">skribbl.io</a>
    {lang.ui.header.taglineAfter}
  </p>
</header>

<style>
  header {
    margin-bottom: 1rem;
  }
  h1 {
    /* No top margin: the browser default would push the title below the output column,
       which starts at --output-gap. */
    margin-top: 0;
    margin-bottom: 0.25rem;
  }
  .title-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  /* The picker slot: shown only when the output stacks below the topics; in the wide layout
     the picker lives in the output head instead. */
  .lang-header-slot {
    display: none;
    margin-left: auto;
    gap: 0.35rem;
  }
  @media (max-width: 50rem) {
    .lang-header-slot {
      display: flex;
    }
  }
  .tagline {
    margin: 0;
    color: var(--muted);
  }
</style>
