import { defineConfig, type Plugin, type ResolvedConfig } from "vite";
import { execFileSync } from "node:child_process";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Generate crawlable HTML even when hosting invokes Vite directly, not npm scripts.
function publicLearningPages(): Plugin {
  let config: ResolvedConfig;
  return {
    name: 'public-learning-pages',
    apply: 'build',
    configResolved(resolved) { config = resolved; },
    generateBundle() {
      for (const id of this.getModuleIds()) {
        const normalized = id.replace(/\\/g, '/');
        if (/\/node_modules\/(braces|chokidar|fast-glob|lovable-tagger|micromatch|tailwindcss)\//.test(normalized)) {
          this.error('Build-only vulnerable dependency unexpectedly reached browser output: ' + normalized);
        }
      }
    },
    writeBundle() {
      execFileSync(process.execPath, [path.resolve(config.root, 'scripts/seo/build-public.mjs'), '--out', path.resolve(config.root, config.build.outDir)], { stdio: 'inherit' });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), publicLearningPages(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
