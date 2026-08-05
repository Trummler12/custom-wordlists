import { defineConfig, type Plugin, type ResolvedConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { createReadStream } from "node:fs";
import { cp, stat } from "node:fs/promises";
import { join, resolve, extname, relative, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";

// Served from https://trummler12.github.io/custom-wordlists/ on GitHub Pages,
// so production assets must resolve under that sub-path. Dev keeps "/" for a
// clean localhost; BASE_PATH overrides both (e.g. other deploy targets).
const REPO_BASE = "/custom-wordlists/";

// Topic data lives at the repo root (docs/archive/PLANNING.md §4.1), not in
// public/, so Vite neither serves nor copies it by default. This plugin bridges
// that: it serves /data/* from the root data/ folder in dev and copies data/
// into the build output on `build`. The manifest (data/index.json) is generated
// by the build script before `vite build`, so the copy picks it up.
const DATA_DIR = fileURLToPath(new URL("./data", import.meta.url));

function serveData(): Plugin {
  let outDir = "dist";
  return {
    name: "serve-data",
    configResolved(config: ResolvedConfig) {
      // outDir is relative to root; resolve it now so the copy doesn't depend on cwd.
      outDir = resolve(config.root, config.build.outDir);
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? "";
        if (!url.startsWith("/data/")) return next();
        // Strip query/hash, decode, and resolve inside DATA_DIR (traversal guard).
        let rel: string;
        try {
          rel = decodeURIComponent(url.slice("/data/".length).split(/[?#]/)[0]);
        } catch {
          res.statusCode = 400;
          return res.end("Bad Request");
        }
        const filePath = resolve(DATA_DIR, rel);
        const within = relative(DATA_DIR, filePath);
        if (within.startsWith("..") || isAbsolute(within)) {
          res.statusCode = 403;
          return res.end("Forbidden");
        }
        stat(filePath).then(
          (s) => {
            if (!s.isFile()) return next();
            if (extname(filePath) === ".json") {
              res.setHeader("Content-Type", "application/json; charset=utf-8");
            }
            const stream = createReadStream(filePath);
            // File could vanish between stat() and open, or fs errors mid-read.
            stream.on("error", () => {
              if (!res.headersSent) res.statusCode = 500;
              res.end();
            });
            stream.pipe(res);
          },
          () => next(),
        );
      });
    },
    async closeBundle() {
      // Copy the whole data/ tree (incl. the generated index.json) into dist/data/.
      await cp(DATA_DIR, join(outDir, "data"), { recursive: true });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: process.env.BASE_PATH ?? (command === "build" ? REPO_BASE : "/"),
  plugins: [svelte(), serveData()],
}));
