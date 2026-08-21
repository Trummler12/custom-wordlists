// What the app knows about topics: the manifest, the per-topic files loaded on
// demand, and the category tree derived from them — plus the display names, which
// need both the manifest's category metadata and the active language.
//
// One instance, reached through property access (see state/lang.svelte.ts for why).

import { loadManifest, loadTopic } from "../lib/data";
import { buildTree, titleCase, type CatNode } from "../lib/tree";
import type { CategoryMeta, Group, Topic, TopicSummary } from "../lib/types";
import { baseTag, langSupport } from "../lib/languages";
import { allRules, UNKNOWN_RULE, visibleGroup } from "../lib/omitted";
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

  readonly tree: CatNode = $derived(buildTree(this.all));

  /** Whether there is a tree to show — the condition for the two-column layout. */
  get ready(): boolean {
    return !this.loading && !this.error && this.all.length > 0;
  }

  async init(): Promise<void> {
    try {
      const manifest = await loadManifest();
      this.all = manifest.topics;
      this.categories = manifest.categories ?? {};
      // `lang` needs these and can't reach for them; see `declaredLangs`.
      lang.declaredLangs = Object.fromEntries(
        manifest.topics.map((t) => [t.id, t.languages ?? []]),
      );
      lang.derivedRomaji = Object.fromEntries(
        manifest.topics.filter((t) => t.generatedRomaji).map((t) => [t.id, true]),
      );
    } catch (e) {
      this.error = e instanceof Error ? e.message : String(e);
    } finally {
      this.loading = false;
    }
  }

  /** The topic's data, loading it once if needed. Null while a load is in flight
   *  or after one failed — callers treat both as "not available yet". */
  async ensure(t: TopicSummary): Promise<Topic | null> {
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
    const data = this.data[t.id];
    const groups = data ? normalizedGroups(data) : [];
    // A list whose names in this language simply *are* the English ones is being
    // shown in English, whatever the picker says — so it has no gaps to hide.
    const picked = lang.contentLang(t.id);
    const code = langSupport(t, baseTag(picked)) === "english" ? "en" : picked;
    return groups.map((g) =>
      visibleGroup(
        g,
        settings.toggledFor(t.id, g.id, [...allRules(g).map((o) => o.id), UNKNOWN_RULE]),
        code,
      ),
    );
  }

  /** Whether a topic is still fetching and has nothing to show yet. */
  isLoading(t: TopicSummary): boolean {
    return !!this.loadingById[t.id] && !this.data[t.id];
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
