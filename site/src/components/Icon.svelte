<script lang="ts">
  import { iconHTML } from "../lib/icons";
  let { k, size = 18 }: { k?: string; size?: number } = $props();
</script>

{@html iconHTML(k, size)}
