<script lang="ts">
  import { onMount } from "svelte";
  import { loadManifest, loadTopic, pickFile, flattenWords } from "./lib/data";
  import type { TopicSummary } from "./lib/types";

  // skribbl's custom-wordlist rules (PLANNING §4/§6.2). Only game preset for now.
  const SKRIBBL = { separator: ",", minWords: 10, maxWordLen: 32, maxTotal: 20000 };

  let topics = $state<TopicSummary[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);

  let selected = $state<Record<string, boolean>>({});
  let wordsById = $state<Record<string, string[]>>({}); // id → flattened words (cache)
  let loadingById = $state<Record<string, boolean>>({});
  let topicError = $state<string | null>(null);

  let copied = $state(false);

  onMount(async () => {
    try {
      topics = (await loadManifest()).topics;
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      loading = false;
    }
  });

  async function toggle(t: TopicSummary) {
    const now = !selected[t.id];
    selected[t.id] = now;
    if (now && !wordsById[t.id] && !loadingById[t.id]) {
      loadingById[t.id] = true;
      topicError = null;
      try {
        wordsById[t.id] = flattenWords(await loadTopic(t.id, pickFile(t)));
      } catch (e) {
        selected[t.id] = false; // roll back a selection we couldn't fulfil
        topicError = e instanceof Error ? e.message : String(e);
      } finally {
        loadingById[t.id] = false;
      }
    }
  }

  // Aggregate selected topics' words in manifest order, de-duplicated.
  const merged = $derived.by(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const t of topics) {
      if (!selected[t.id]) continue;
      for (const w of wordsById[t.id] ?? []) {
        if (!seen.has(w)) {
          seen.add(w);
          out.push(w);
        }
      }
    }
    return out;
  });

  const included = $derived(merged.filter((w) => w.length <= SKRIBBL.maxWordLen));
  const excluded = $derived(merged.filter((w) => w.length > SKRIBBL.maxWordLen));
  const outputText = $derived(included.join(SKRIBBL.separator));
  const charCount = $derived(outputText.length);
  const belowMin = $derived(included.length > 0 && included.length < SKRIBBL.minWords);
  const overMax = $derived(charCount > SKRIBBL.maxTotal);

  async function copy() {
    try {
      await navigator.clipboard.writeText(outputText);
      copied = true;
      setTimeout(() => (copied = false), 1500);
    } catch {
      /* clipboard unavailable (e.g. insecure context) — ignore */
    }
  }

  function selectAll(node: HTMLElement) {
    const range = document.createRange();
    range.selectNodeContents(node);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }
</script>

<main>
  <header>
    <h1>Custom Wordlists</h1>
    <p class="tagline">
      Build custom word lists for
      <a href="https://skribbl.io" target="_blank" rel="noopener noreferrer">skribbl.io</a>
      and similar word games.
    </p>
  </header>

  {#if loading}
    <p class="status">Loading topics…</p>
  {:else if error}
    <p class="status error">Could not load topics: {error}</p>
  {:else if topics.length === 0}
    <p class="status">No topics available yet.</p>
  {:else}
    <div class="layout">
      <section class="topics" aria-label="Topics">
        <h2>Topics</h2>
        <ul>
          {#each topics as t (t.id)}
            <li>
              <label class="topic">
                <input
                  type="checkbox"
                  checked={!!selected[t.id]}
                  onchange={() => toggle(t)}
                />
                <span class="icon" aria-hidden="true">{t.icon ?? "•"}</span>
                <span class="title">{t.title}</span>
                <span class="meta">
                  {#if loadingById[t.id]}loading…{:else}{t.wordCount} words{/if}
                </span>
              </label>
            </li>
          {/each}
        </ul>
        {#if topicError}
          <p class="status error">{topicError}</p>
        {/if}
      </section>

      <section class="output" aria-label="Output">
        <div class="output-head">
          <h2>Output</h2>
          <button type="button" onclick={copy} disabled={included.length === 0}>
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {#if merged.length === 0}
          <p class="status">Select topics to build a list.</p>
        {:else}
          <!-- Read-only per-word chips (not a textarea) so M2 can color words. -->
          <div
            class="chips"
            role="textbox"
            aria-readonly="true"
            aria-label="Generated word list"
            tabindex="0"
            onclick={(e) => selectAll(e.currentTarget)}
            onkeydown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                selectAll(e.currentTarget);
              }
            }}
          >
            {#each included as w (w)}<span class="chip">{w}</span>{/each}
          </div>

          <p class="counter" class:warn={belowMin || overMax}>
            words: {included.length} · chars: {charCount.toLocaleString()} /
            {SKRIBBL.maxTotal.toLocaleString()}
            {#if belowMin}· below skribbl minimum ({SKRIBBL.minWords}){/if}
            {#if overMax}· over the maximum{/if}
          </p>

          {#if excluded.length > 0}
            <p class="status warn">
              {excluded.length} word{excluded.length === 1 ? "" : "s"} excluded
              (longer than {SKRIBBL.maxWordLen} chars): {excluded.join(", ")}
            </p>
          {/if}
        {/if}
      </section>
    </div>
  {/if}
</main>

<style>
  main {
    max-width: 60rem;
    margin: 2.5rem auto;
    padding: 0 1rem;
  }
  h1 {
    margin-bottom: 0.25rem;
  }
  .tagline {
    margin-top: 0;
    color: var(--muted);
  }
  h2 {
    font-size: 1rem;
    margin: 0 0 0.5rem;
  }
  .status.error,
  .warn {
    color: var(--danger);
  }
  .layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    align-items: start;
  }
  @media (max-width: 40rem) {
    .layout {
      grid-template-columns: 1fr;
    }
  }
  .topics ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .topic {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    padding: 0.5rem 0.2rem;
    border-bottom: 1px solid var(--border);
    cursor: pointer;
  }
  .topic .title {
    font-weight: 600;
  }
  .topic .meta {
    margin-left: auto;
    color: var(--muted-2);
    font-size: 0.85rem;
  }
  .output-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .output-head button {
    padding: 0.35rem 0.9rem;
    cursor: pointer;
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    padding: 0.6rem;
    border: 1px solid var(--panel-border);
    border-radius: 0.4rem;
    max-height: 24rem;
    overflow-y: auto;
    cursor: text;
  }
  .chip {
    background: var(--chip-bg);
    color: var(--chip-fg);
    border-radius: 0.3rem;
    padding: 0.1rem 0.45rem;
    font-size: 0.9rem;
  }
  .counter {
    color: var(--muted);
    font-size: 0.85rem;
    margin: 0.6rem 0 0;
  }
  .counter.warn {
    font-weight: 600;
  }
</style>
