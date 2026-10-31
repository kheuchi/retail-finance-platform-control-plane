<script lang="ts">
  /* Be the figure checker: tap each number; real ones trace to a tool, the invented one is caught. */
  import type { Spot } from "../../data/types";
  let { sp }: { sp: Spot } = $props();
  let marks = $state<Record<number, "real" | "fake">>({});
  let res = $state<{ ok: boolean; text: string; src?: string } | null>(null);
  function check(i: number, text: string, src: string) {
    if (marks[i]) return;
    marks[i] = src ? "real" : "fake";
    res = src ? { ok: true, text, src } : { ok: false, text };
  }
</script>

<div class="spot">
  <p class="prose">{sp.intro}</p>
  <p class="txt">
    {#each sp.parts as x, i}{#if Array.isArray(x)}<button class="num2 {marks[i] ?? ''}" onclick={() => check(i, x[0], x[1])}>{x[0]}</button>{:else}{x}{/if}{/each}
  </p>
  <p class="res">
    {#if res?.ok}<span class="ok">✓ Real.</span> {res.text} came from the tool <code>{res.src}</code>.
    {:else if res}<b class="gap">{sp.caught}</b><br />{sp.limit}{/if}
  </p>
</div>
