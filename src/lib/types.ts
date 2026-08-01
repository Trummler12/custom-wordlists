// Shapes of the generated manifest (data/index.json). Kept in sync with
// scripts/build-index.mjs and schema/topic.schema.json. Topic-file interfaces
// (Topic/Group/Preset) are added when on-demand topic loading lands.

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
