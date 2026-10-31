<script lang="ts">
  /* Before / after switch: each task's token slides to whoever does it. */
  import type { Who } from "../../data/types";
  let { w }: { w: Who } = $props();
  let mode = $state(0);
</script>

<div class="who">
  <div class="sw" role="group" aria-label="Before or after">
    {#each w.modes as m, i}<button aria-pressed={i === mode} onclick={() => (mode = i)}>{m}</button>{/each}
  </div>
  <div class="hd"><span></span><div class="cols">{#each w.cols as [n, c]}<span style="color:var({c})">{n}</span>{/each}</div></div>
  {#each w.tasks as [task, before, after, why]}
    {@const at = mode ? after : before}
    <div class="tk">
      <span>{task}</span>
      <div class="lane">
        <span class="tok" class:moved={!!mode && before !== after} style="transform:translateX({at * 100}%)"><i style="--c:var({w.cols[at][1]})">{w.cols[at][0]}</i></span>
      </div>
      <span class="why" hidden={!mode}>{why}</span>
    </div>
  {/each}
</div>
