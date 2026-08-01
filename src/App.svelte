<script lang="ts">
  import { onMount } from "svelte";
  import { loadManifest } from "./lib/data";
  import type { TopicSummary } from "./lib/types";

  let topics = $state<TopicSummary[]>([]);
  let error = $state<string | null>(null);
  let loading = $state(true);

  onMount(async () => {
    try {
      topics = (await loadManifest()).topics;
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      loading = false;
    }
  });
</script>

<main>
  <h1>Custom Wordlists</h1>
  <p class="tagline">
    Build custom word lists for
    <a href="https://skribbl.io" target="_blank" rel="noopener noreferrer">skribbl.io</a>
    and similar word games.
  </p>

  {#if loading}
    <p class="status">Loading topics…</p>
  {:else if error}
    <p class="status error">Could not load topics: {error}</p>
  {:else if topics.length === 0}
    <p class="status">No topics available yet.</p>
  {:else}
    <ul class="topics">
      {#each topics as t (t.id)}
        <li class="topic">
          <span class="icon" aria-hidden="true">{t.icon ?? "•"}</span>
          <span class="title">{t.title}</span>
          <span class="meta">
            {t.wordCount} words · {t.groupCount}
            {t.groupCount === 1 ? "group" : "groups"}{#if t.langs.length} · {t.langs.join(", ")}{/if}
          </span>
        </li>
      {/each}
    </ul>
  {/if}
</main>

<style>
  main {
    max-width: 40rem;
    margin: 3rem auto;
    padding: 0 1rem;
  }
  h1 {
    margin-bottom: 0.25rem;
  }
  .tagline {
    margin-top: 0;
    color: #555;
  }
  .status.error {
    color: #b00020;
  }
  .topics {
    list-style: none;
    padding: 0;
    margin: 1.5rem 0 0;
  }
  .topic {
    display: flex;
    align-items: baseline;
    gap: 0.6rem;
    padding: 0.6rem 0.2rem;
    border-bottom: 1px solid #eee;
  }
  .icon {
    font-size: 1.2rem;
  }
  .title {
    font-weight: 600;
  }
  .meta {
    margin-left: auto;
    color: #777;
    font-size: 0.85rem;
  }
</style>
