// What the user has done to the topic tree: what is selected, how deep, in which
// name form — and what is expanded. Expansion lives here rather than with the
// topic data because it is the same kind of thing: per-user, keyed by topic or
// category id, and changed by the same handful of handlers (expanding a topic
// loads it, exactly as ticking one does).
//
// The selection model has one rule worth knowing: tiered groups are represented
// purely by `depthByGroup[k]` (0…tierCount) and flat `words` groups purely by the
// boolean `selected[k]`. Every state above — group full/partial, topic, category —
// is derived from those two, which is why moving a slider rolls all the way up to
// the category checkbox with no code that says so.

import { groupEntries, renderCount } from "../lib/words";
import { depthFromKey, depthFromPointer } from "../lib/fame";
import { catDepth, type CatNode } from "../lib/tree";
import type { Group, NamesMode, TopicSummary, WordEntry } from "../lib/types";
import { lang } from "./lang.svelte";
import { topics } from "./topics.svelte";

class SelectionState {
  /** Flat `words` groups only, keyed `${topicId}:${groupId}`. */
  selected = $state<Record<string, boolean>>({});
  /** Per-group fame depth (top-N tiers), keyed alike. Absent/0 = unselected. */
  depthByGroup = $state<Record<string, number>>({});
  /** Per-group names mode; only groups with short/long entries show the dropdown. */
  namesMode = $state<Record<string, NamesMode>>({});
  /** Which topics are expanded, by topic id. */
  expanded = $state<Record<string, boolean>>({});
  /** Which category nodes the user has toggled, by path. Absent = the default. */
  catExpanded = $state<Record<string, boolean>>({});

  key(tid: string, gid: string): string {
    return `${tid}:${gid}`;
  }

  // --- Expansion -------------------------------------------------------------

  async toggleExpand(t: TopicSummary): Promise<void> {
    this.expanded[t.id] = !this.expanded[t.id];
    if (this.expanded[t.id]) await topics.ensure(t);
  }

  /** Only top-level categories start open, so the second level (gaming → pokemon)
   *  shows up but its contents stay collapsed until the user drills in. */
  catOpen(node: CatNode): boolean {
    return this.catExpanded[node.path] ?? catDepth(node) === 0;
  }
  toggleCat(node: CatNode): void {
    this.catExpanded[node.path] = !this.catOpen(node);
  }

  // --- Names mode ------------------------------------------------------------
  // A group's entries are plain strings or { short, long } pairs. The mode picks
  // which form(s) to emit; counts and output de-duplicate identical rendered
  // strings, so "both" on a pair whose forms match still yields one word.

  modeOf(k: string): NamesMode {
    return this.namesMode[k] ?? "long";
  }
  setMode(k: string, mode: NamesMode): void {
    this.namesMode[k] = mode;
  }

  // --- Counts ----------------------------------------------------------------

  /** The entries a group currently contributes: its top-N tiers, or all of its
   *  flat words when ticked. */
  entriesOf(tid: string, g: Group): WordEntry[] {
    const k = this.key(tid, g.id);
    if (g.tiers) return g.tiers.slice(0, this.depthByGroup[k] ?? 0).flat();
    return this.selected[k] ? (g.words ?? []) : [];
  }

  groupTotal(tid: string, g: Group): number {
    return renderCount(groupEntries(g), this.modeOf(this.key(tid, g.id)), lang.current);
  }
  groupSelCount(tid: string, g: Group): number {
    return renderCount(this.entriesOf(tid, g), this.modeOf(this.key(tid, g.id)), lang.current);
  }

  groupFull(tid: string, g: Group): boolean {
    const k = this.key(tid, g.id);
    return g.tiers ? (this.depthByGroup[k] ?? 0) === g.tiers.length : !!this.selected[k];
  }
  groupPartial(tid: string, g: Group): boolean {
    if (!g.tiers) return false;
    const d = this.depthByGroup[this.key(tid, g.id)] ?? 0;
    return d > 0 && d < g.tiers.length;
  }

  topicSelCount(t: TopicSummary): number {
    return topics.groupsOf(t).reduce((n, g) => n + this.groupSelCount(t.id, g), 0);
  }
  /** Live and mode-aware once the topic is loaded; the manifest's entry count as a
   *  baseline before that. */
  topicTotal(t: TopicSummary): number {
    const gs = topics.groupsOf(t);
    return gs.length ? gs.reduce((n, g) => n + this.groupTotal(t.id, g), 0) : t.wordCount;
  }
  topicFull(t: TopicSummary): boolean {
    const gs = topics.groupsOf(t);
    return gs.length > 0 && gs.every((g) => this.groupFull(t.id, g));
  }
  topicPartial(t: TopicSummary): boolean {
    return this.topicSelCount(t) > 0 && !this.topicFull(t);
  }

  catTotal(ts: TopicSummary[]): number {
    return ts.reduce((n, t) => n + this.topicTotal(t), 0);
  }
  catSel(ts: TopicSummary[]): number {
    return ts.reduce((n, t) => n + this.topicSelCount(t), 0);
  }
  catFull(ts: TopicSummary[]): boolean {
    return ts.every((t) => this.topicFull(t));
  }
  catPartial(ts: TopicSummary[]): boolean {
    return this.catSel(ts) > 0 && !this.catFull(ts);
  }

  // --- Fame depth ------------------------------------------------------------

  depth(k: string): number {
    return this.depthByGroup[k] ?? 0;
  }
  /** Drag or click on the slider track. */
  dragDepth(e: PointerEvent, k: string, g: Group): void {
    this.depthByGroup[k] = depthFromPointer(e, g);
  }
  /** Arrow/Home/End on the slider. Other keys are left alone — the event must
   *  keep its default, so the caller can't preventDefault unconditionally. */
  keyDepth(e: KeyboardEvent, k: string, g: Group): void {
    const d = depthFromKey(e, this.depth(k), g.tiers?.length ?? 0);
    if (d === null) return;
    e.preventDefault();
    this.depthByGroup[k] = d;
  }

  // --- Setting ---------------------------------------------------------------

  setGroup(tid: string, g: Group, on: boolean): void {
    const k = this.key(tid, g.id);
    if (g.tiers) this.depthByGroup[k] = on ? g.tiers.length : 0;
    else this.selected[k] = on;
  }
  setTopic(t: TopicSummary, on: boolean): void {
    for (const g of topics.groupsOf(t)) this.setGroup(t.id, g, on);
  }

  toggleGroup(tid: string, g: Group): void {
    // Any selection (full or partial) clears; only an empty group fills.
    this.setGroup(tid, g, this.groupSelCount(tid, g) === 0);
  }
  async toggleTopic(t: TopicSummary): Promise<void> {
    const data = topics.data[t.id] ?? (await topics.ensure(t));
    if (!data) return;
    this.setTopic(t, !this.topicFull(t));
  }
  async toggleCategory(ts: TopicSummary[]): Promise<void> {
    const on = !this.catFull(ts);
    const loaded = await Promise.all(ts.map((t) => topics.data[t.id] ?? topics.ensure(t)));
    ts.forEach((t, i) => loaded[i] && this.setTopic(t, on));
  }
}

export const selection = new SelectionState();
