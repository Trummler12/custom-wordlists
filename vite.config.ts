import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// Served from https://trummler12.github.io/custom-wordlists/ on GitHub Pages,
// so production assets must resolve under that sub-path. Dev keeps "/" for a
// clean localhost; BASE_PATH overrides both (e.g. other deploy targets).
const REPO_BASE = "/custom-wordlists/";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: process.env.BASE_PATH ?? (command === "build" ? REPO_BASE : "/"),
  plugins: [svelte()],
}));
