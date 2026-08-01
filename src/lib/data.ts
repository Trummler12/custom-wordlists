import type { Manifest } from "./types";

// import.meta.env.BASE_URL is "/" in dev and "/custom-wordlists/" in the Pages
// build (always trailing-slashed), so data URLs resolve under either base.
const DATA_BASE = `${import.meta.env.BASE_URL}data/`;

/** Load the generated topic manifest (data/index.json). */
export async function loadManifest(): Promise<Manifest> {
  const res = await fetch(`${DATA_BASE}index.json`);
  if (!res.ok) throw new Error(`manifest request failed (HTTP ${res.status})`);
  return (await res.json()) as Manifest;
}
