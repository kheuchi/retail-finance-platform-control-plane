// v2 of the GitHub Pages site: served under /v2/ next to the current site until the switch-over.
import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";

export default defineConfig({
  site: "https://kheuchi.github.io",
  base: "/retail-finance-platform-control-plane/v2",
  build: { format: "file" },   // keeps the old URLs: architecture/architecture.html, landscape/tools.html
  integrations: [svelte()],
});
