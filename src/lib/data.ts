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

/** Load one topic data file (data/topics/<id>/<file>). */
export async function loadTopic(id: string, file: string): Promise<Topic> {
  const url = `${DATA_BASE}topics/${id}/${file}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`topic "${id}" request failed (HTTP ${res.status}): ${url}`);
  return (await res.json()) as Topic;
}

/** Representative file to load for a topic: en → de → first available. */
export function pickFile(t: TopicSummary): string {
  if (t.langs.length === 0) return t.files[0];
  const lang = t.langs.includes("en") ? "en" : t.langs.includes("de") ? "de" : t.langs[0];
  return t.files.find((f) => f.startsWith(`${lang}.`)) ?? t.files[0];
}
