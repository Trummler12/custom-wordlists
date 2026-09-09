// What the app knows about topics: the manifest, the per-topic files loaded on
// demand, and the category tree derived from them — plus the display names, which
// need both the manifest's category metadata and the active language.
//
// One instance, reached through property access (see state/lang.svelte.ts for why).

import { loadManifest, loadTopic } from "../lib/data";
import { buildTree, mergeGroups, synthesizeTopics, titleCase, type CatNode } from "../lib/tree";
import type { CategoryMeta, Group, Topic, TopicSummary } from "../lib/types";
import { baseTag, langSupport } from "../lib/languages";
import { allRules, BASE_RULE, EXTEND_RULE, includeRules, UNKNOWN_RULE, visibleGroup } from "../lib/omitted";
import { displayName, type DisplayName } from "../lib/words";
import { settings } from "./settings.svelte";
import { lang } from "./lang.svelte";

// A topic's single group. The group *is* the topic — same id and title, same list
// fields — so this wraps the topic as the one-element array the rendering code
// consumes. Cached so it keeps its identity for the WeakMap caches downstream
// (visibleGroup, groupEntries), which re-synthesizing per call would defeat.
const synthGroups = new WeakMap<Topic, Group[]>();
function normalizedGroups(data: Topic): Group[] {
  let cached = synthGroups.get(data);
  if (!cached) {
    const g: Group = {
      id: data.id,
      title: data.title,
      ...(data.defaultNames !== undefined ? { defaultNames: data.defaultNames } : {}),
      ...(data.tierNotes ? { tierNotes: data.tierNotes } : {}),
      ...(data.omitted ? { omitted: data.omitted } : {}),
      ...(data.omittable ? { omittable: data.omittable } : {}),
      ...(data.words ? { words: data.words } : {}),
      ...(data.tiers ? { tiers: data.tiers } : {}),
      ...(data.tierConditions ? { tierConditions: data.tierConditions } : {}),
      ...(data.rulerTooltip ? { rulerTooltip: data.rulerTooltip } : {}),
      ...(data.extendFrom !== undefined ? { extendFrom: data.extendFrom } : {}),
    };
    synthGroups.set(data, (cached = [g]));
  }
  return cached;
}

class TopicsState {
  /** Every topic in the manifest, in manifest order. */
  all = $state<TopicSummary[]>([]);
  /** Category display metadata, keyed by category path. */
  categories = $state<Record<string, CategoryMeta>>({});
  loading = $state(true);
  /** Manifest load failure — fatal, the app renders nothing but the message. */
  error = $state<string | null>(null);

  /** id → loaded topic file. Doubles as the cache: present means loaded. */
  data = $state<Record<string, Topic>>({});
  loadingById = $state<Record<string, boolean>>({});
  /** Last per-topic load failure. Not fatal: the rest of the tree still works. */
  topicError = $state<string | null>(null);

  /** The synthesized topics an `inheritsUpwards` family calls for — no files of
   *  their own, hung in the tree beside their contributors. See lib/tree. */
  readonly synths = $derived(synthesizeTopics(this.all));
  readonly tree: CatNode = $derived(buildTree([...this.all, ...this.synths]));

  /** Real topics by id, for resolving a synthesized topic's contributors. */
  readonly byId: Record<string, TopicSummary> = $derived(
    Object.fromEntries(this.all.map((t) => [t.id, t])),
  );
  readonly synthById: Record<string, TopicSummary> = $derived(
    Object.fromEntries(this.synths.map((t) => [t.id, t])),
  );

  /** Assembled synthesized groups, cached against the contributor groups they were
   *  merged from — so the merge (and the WeakMap caches keyed on the result) stays
   *  stable until an omission toggle or a language switch changes a contributor. */
  #synthCache = new Map<string, { sources: Group[]; assembled: Group }>();

  /** Whether there is a tree to show — the condition for the two-column layout. */
  get ready(): boolean {
    return !this.loading && !this.error && this.all.length > 0;
  }

  async init(): Promise<void> {
    try {
      const manifest = await loadManifest();
      this.all = manifest.topics;
      this.categories = manifest.categories ?? {};
      // `lang` needs these and can't reach for them; see `declaredLangs`. The
      // synthesized topics get an entry too (their intersected languages), or their
      // rows would flag a ⚠️ for a language none of them actually lacks.
      lang.declaredLangs = Object.fromEntries([
        ...manifest.topics.map((t) => [t.id, t.languages ?? []]),
        ...synthesizeTopics(manifest.topics).map((s) => [s.id, s.languages ?? []]),
      ]);
      // Synthesized topics inherit the flag from their contributors, so the merged
      // world "Countries"/"Capitals" rows derive romaji like the continental leaves.
      lang.derivedRomaji = Object.fromEntries(
        [...manifest.topics, ...synthesizeTopics(manifest.topics)]
          .filter((t) => t.generatedRomaji)
          .map((t) => [t.id, true]),
      );
    } catch (e) {
      this.error = e instanceof Error ? e.message : String(e);
    } finally {
      this.loading = false;
    }
  }

  /** Whether this id names a synthesized topic (no file — a merge of contributors). */
  isSynth(id: string): boolean {
    return id in this.synthById;
  }
  /** The real topics a synthesized topic merges, in family order. */
  contributorsOf(id: string): TopicSummary[] {
    const ids = this.synthById[id]?.contributors ?? [];
    return ids.map((cid) => this.byId[cid]).filter((t): t is TopicSummary => !!t);
  }

  /** The topic's data, loading it once if needed. Null while a load is in flight
   *  or after one failed — callers treat both as "not available yet". A synthesized
   *  topic has no file: loading it means loading all of its contributors. */
  async ensure(t: TopicSummary): Promise<Topic | null> {
    if (this.isSynth(t.id)) {
      await Promise.all(this.contributorsOf(t.id).map((c) => this.ensure(c)));
      return null; // no file of its own — callers check `groupsOf` for readiness
    }
    if (this.data[t.id]) return this.data[t.id];
    if (this.loadingById[t.id]) return null;
    this.loadingById[t.id] = true;
    this.topicError = null;
    try {
      const data = await loadTopic(t.path);
      this.data[t.id] = data;
      return data;
    } catch (e) {
      this.topicError = e instanceof Error ? e.message : String(e);
      return null;
    } finally {
      this.loadingById[t.id] = false;
    }
  }

  /** A topic's groups as the app shows them — omitted families filtered out —
   *  empty until it has loaded.
   *
   *  The one place that resolves it, so counts, rulers, the output and every row
   *  see the same list without any of them knowing about omissions — nor about
   *  the entries a list has no name for in the language it is showing in, which
   *  `visibleGroup` drops on the same terms. `visibleGroup` hands back the group
   *  itself when neither applies, and caches the rest. */
  /** A topic's groups as the file has them — no omissions applied, and the same
   *  array for the life of the page, which is what makes it safe to cache against.
   *  Everything that renders a list wants `groupsOf` instead. */
  rawGroups(tid: string): Group[] {
    const data = this.data[tid];
    return data ? normalizedGroups(data) : [];
  }

  groupsOf(t: TopicSummary): Group[] {
    if (this.isSynth(t.id)) return this.synthGroupsOf(t);
    const data = this.data[t.id];
    const groups = data ? normalizedGroups(data) : [];
    // A list whose names in this language simply *are* the English ones is being
    // shown in English, whatever the picker says — so it has no gaps to hide.
    const picked = lang.contentLang(t.id);
    const code = langSupport(t, baseTag(picked)) === "english" ? "en" : picked;
    return groups.map((g) => {
      // The reserved toggles (base box, ruler-cap lift) are toggled like a rule but declared
      // in no file, so they must be named here for their flip to reach visibleGroup.
      const ids = [...allRules(g).map((o) => o.id), UNKNOWN_RULE];
      if (includeRules(g).length) ids.push(BASE_RULE);
      if (g.extendFrom != null) ids.push(EXTEND_RULE);
      return visibleGroup(g, settings.toggledFor(t.id, g.id, ids), code);
    });
  }

  /** The one merged group a synthesized topic shows — its contributors' visible
   *  groups assembled and deduplicated (see `mergeGroups`). Empty until every
   *  contributor has loaded, so the row shows "loading" rather than a merge that
   *  grows as files trickle in. Cached against the source groups' identities. */
  private synthGroupsOf(synth: TopicSummary): Group[] {
    const contributors = this.contributorsOf(synth.id);
    const sources: { tid: string; group: Group }[] = [];
    for (const c of contributors) {
      const gs = this.groupsOf(c);
      if (gs.length === 0) return []; // a contributor is still loading
      sources.push({ tid: c.id, group: gs[0] });
    }
    if (sources.length === 0) return [];
    const groups = sources.map((s) => s.group);
    const hit = this.#synthCache.get(synth.id);
    if (hit && hit.sources.length === groups.length && hit.sources.every((g, i) => g === groups[i])) {
      return [hit.assembled];
    }
    const assembled = mergeGroups(synth, sources);
    this.#synthCache.set(synth.id, { sources: groups, assembled });
    return [assembled];
  }

  /** Whether a topic's data is available to count from — its own file loaded, or,
   *  for a synth, every contributor's. What a row and a category count wait on
   *  before showing anything but "loading": until then a topic's total is the
   *  manifest's unfiltered `wordCount`, not the figure the list actually yields. */
  isReady(t: TopicSummary): boolean {
    if (this.isSynth(t.id)) return this.contributorsOf(t.id).every((c) => !!this.data[c.id]);
    return !!this.data[t.id];
  }

  /** Whether every topic under a node is ready, so a category count shows "loading"
   *  and then its final number in one step — never a partial sum ticking down as
   *  files arrive. The manifest's `wordCount` fallback is unfiltered, so an unloaded
   *  topic would otherwise inflate the parent until it lands. */
  subtreeReady(ts: TopicSummary[]): boolean {
    return ts.every((t) => this.isReady(t));
  }

  /** Load every topic's file in the background, so the counts everywhere settle to
   *  their filtered value without the reader expanding a thing — the parent totals
   *  are otherwise wrong (an unfiltered `wordCount` sum) until each child is opened.
   *  Bounded concurrency keeps it off the initial render's back; `ensure` is
   *  idempotent, so a row that loaded itself first is simply skipped. Fire-and-forget
   *  from the app shell once the manifest is in. */
  async warmAll(): Promise<void> {
    const pending = this.all.filter((t) => !this.isSynth(t.id) && !this.data[t.id]);
    let i = 0;
    const worker = async (): Promise<void> => {
      while (i < pending.length) await this.ensure(pending[i++]);
    };
    await Promise.all(Array.from({ length: Math.min(4, pending.length) }, worker));
  }

  // Display names in the active language. A title is a WordEntry, so resolving one
  // is resolving an entry: `short` goes on the row, `long` into its hover, and the
  // two are equal wherever the name has only one form.
  topicName(t: TopicSummary): DisplayName {
    return displayName(t.title, lang.uiLang);
  }
  groupName(g: Group): DisplayName {
    return displayName(g.title, lang.uiLang);
  }
  categoryName(node: CatNode): DisplayName {
    const title = this.categories[node.path]?.title;
    return displayName(title ?? titleCase(node.name), lang.uiLang);
  }
  categoryIcon(node: CatNode): string | undefined {
    return this.categories[node.path]?.icon;
  }
}

export const topics = new TopicsState();
