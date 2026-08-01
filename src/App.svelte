<script lang="ts">
  import { onMount } from "svelte";
  import { loadManifest, loadTopic, pickFile } from "./lib/data";
  import type { TopicSummary, Topic, Group } from "./lib/types";

  // skribbl's custom-wordlist rules (PLANNING §4/§6.2). Only game preset for now.
  const SKRIBBL = { separator: ",", minWords: 10, maxWordLen: 32, maxTotal: 20000 };

  let topics = $state<TopicSummary[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);

  let topicData = $state<Record<string, Topic>>({}); // id → loaded topic (cache)
  let loadingById = $state<Record<string, boolean>>({});
  let topicError = $state<string | null>(null);

  let expanded = $state<Record<string, boolean>>({});
  let selected = $state<Record<string, boolean>>({}); // key `${topicId}:${groupId}`
  // Per-group fame depth (top-N tiers), keyed like `selected`. Absent = all tiers.
  let depthByGroup = $state<Record<string, number>>({});

  let copied = $state(false);

  const key = (tid: string, gid: string) => `${tid}:${gid}`;

  onMount(async () => {
    try {
      topics = (await loadManifest()).topics;
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      loading = false;
    }
  });

  async function ensureLoaded(t: TopicSummary): Promise<Topic | null> {
    if (topicData[t.id]) return topicData[t.id];
    if (loadingById[t.id]) return null;
    loadingById[t.id] = true;
    topicError = null;
    try {
      const data = await loadTopic(t.id, pickFile(t));
      topicData[t.id] = data;
      return data;
    } catch (e) {
      topicError = e instanceof Error ? e.message : String(e);
      return null;
    } finally {
      loadingById[t.id] = false;
    }
  }

  async function toggleExpand(t: TopicSummary) {
    expanded[t.id] = !expanded[t.id];
    if (expanded[t.id]) await ensureLoaded(t);
  }

  async function toggleTopic(t: TopicSummary) {
    const data = topicData[t.id] ?? (await ensureLoaded(t));
    if (!data) return;
    const all = data.groups.every((g) => selected[key(t.id, g.id)]);
    for (const g of data.groups) selected[key(t.id, g.id)] = !all;
  }

  function toggleGroup(tid: string, gid: string) {
    selected[key(tid, gid)] = !selected[key(tid, gid)];
  }

  const groupsOf = (t: TopicSummary): Group[] => topicData[t.id]?.groups ?? [];
  const allSelected = (t: TopicSummary) => {
    const gs = groupsOf(t);
    return gs.length > 0 && gs.every((g) => selected[key(t.id, g.id)]);
  };
  const someSelected = (t: TopicSummary) =>
    groupsOf(t).some((g) => selected[key(t.id, g.id)]);

  // Effective depth for a tiered group: the slider value, or all tiers if unset.
  const groupDepth = (k: string, tierCount: number) => depthByGroup[k] ?? tierCount;

  // Aggregate selected groups' words (top-N tiers), de-duplicated, manifest order.
  const merged = $derived.by(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const t of topics) {
      const data = topicData[t.id];
      if (!data) continue;
      for (const g of data.groups) {
        const k = key(t.id, g.id);
        if (!selected[k]) continue;
        const words = g.tiers ? g.tiers.slice(0, groupDepth(k, g.tiers.length)).flat() : g.words ?? [];
        for (const w of words) {
          if (!seen.has(w)) {
            seen.add(w);
            out.push(w);
          }
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

  // Reflect a mixed parent-checkbox state (indeterminate is a DOM property).
  function setIndeterminate(node: HTMLInputElement, value: boolean) {
    node.indeterminate = value;
    return { update: (v: boolean) => (node.indeterminate = v) };
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
            <li class="topic-item">
              <div class="topic-row">
                <button
                  type="button"
                  class="expander"
                  aria-expanded={!!expanded[t.id]}
                  aria-label={expanded[t.id] ? "Collapse topic" : "Expand topic"}
                  onclick={() => toggleExpand(t)}
                >
                  {expanded[t.id] ? "▾" : "▸"}
                </button>
                <label class="topic">
                  <input
                    type="checkbox"
                    checked={allSelected(t)}
                    use:setIndeterminate={someSelected(t) && !allSelected(t)}
                    onchange={() => toggleTopic(t)}
                  />
                  <span class="icon" aria-hidden="true">{t.icon ?? "•"}</span>
                  <span class="title">{t.title}</span>
                  <span class="meta">
                    {#if loadingById[t.id] && !topicData[t.id]}loading…{:else}{t.wordCount} words{/if}
                  </span>
                </label>
              </div>

              {#if expanded[t.id] && topicData[t.id]}
                <ul class="groups">
                  {#each groupsOf(t) as g (g.id)}
                    <li>
                      <label class="group">
                        <input
                          type="checkbox"
                          checked={!!selected[key(t.id, g.id)]}
                          onchange={() => toggleGroup(t.id, g.id)}
                        />
                        <span class="title">{g.title}</span>
                        <span class="meta">
                          {#if g.tiers}{g.tiers.length} tiers{:else}{g.words?.length ?? 0} words{/if}
                        </span>
                      </label>
                      {#if g.tiers && g.tiers.length > 1}
                        {@const k = key(t.id, g.id)}
                        <div class="group-depth">
                          <label for="depth-{k}">
                            Fame depth: top {groupDepth(k, g.tiers.length)} of {g.tiers.length} tiers
                          </label>
                          <input
                            id="depth-{k}"
                            type="range"
                            min="1"
                            max={g.tiers.length}
                            value={groupDepth(k, g.tiers.length)}
                            oninput={(e) => (depthByGroup[k] = +e.currentTarget.value)}
                          />
                        </div>
                      {/if}
                    </li>
                  {/each}
                </ul>
              {/if}
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
          <p class="status">Select topics or groups to build a list.</p>
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
