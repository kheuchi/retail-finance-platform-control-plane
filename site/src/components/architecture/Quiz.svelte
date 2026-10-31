<script lang="ts">
  /* Multiple-choice questions; the right answer and the reason show after any click. */
  import type { Block } from "../../data/types";
  let { qs }: { qs: Extract<Block, { quiz: unknown }>["quiz"] } = $props();
  let picked = $state<(number | undefined)[]>([]);
</script>

<div class="quiz">
  {#each qs as [q, opts, right, why], k}
    {@const p = picked[k]}
    <div class="qz">
      <b>{q}</b>
      <div class="opts">
        {#each opts as o, i}
          <button class="opt" class:right={p !== undefined && i === right} class:wrong={p === i && i !== right} onclick={() => (picked[k] = i)}>{o}</button>
        {/each}
      </div>
      {#if p !== undefined}
        <p class="res"><b class={p === right ? "ok" : "gap"}>{p === right ? "Correct." : "Not quite."}</b> {why}</p>
      {/if}
    </div>
  {/each}
</div>
