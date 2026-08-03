import type { Manifest, Topic, TopicSummary } from "./types";

// import.meta.env.BASE_URL is "/" in dev and "/custom-wordlists/" in the Pages
// build (always trailing-slashed), so data URLs resolve under either base.
const DATA_BASE = `${import.meta.env.BASE_URL}data/`;

/** Load the generated topic manifest (data/index.json). */
export async function loadManifest(): Promise<Manifest> {
  const url = `${DATA_BASE}index.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`manifest request failed (HTTP ${res.status}): ${url}`);
  return (await res.json()) as Manifest;
}

/**
 * Load one topic data file. Foldered topics live at
 * `data/topics/<category>/<id>/<file>`; flat topics sit loose in the category at
 * `data/topics/<category>/<file>` (no id-named folder).
 */
export async function loadTopic(category: string, id: string, file: string, flat = false): Promise<Topic> {
  // Drop empty category segments so an uncategorized topic has no double slash.
  const segments = ["topics", ...category.split("/").filter(Boolean)];
  if (!flat) segments.push(id);
  segments.push(file);
  const path = segments.join("/");
  const url = `${DATA_BASE}${path}`;
  const label = [category, id].filter(Boolean).join("/");
  const res = await fetch(url);
  if (!res.ok) throw new Error(`topic "${label}" request failed (HTTP ${res.status}): ${url}`);
  return (await res.json()) as Topic;
}

/**
 * File to load for a topic: the `preferred` language if the topic has it, else
 * en → de → first available. Language-neutral topics have a single content file.
 */
export function pickFile(t: TopicSummary, preferred?: string): string {
  if (t.langs.length === 0) return t.files[0];
  const lang =
    (preferred && t.langs.includes(preferred) && preferred) ||
    (t.langs.includes("en") ? "en" : t.langs.includes("de") ? "de" : t.langs[0]);
  return t.files.find((f) => f.startsWith(`${lang}.`)) ?? t.files[0];
}
