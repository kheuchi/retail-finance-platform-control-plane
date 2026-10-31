<script lang="ts">
  /* Cards with a nickname on the front and the real tool on the back. */
  import Icon from "../Icon.svelte";
  import type { Block } from "../../data/types";
  let { cards }: { cards: Extract<Block, { flip: unknown }>["flip"] } = $props();
  let open = $state<boolean[]>([]);
</script>

<div class="flips">
  {#each cards as [front, name, text, icon, c], i}
    <button class="flip" aria-pressed={!!open[i]} style="--c:var({c})" onclick={() => (open[i] = !open[i])}>
      <span class="in">
        <span class="fc front"><Icon k={icon} size={34} /><b>{front}</b><small>tap to see the real name</small></span>
        <span class="fc back"><b><Icon k={icon} size={18} />{name}</b><span>{text}</span></span>
      </span>
    </button>
  {/each}
</div>
