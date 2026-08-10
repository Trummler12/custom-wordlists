// What the app knows about topics: the manifest, the per-topic files loaded on
// demand, and the category tree derived from them — plus the display names, which
// need both the manifest's category metadata and the active language.
//
// One instance, reached through property access (see state/lang.svelte.ts for why).

import { loadManifest, loadTopic } from "../lib/data";
import { buildTree, titleCase, type CatNode } from "../lib/tree";
import type { CategoryMeta, Group, Topic, TopicSummary } from "../lib/types";
import { displayName, type DisplayName } from "../lib/words";
import { lang } from "./lang.svelte";

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

  /** A topic's groups, empty until it has loaded. */
  groupsOf(t: TopicSummary): Group[] {
    return this.data[t.id]?.groups ?? [];
  }

  /** Whether a topic is still fetching and has nothing to show yet. */
  isLoading(t: TopicSummary): boolean {
    return !!this.loadingById[t.id] && !this.data[t.id];
  }

  // Display names in the active language. A title is a WordEntry, so resolving one
  // is resolving an entry: `short` goes on the row, `long` into its hover, and the
  // two are equal wherever the name has only one form.
  topicName(t: TopicSummary): DisplayName {
    return displayName(t.title, lang.current);
  }
  groupName(g: Group): DisplayName {
    return displayName(g.title, lang.current);
  }
  categoryName(node: CatNode): DisplayName {
    const title = this.categories[node.path]?.title;
    return displayName(title ?? titleCase(node.name), lang.current);
  }
  categoryIcon(node: CatNode): string | undefined {
    return this.categories[node.path]?.icon;
  }
}

export const topics = new TopicsState();
