// Shapes of the generated manifest (data/index.json), produced by
// scripts/build-index.mjs — the source of truth for these types. Topic-file
// interfaces (Topic/Group/Preset), which will mirror schema/topic.schema.json,
// are added when on-demand topic loading lands.

/** One topic as summarized in the manifest — enough to render the tree. */
export interface TopicSummary {
  id: string;
  title: string;
  /** Emoji/icon, or null when the topic has none. */
  icon: string | null;
  /** Available language codes (e.g. ["de","en"]); empty = language-neutral. */
  langs: string[];
  groupCount: number;
  wordCount: number;
}

/** The generated manifest the frontend loads first. */
export interface Manifest {
  generatedAt: string;
  topics: TopicSummary[];
}
