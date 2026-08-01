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
  let selected = $state<Record<string, boolean>>({}); // flat groups only, key `${topicId}:${groupId}`
  // Per-group fame depth (top-N tiers), keyed like `selected`. Absent/0 = unselected.
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
      const data = await loadTopic(t.category, t.id, pickFile(t));
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

  const groupsOf = (t: TopicSummary): Group[] => topicData[t.id]?.groups ?? [];

  // --- Selection model -------------------------------------------------------
  // Tiered groups are represented purely by depthByGroup[k] (0…tierCount);
  // flat `words` groups keep the boolean selected[k]. Every parent state below
  // (group full/partial, topic, category) is derived from these two, so moving
  // a slider rolls up to the topic and category checkboxes with no extra code.

  const tierCount = (g: Group) => g.tiers?.length ?? 0;

  const groupTotal = (g: Group): number =>
    g.tiers ? g.tiers.reduce((n, tier) => n + tier.length, 0) : g.words?.length ?? 0;

  const groupSelCount = (tid: string, g: Group): number => {
    const k = key(tid, g.id);
    if (g.tiers) {
      const d = depthByGroup[k] ?? 0;
      let n = 0;
      for (let i = 0; i < d; i++) n += g.tiers[i].length;
      return n;
    }
    return selected[k] ? g.words?.length ?? 0 : 0;
  };

  const groupFull = (tid: string, g: Group): boolean => {
    const k = key(tid, g.id);
    return g.tiers ? (depthByGroup[k] ?? 0) === g.tiers.length : !!selected[k];
  };
  const groupPartial = (tid: string, g: Group): boolean => {
    if (!g.tiers) return false;
    const d = depthByGroup[key(tid, g.id)] ?? 0;
    return d > 0 && d < g.tiers.length;
  };

  const topicSelCount = (t: TopicSummary): number =>
    groupsOf(t).reduce((n, g) => n + groupSelCount(t.id, g), 0);
  const topicFull = (t: TopicSummary): boolean => {
    const gs = groupsOf(t);
    return gs.length > 0 && gs.every((g) => groupFull(t.id, g));
  };
  const topicPartial = (t: TopicSummary): boolean =>
    topicSelCount(t) > 0 && !topicFull(t);

  const catTotal = (ts: TopicSummary[]) => ts.reduce((n, t) => n + t.wordCount, 0);
  const catSel = (ts: TopicSummary[]) => ts.reduce((n, t) => n + topicSelCount(t), 0);
  const catFull = (ts: TopicSummary[]) => ts.every(topicFull);
  const catPartial = (ts: TopicSummary[]) => catSel(ts) > 0 && !catFull(ts);

  // Snap-dot indices for a tiered group's slider: 0…tierCount.
  const snapIndices = (g: Group) =>
    Array.from({ length: tierCount(g) + 1 }, (_, i) => i);

  function setGroup(tid: string, g: Group, on: boolean) {
    const k = key(tid, g.id);
    if (g.tiers) depthByGroup[k] = on ? g.tiers.length : 0;
    else selected[k] = on;
  }
  function setTopic(t: TopicSummary, on: boolean) {
    for (const g of groupsOf(t)) setGroup(t.id, g, on);
  }

  function toggleGroup(tid: string, g: Group) {
    setGroup(tid, g, !groupFull(tid, g)); // full/partial → clear, empty → full
  }
  async function toggleTopic(t: TopicSummary) {
    const data = topicData[t.id] ?? (await ensureLoaded(t));
    if (!data) return;
    setTopic(t, !topicFull(t));
  }
  async function toggleCategory(ts: TopicSummary[]) {
    const on = !catFull(ts);
    for (const t of ts) {
      const data = topicData[t.id] ?? (await ensureLoaded(t));
      if (data) setTopic(t, on);
    }
  }

  // Group topics by their category path for the tree (topics keep manifest order).
  const byCategory = $derived.by(() => {
    const map = new Map<string, TopicSummary[]>();
    for (const t of topics) {
      const list = map.get(t.category) ?? [];
      list.push(t);
      map.set(t.category, list);
    }
    return [...map.entries()];
  });

  const titleCase = (seg: string) =>
    seg.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const formatCategory = (c: string) =>
    c === "" ? "Uncategorized" : c.split("/").map(titleCase).join(" / ");

  // Aggregate selected groups' words (top-N tiers), de-duplicated, manifest order.
  const merged = $derived.by(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const t of topics) {
      const data = topicData[t.id];
      if (!data) continue;
      for (const g of data.groups) {
        const k = key(t.id, g.id);
        let words: string[];
        if (g.tiers) {
          const d = depthByGroup[k] ?? 0;
          if (d <= 0) continue;
          words = g.tiers.slice(0, d).flat();
        } else {
          if (!selected[k]) continue;
          words = g.words ?? [];
        }
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
  // Counter only renders when merged.length > 0, so this needs no empty-guard.
  const belowMin = $derived(included.length < SKRIBBL.minWords);
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
        {#each byCategory as [category, catTopics] (category)}
          <label class="category">
            <input
              type="checkbox"
              checked={catFull(catTopics)}
              use:setIndeterminate={catPartial(catTopics)}
              onchange={() => toggleCategory(catTopics)}
            />
            <h3 class="category-title">{formatCategory(category)}</h3>
            <span class="meta">{catSel(catTopics)} of {catTotal(catTopics)} words</span>
          </label>
          <ul>
            {#each catTopics as t (t.id)}
            <li class="topic-item">
              <div class="topic-row">
                <button
                  type="button"
                  class="expander"
                  aria-expanded={!!expanded[t.id]}
                  aria-label={(expanded[t.id] ? "Collapse " : "Expand ") + t.title}
                  onclick={() => toggleExpand(t)}
                >
                  {expanded[t.id] ? "▾" : "▸"}
                </button>
                <label class="topic">
                  <input
                    type="checkbox"
                    checked={topicFull(t)}
                    use:setIndeterminate={topicPartial(t)}
                    onchange={() => toggleTopic(t)}
                  />
                  <span class="icon" aria-hidden="true">{t.icon ?? "•"}</span>
                  <span class="title">{t.title}</span>
                  <span class="meta">
                    {#if loadingById[t.id] && !topicData[t.id]}loading…{:else}{topicSelCount(t)} of {t.wordCount} words{/if}
                  </span>
                </label>
              </div>

              {#if expanded[t.id] && topicData[t.id]}
                <ul class="groups">
                  {#each groupsOf(t) as g (g.id)}
                    {@const k = key(t.id, g.id)}
                    <li>
                      <label class="group">
                        <input
                          type="checkbox"
                          checked={groupFull(t.id, g)}
                          use:setIndeterminate={groupPartial(t.id, g)}
                          onchange={() => toggleGroup(t.id, g)}
                        />
                        <span class="title">{g.title}</span>
                        <span class="meta">{groupSelCount(t.id, g)} of {groupTotal(g)} words</span>
                      </label>
                      {#if g.tiers && g.tiers.length > 1}
                        <div class="group-depth">
                          <input
                            class="depth-range"
                            type="range"
                            min="0"
                            max={g.tiers.length}
                            value={depthByGroup[k] ?? 0}
                            aria-label={`Fame depth for ${g.title} (${depthByGroup[k] ?? 0} of ${g.tiers.length} tiers)`}
                            oninput={(e) => (depthByGroup[k] = +e.currentTarget.value)}
                          />
                          <div class="snap-dots" aria-hidden="true">
                            {#each snapIndices(g) as i (i)}
                              <span class="snap-dot" class:on={i <= (depthByGroup[k] ?? 0)}></span>
                            {/each}
                          </div>
                        </div>
                      {/if}
                    </li>
                  {/each}
                </ul>
              {/if}
            </li>
            {/each}
          </ul>
        {/each}
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
