<script lang="ts">
  /* Replays a run as a chat, one message per click. */
  import Icon from "../Icon.svelte";
  import type { Block } from "../../data/types";
  let { msgs }: { msgs: Extract<Block, { chat: unknown }>["chat"] } = $props();
  const ROLE = {
    ctl: ["Controller", "person", "--people"],
    code: ["Safety check (code, not AI)", "python", "--base"],
    agent: ["AI agent", "googlegemini", "--agent"],
    tool: ["Tool", "sql", "--data"],
  } as const;
  let shown = $state(0);
</script>

<div class="chat">
  {#each msgs.slice(0, shown) as [who, tool, text]}
    {@const [rn, ri, rc] = ROLE[who]}
    <div class="msg2" class:tool={who === "tool"} class:me={who === "ctl"} style="--c:var({rc})">
      <span class="who2"><Icon k={ri} size={16} /></span>
      <div class="bub"><small>{tool || rn}</small>{text}</div>
    </div>
  {/each}
  <div class="btns">
    <button class="btn" disabled={shown >= msgs.length} onclick={() => shown++}>
      {shown === 0 ? "Start the run ▶" : shown >= msgs.length ? "Done: now check the draft below ↓" : "Next message ▶"}
    </button>
    <span class="note">Real messages and figures from the August 2026 run, shortened.</span>
  </div>
</div>
