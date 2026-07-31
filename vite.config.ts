import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// Served from https://trummler12.github.io/custom-wordlists/ on GitHub Pages,
// so assets must resolve under that sub-path. Overridable via BASE_PATH for
// local/other deploys (defaults to "/" in dev).
const base = process.env.BASE_PATH ?? "/";

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [svelte()],
});
