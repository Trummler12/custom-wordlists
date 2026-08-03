<script lang="ts">
  import { onMount } from "svelte";
  import { loadManifest, loadTopic, pickFile } from "./lib/data";
  import type { TopicSummary, Topic, Group, Word } from "./lib/types";

  type NamesMode = "short" | "long" | "both";

  // ─── Tunables (configuration) ──────────────────────────────────────────────
  // skribbl's custom-wordlist rules (PLANNING §4/§6.2). Only game preset for now.
  const SKRIBBL = { separator: ",", minWords: 10, maxWordLen: 32, maxTotal: 20000 };
  // Fame-depth slider snap spacing: every gap is at least this fraction of an
  // equal step, and the remaining travel is distributed by tier size. Lower =
  // more size-faithful spacing; higher = more even. Range (0, 1).
  const MIN_GAP_RATIO = 0.4;
  // Horizontal inset (px) that keeps the slider's end dots off the rail edges.
  // Must stay in sync with `--inset` in src/styles/app.css.
  const INSET_PX = 8;
  // ────────────────────────────────────────────────────────────────────────────

  let topics = $state<TopicSummary[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);

  let topicData = $state<Record<string, Topic>>({}); // id → loaded topic (cache)
  let loadingById = $state<Record<string, boolean>>({});
  let topicError = $state<string | null>(null);

  let expanded = $state<Record<string, boolean>>({});
  let catExpanded = $state<Record<string, boolean>>({}); // category node open/closed, by path
  let selected = $state<Record<string, boolean>>({}); // flat groups only, key `${topicId}:${groupId}`
  // Per-group fame depth (top-N tiers), keyed like `selected`. Absent/0 = unselected.
  let depthByGroup = $state<Record<string, number>>({});
  // Per-group names mode (only groups with short/long entries show the dropdown).
  let namesMode = $state<Record<string, NamesMode>>({});

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
      const data = await loadTopic(t.category, t.id, pickFile(t), t.flat);
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

  // --- Names mode (short / long / both) --------------------------------------
  // A group's entries are plain strings or { short, long } pairs. A group with
  // any pair shows a per-group Names dropdown; the mode picks which form(s) to
  // emit. Counts and output dedup identical rendered strings (e.g. two "Kyle"s).
  const modeOf = (k: string): NamesMode => namesMode[k] ?? "long";

  function renderEntry(e: Word, mode: NamesMode): string[] {
    if (typeof e === "string") return [e];
    if (mode === "short") return [e.short];
    if (mode === "long") return [e.long];
    return e.short === e.long ? [e.short] : [e.short, e.long];
  }
  const groupHasNames = (g: Group): boolean =>
    (g.tiers ? g.tiers.flat() : g.words ?? []).some((e) => typeof e !== "string");

  /** Count of distinct rendered strings for a list of entries in a mode (no array). */
  function renderCount(entries: Word[], mode: NamesMode): number {
    const seen = new Set<string>();
    for (const e of entries) for (const w of renderEntry(e, mode)) seen.add(w);
    return seen.size;
  }

  const groupEntries = (g: Group): Word[] => (g.tiers ? g.tiers.flat() : g.words ?? []);
  function selectedEntries(tid: string, g: Group): Word[] {
    const k = key(tid, g.id);
    if (g.tiers) return g.tiers.slice(0, depthByGroup[k] ?? 0).flat();
    return selected[k] ? g.words ?? [] : [];
  }

  const groupTotal = (tid: string, g: Group): number =>
    renderCount(groupEntries(g), modeOf(key(tid, g.id)));
  const groupSelCount = (tid: string, g: Group): number =>
    renderCount(selectedEntries(tid, g), modeOf(key(tid, g.id)));

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
  // Total available for a topic: live (mode-aware) once loaded, else the manifest
  // entry count as a baseline.
  const topicTotal = (t: TopicSummary): number => {
    const gs = groupsOf(t);
    return gs.length ? gs.reduce((n, g) => n + groupTotal(t.id, g), 0) : t.wordCount;
  };
  const topicFull = (t: TopicSummary): boolean => {
    const gs = groupsOf(t);
    return gs.length > 0 && gs.every((g) => groupFull(t.id, g));
  };
  const topicPartial = (t: TopicSummary): boolean =>
    topicSelCount(t) > 0 && !topicFull(t);

  const catTotal = (ts: TopicSummary[]) => ts.reduce((n, t) => n + topicTotal(t), 0);
  const catSel = (ts: TopicSummary[]) => ts.reduce((n, t) => n + topicSelCount(t), 0);
  const catFull = (ts: TopicSummary[]) => ts.every(topicFull);
  const catPartial = (ts: TopicSummary[]) => catSel(ts) > 0 && !catFull(ts);

  // Snap positions (fractions 0…1 of the thumb travel) for a tiered group's
  // slider: one per tier boundary. Spacing reflects each tier's size, but every
  // gap keeps at least MIN_GAP_RATIO of an equal step so dots never touch.
  // MIN_GAP_RATIO and INSET_PX are configured in the Tunables block up top.
  function snapPositions(g: Group): number[] {
    const tiers = g.tiers ?? [];
    const n = tiers.length;
    const total = tiers.reduce((a, t) => a + t.length, 0) || 1;
    const base = MIN_GAP_RATIO / n; // minimum gap, as a fraction of full travel
    const scale = 1 - n * base; // remaining travel distributed by tier size
    const pos = [0];
    let acc = 0;
    for (let i = 0; i < n; i++) {
      acc += base + scale * (tiers[i].length / total);
      pos.push(acc);
    }
    pos[n] = 1; // guard against float drift
    return pos;
  }
  function nearestIndex(pos: number[], frac: number): number {
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < pos.length; i++) {
      const d = Math.abs(pos[i] - frac);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return best;
  }
  function depthFromPointer(e: PointerEvent, k: string, g: Group) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const span = rect.width - 2 * INSET_PX;
    const frac = span > 0 ? (e.clientX - rect.left - INSET_PX) / span : 0;
    depthByGroup[k] = nearestIndex(snapPositions(g), Math.min(1, Math.max(0, frac)));
  }
  function depthKey(e: KeyboardEvent, k: string, n: number) {
    let d = depthByGroup[k] ?? 0;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") d = Math.min(n, d + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") d = Math.max(0, d - 1);
    else if (e.key === "Home") d = 0;
    else if (e.key === "End") d = n;
    else return;
    e.preventDefault();
    depthByGroup[k] = d;
  }

  function setGroup(tid: string, g: Group, on: boolean) {
    const k = key(tid, g.id);
    if (g.tiers) depthByGroup[k] = on ? g.tiers.length : 0;
    else selected[k] = on;
  }
  function setTopic(t: TopicSummary, on: boolean) {
    for (const g of groupsOf(t)) setGroup(t.id, g, on);
  }

  function toggleGroup(tid: string, g: Group) {
    // Any selection (full or partial) clears; only an empty group fills.
    setGroup(tid, g, groupSelCount(tid, g) === 0);
  }
  async function toggleTopic(t: TopicSummary) {
    const data = topicData[t.id] ?? (await ensureLoaded(t));
    if (!data) return;
    setTopic(t, !topicFull(t));
  }
  async function toggleCategory(ts: TopicSummary[]) {
    const on = !catFull(ts);
    const loaded = await Promise.all(ts.map((t) => topicData[t.id] ?? ensureLoaded(t)));
    ts.forEach((t, i) => loaded[i] && setTopic(t, on));
  }

  // Build a nested category tree from topic.category paths (topics keep manifest
  // order; categories appear first-seen). Each node renders as one collapsible
  // level showing only its own segment, so "gaming/pokemon/pokemon" nests inside
  // "gaming/pokemon" instead of repeating the whole path as a flat header.
  type CatNode = {
    name: string;
    path: string;
    topics: TopicSummary[];
    children: CatNode[];
  };
  const tree = $derived.by(() => {
    const root: CatNode = { name: "", path: "", topics: [], children: [] };
    for (const t of topics) {
      let node = root;
      let path = "";
      for (const seg of t.category.split("/").filter(Boolean)) {
        path = path ? `${path}/${seg}` : seg;
        let child = node.children.find((c) => c.name === seg);
        if (!child) {
          child = { name: seg, path, topics: [], children: [] };
          node.children.push(child);
        }
        node = child;
      }
      node.topics.push(t);
    }
    return root;
  });

  // All topics under a category node (its own plus every descendant's).
  const allTopicsOf = (node: CatNode): TopicSummary[] =>
    node.topics.concat(...node.children.map(allTopicsOf));

  // Default expansion: only top-level categories are open, so the second level
  // (e.g. gaming → pokemon) shows up but its contents stay collapsed until the
  // user drills in. A manual toggle (catExpanded) overrides the default.
  const catDepth = (node: CatNode) => node.path.split("/").length - 1;
  const catOpen = (node: CatNode) => catExpanded[node.path] ?? catDepth(node) === 0;

  const titleCase = (seg: string) =>
    seg.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  // Aggregate selected groups' words (top-N tiers), de-duplicated, manifest order.
  const merged = $derived.by(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const t of topics) {
      const data = topicData[t.id];
      if (!data) continue;
      for (const g of data.groups) {
        const mode = modeOf(key(t.id, g.id));
        for (const e of selectedEntries(t.id, g)) {
          for (const w of renderEntry(e, mode)) {
            if (!seen.has(w)) {
              seen.add(w);
              out.push(w);
            }
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
  <div class="layout" class:single={loading || error || topics.length === 0}>
    <div class="col-topics">
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
        <section class="topics" aria-label="Topics">
        <h2>Topics</h2>
        {#snippet topicRow(t: TopicSummary)}
            <div class="topic-item">
              <div class="topic-row">
                <button
                  type="button"
                  class="expander"
                  aria-expanded={!!expanded[t.id]}
                  aria-controls="groups-{t.id}"
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
                    {#if loadingById[t.id] && !topicData[t.id]}loading…{:else}{topicSelCount(t)} of {topicTotal(t)} words{/if}
                  </span>
                </label>
              </div>

              {#if expanded[t.id] && topicData[t.id]}
                <ul class="groups" id="groups-{t.id}">
                  {#each groupsOf(t) as g (g.id)}
                    {@const k = key(t.id, g.id)}
                    <li>
                      <div class="group">
                        <label class="group-label">
                          <input
                            type="checkbox"
                            checked={groupFull(t.id, g)}
                            use:setIndeterminate={groupPartial(t.id, g)}
                            onchange={() => toggleGroup(t.id, g)}
                          />
                          <span class="title">{g.title}</span>
                        </label>
                        {#if groupHasNames(g)}
                          <select
                            class="names-mode"
                            aria-label={`Name form for ${g.title}`}
                            value={modeOf(k)}
                            onchange={(e) => (namesMode[k] = e.currentTarget.value as NamesMode)}
                          >
                            <option value="short">short</option>
                            <option value="long">long</option>
                            <option value="both">both</option>
                          </select>
                        {/if}
                        <span class="meta">{groupSelCount(t.id, g)} of {groupTotal(t.id, g)} words</span>
                      </div>
                      {#if g.tiers && g.tiers.length > 1}
                        {@const d = depthByGroup[k] ?? 0}
                        {@const pos = snapPositions(g)}
                        <div class="group-depth">
                          <div
                            class="depth-track"
                            role="slider"
                            tabindex="0"
                            aria-valuemin="0"
                            aria-valuemax={g.tiers.length}
                            aria-valuenow={d}
                            aria-valuetext={`top ${d} of ${g.tiers.length} tiers`}
                            aria-label={`Fame depth for ${g.title}`}
                            onpointerdown={(e) => {
                              e.currentTarget.setPointerCapture(e.pointerId);
                              depthFromPointer(e, k, g);
                            }}
                            onpointermove={(e) => {
                              if (e.buttons & 1) depthFromPointer(e, k, g);
                            }}
                            onkeydown={(e) => depthKey(e, k, tierCount(g))}
                          >
                            <span class="depth-rail"></span>
                            <span
                              class="depth-fill"
                              style="width: calc({pos[d]} * (100% - 2 * var(--inset)))"
                            ></span>
                            {#each pos as p, i (i)}
                              <span
                                class="depth-dot"
                                class:on={i > d}
                                style="left: calc(var(--inset) + {p} * (100% - 2 * var(--inset)))"
                              ></span>
                            {/each}
                            <span
                              class="depth-thumb"
                              style="left: calc(var(--inset) + {pos[d]} * (100% - 2 * var(--inset)))"
                            ></span>
                          </div>
                        </div>
                      {/if}
                    </li>
                  {/each}
                </ul>
              {/if}
            </div>
        {/snippet}

        {#snippet categoryNode(node: CatNode)}
          {@const at = allTopicsOf(node)}
          {@const catId = "cat-" + (node.path.replace(/\//g, "-") || "root")}
          <div class="category">
            <button
              type="button"
              class="expander"
              aria-expanded={catOpen(node)}
              aria-controls="{catId}-children"
              aria-label={(catOpen(node) ? "Collapse " : "Expand ") + titleCase(node.name)}
              onclick={() => (catExpanded[node.path] = !catOpen(node))}
            >
              {catOpen(node) ? "▾" : "▸"}
            </button>
            <input
              type="checkbox"
              id={catId}
              checked={catFull(at)}
              use:setIndeterminate={catPartial(at)}
              onchange={() => toggleCategory(at)}
            />
            <h3 class="category-title"><label for={catId}>{titleCase(node.name)}</label></h3>
            <span class="meta">{catSel(at)} of {catTotal(at)} words</span>
          </div>
          {#if catOpen(node)}
            <div class="cat-children" id="{catId}-children">
              {#each node.topics as t (t.id)}{@render topicRow(t)}{/each}
              {#each node.children as child (child.path)}{@render categoryNode(child)}{/each}
            </div>
          {/if}
        {/snippet}

        {#each tree.topics as t (t.id)}{@render topicRow(t)}{/each}
        {#each tree.children as node (node.path)}{@render categoryNode(node)}{/each}
        {#if topicError}
          <p class="status error">{topicError}</p>
        {/if}
        </section>
      {/if}
    </div>

    {#if !loading && !error && topics.length > 0}
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
    {/if}
  </div>
</main>
