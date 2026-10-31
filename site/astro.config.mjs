// The GitHub Pages site (story X.2, D-033). Deployed by .github/workflows/site.yml.
import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";

export default defineConfig({
  site: "https://kheuchi.github.io",
  base: "/retail-finance-platform-control-plane",
  build: { format: "file" },   // keeps the old URLs: architecture/architecture.html, landscape/tools.html
  integrations: [svelte()],
});
