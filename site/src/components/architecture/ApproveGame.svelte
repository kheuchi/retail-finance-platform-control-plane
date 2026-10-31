<script lang="ts">
  /* Be the controller: approve or not, and see what the system does next. */
  import type { Approve } from "../../data/types";
  let { ap }: { ap: Approve } = $props();
  let choice = $state<"yes" | "no" | null>(null);
</script>

<div class="appr">
  <p class="prose">Status: <span class="status" class:sent={choice === "yes"}>{choice === "yes" ? "sent" : "pending_review"}</span></p>
  <p class="prose">{ap.draft}</p>
  <div class="btns">
    <button class="btn okb" onclick={() => (choice = "yes")}>Approve</button>
    <button class="btn nob" onclick={() => (choice = "no")}>Don't approve</button>
  </div>
  <div class="res">
    {#if choice}
      {#key choice}<ol>{#each ap[choice] as t, i}<li style="animation-delay:{i * 0.5}s">{t}</li>{/each}</ol>{/key}
    {/if}
  </div>
</div>
