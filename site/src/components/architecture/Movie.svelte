<script lang="ts">
  /* Simple mode: an animated walk-through of one question, from typing it in Teams to the answer and the approval.
     A stage drawn at 800 × 480 and scaled to fit; a small robot (the agent) wakes up, rolls to each tool and back.
     The data gives the words (scenes, typed question and answer); each scene key has its own picture here.
     Visitors who ask for reduced motion get the same scenes without movement or typing. */
  import { onMount } from "svelte";
  import type { Movie, SceneKey } from "../../data/types";
  let { m }: { m: Movie } = $props();

  const W = 800, H = 480;
  let i = $state(0), playing = $state(false), typed = $state(0), moving = $state(false), still = $state(false), w = $state(W);
  const sc = $derived(m.scenes[i]);
  const at = (k: SceneKey) => m.scenes.findIndex(s => s.k === k);
  const past = (k: SceneKey) => i >= at(k);          // this scene has happened (or is happening)
  const now = (k: SceneKey) => sc.k === k;
  const k = $derived(Math.min(1.5, w / W));

  // Where the robot stands in each scene (top-left of its 70 × 84 box).
  const SPOT: Record<SceneKey, [number, number]> = {
    ask: [470, 175], door: [470, 175], wake: [470, 175], numbers: [413, 205], forecast: [551, 205], contracts: [689, 205],
    check: [470, 232], answer: [330, 180], approve: [668, 232],
  };
  const pos = $derived(SPOT[sc.k]);
  const asleep = $derived(i < at("wake"));
  const looking = $derived(["numbers", "forecast", "contracts"].includes(sc.k));
  const STATIONS: [SceneKey, string, string, string][] = [
    ["numbers", "📊", "The numbers", "certified sales and margin"],
    ["forecast", "📈", "The forecast", "where the quarter ends"],
    ["contracts", "📄", "The contracts", "what suppliers promised"],
  ];
  const card = (k: SceneKey) => m.scenes[at(k)]?.card ?? "";
  const lines = $derived(m.scenes[at("check")]?.lines ?? []);

  // Typing: the question in the first scene, the answer in the "answer" scene.
  const typing = $derived(now("ask") ? m.ask : now("answer") ? m.answer : "");
  const askShown = $derived(now("ask") ? m.ask.slice(0, typed) : m.ask);
  const ansShown = $derived(now("answer") ? m.answer.slice(0, typed) : past("answer") ? m.answer : "");

  $effect(() => {
    void i;                                           // restart on every scene change
    typed = still ? 1e6 : 0;
    moving = !still;
    const stop = setTimeout(() => (moving = false), 1100);
    const text = typing;
    if (!text || still) return () => clearTimeout(stop);
    const t = setInterval(() => { typed += 1; if (typed >= text.length) clearInterval(t); }, 38);
    return () => { clearInterval(t); clearTimeout(stop); };
  });

  // Autoplay: each scene stays long enough to read its caption.
  $effect(() => {
    if (!playing) return;
    const ms = now("answer") ? 3200 + m.answer.length * 38 : now("ask") ? 1800 + m.ask.length * 38 : now("check") ? 6500 : 5200;
    const t = setTimeout(() => { if (i < m.scenes.length - 1) i += 1; else playing = false; }, ms);
    return () => clearTimeout(t);
  });

  function go(n: number) { i = Math.max(0, Math.min(m.scenes.length - 1, n)); }
  function play() {
    if (playing) { playing = false; return; }
    if (i >= m.scenes.length - 1) i = 0;
    playing = true;
  }

  onMount(() => {
    const q = matchMedia("(prefers-reduced-motion: reduce)");
    still = q.matches;
    const on = () => (still = q.matches);
    q.addEventListener("change", on);
    return () => q.removeEventListener("change", on);
  });
</script>

<div class="m-mv" class:m-still={still}>
  <div class="m-ctl">
    <button class="m-btn" onclick={() => go(i - 1)} disabled={i === 0} aria-label="Previous scene">◀</button>
    <button class="m-btn m-main" onclick={play}>{playing ? "⏸ Pause" : i >= m.scenes.length - 1 ? "↺ Replay" : "▶ Play"}</button>
    <button class="m-btn" onclick={() => go(i + 1)} disabled={i === m.scenes.length - 1} aria-label="Next scene">▶</button>
    <div class="m-dots" role="group" aria-label="Scenes">
      {#each m.scenes as s, n}<button class="m-dot" class:m-on={n === i} class:m-done={n < i} onclick={() => go(n)} aria-label={`Scene ${n + 1}: ${s.t}`}></button>{/each}
    </div>
    <span class="m-cnt">{i + 1} / {m.scenes.length}</span>
  </div>

  <div class="m-frame" bind:clientWidth={w} style="height:{H * k}px">
    <div class="m-stage" style="width:{W}px;height:{H}px;left:{(w - W * k) / 2}px;transform:scale({k})" aria-hidden="true">

      <!-- Teams chat -->
      <div class="m-chat" class:m-hot={now("ask") || now("answer")}>
        <div class="m-bar"><span class="m-tm">T</span>Teams · Finance close</div>
        <div class="m-msgs">
          <div class="m-me">
            <span class="m-bub">{askShown}{#if now("ask") && typed < m.ask.length}<i class="m-caret"></i>{/if}</span>
            <span class="m-av">C</span>
          </div>
          {#if now("ask") && typed >= m.ask.length}<div class="m-tick">Sent ✓</div>{/if}
          {#if past("door") && !past("answer")}
            <div class="m-status">{now("door") ? "Checking who you are" : "The agent is investigating"}<span class="m-dots3"><i></i><i></i><i></i></span></div>
          {/if}
          {#if ansShown}
            <div class="m-them">
              <span class="m-av m-ai">🤖</span>
              <span class="m-bub">{ansShown}{#if now("answer") && typed < m.answer.length}<i class="m-caret"></i>{/if}</span>
            </div>
          {/if}
        </div>
      </div>

      <!-- the front door (AI gateway) -->
      <div class="m-gate" class:m-hot={now("door")}>
        <svg viewBox="0 0 60 130" width="60" height="130">
          <path d="M6 128 V40 a24 24 0 0 1 48 0 V128" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" />
          <circle cx="30" cy="30" r="7" class="m-lamp" />
        </svg>
        <span class="m-lbl">Front door</span>
      </div>
      {#if now("door")}
        <div class="m-badge m-pop">
          <b>Who is asking?</b>
          <span>Controller ✓</span><span>Sees finance data only ✓</span><span>Team budget OK ✓</span>
        </div>
      {/if}

      <!-- the question travelling: chat → door → robot -->
      <div class="m-env" class:m-show={now("door") || now("wake")} style="left:{now("door") ? 312 : now("wake") ? 498 : 236}px;top:{now("door") ? 168 : now("wake") ? 196 : 92}px">✉️</div>

      <!-- three tool stations -->
      {#each STATIONS as [key, ic, t, sub]}
        {@const x = 390 + 138 * STATIONS.findIndex(s => s[0] === key)}
        <div class="m-stn" class:m-hot={now(key)} class:m-done={past(key)} style="left:{x}px">
          <b>{ic} {t}</b><small>{sub}</small>
          {#if past(key)}<span class="m-found" class:m-pop={now(key)}>{card(key)}</span>{/if}
        </div>
      {/each}

      <!-- code checks -->
      <div class="m-calc" class:m-hot={now("check")}>
        <b>🧮 Code checks (not AI)</b>
        {#if past("check")}
          {#each lines.filter(([, ok]) => ok || now("check")) as [t, ok], n}
            <span class="m-ln" class:m-bad={!ok} class:m-toss={!ok && now("check")} style="--d:{n * 0.9}s">{t}</span>
          {/each}
        {/if}
      </div>

      <!-- the approver -->
      <div class="m-appr" class:m-hot={now("approve")}>
        <b>🧑‍💼 Category manager</b>
        {#if past("approve")}
          <div class="m-slips">{#each [0, 1, 2, 3, 4] as n}<span class="m-slip" style="--d:{n * 0.15}s">claim</span>{/each}</div>
          <span class="m-ok">Approve ✓</span>
          <small class="m-sap">SAP sends them to suppliers</small>
        {:else}
          <small>waits for drafts</small>
        {/if}
      </div>

      <!-- the robot (the agent) -->
      <div class="m-bot" class:m-asleep={asleep} class:m-moving={moving} class:m-looking={looking} style="left:{pos[0]}px;top:{pos[1]}px">
        {#if now("wake")}<div class="m-think m-pop"><b>My plan</b>① the numbers<br />② the forecast<br />③ the contracts</div>{/if}
        {#if asleep}<span class="m-z m-z1">z</span><span class="m-z m-z2">z</span><span class="m-z m-z3">Z</span>{/if}
        <svg viewBox="0 0 80 88" width="80" height="88">
          <line x1="36" y1="4" x2="36" y2="15" stroke="currentColor" stroke-width="3" />
          <circle cx="36" cy="5" r="4.5" class="m-ant" />
          <rect x="10" y="14" width="52" height="34" rx="13" class="m-head" />
          <rect x="16" y="20" width="40" height="22" rx="9" fill="#1d2433" />
          <g class="m-eyes">
            <ellipse cx="28" cy="31" rx="4" ry="5" fill="#7ff3ff" />
            <ellipse cx="44" cy="31" rx="4" ry="5" fill="#7ff3ff" />
          </g>
          <path d="M31 38 q5 3 10 0" stroke="#7ff3ff" stroke-width="1.8" fill="none" class="m-smile" />
          <rect x="18" y="50" width="36" height="24" rx="8" class="m-body" />
          <circle cx="36" cy="62" r="4" class="m-heart" />
          <g class="m-arm">
            <line x1="54" y1="58" x2="64" y2="50" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
            <g class="m-lens"><circle cx="68" cy="44" r="7" fill="none" stroke="currentColor" stroke-width="3" /><circle cx="68" cy="44" r="5" class="m-glass" /></g>
          </g>
          <line x1="18" y1="58" x2="10" y2="66" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
          <g class="m-wheel" style="transform-origin:26px 80px"><circle cx="26" cy="80" r="7" class="m-tyre" /><line x1="19" y1="80" x2="33" y2="80" /><line x1="26" y1="73" x2="26" y2="87" /></g>
          <g class="m-wheel" style="transform-origin:46px 80px"><circle cx="46" cy="80" r="7" class="m-tyre" /><line x1="39" y1="80" x2="53" y2="80" /><line x1="46" y1="73" x2="46" y2="87" /></g>
        </svg>
      </div>
    </div>
  </div>

  <div class="m-cap" aria-live="polite">
    <b>{i + 1} · {sc.t}</b>
    <p>{sc.s}</p>
    <p class="m-why"><span>Why?</span> {sc.why}</p>
  </div>
</div>

<style>
  .m-mv { border: 1px solid var(--line); border-radius: 12px; background: var(--paper); padding: 14px; display: grid; gap: 12px; margin: 10px 0 }
  .m-ctl { display: flex; flex-wrap: wrap; align-items: center; gap: 8px }
  .m-btn { font: inherit; padding: 6px 12px; border-radius: 8px; border: 1px solid var(--line); background: var(--bg); color: var(--ink); cursor: pointer }
  .m-btn.m-main { background: var(--ink); color: var(--paper); border-color: var(--ink); font-weight: 600 }
  .m-btn:disabled { opacity: .4; cursor: default }
  .m-dots { display: flex; gap: 6px; margin-left: 4px }
  .m-dot { width: 11px; height: 11px; border-radius: 50%; border: 0; padding: 0; background: var(--line); cursor: pointer }
  .m-dot.m-done { background: color-mix(in srgb, var(--agent) 45%, var(--line)) }
  .m-dot.m-on { background: var(--agent); transform: scale(1.25) }
  .m-cnt { color: var(--muted); font-size: 12px }

  .m-frame { position: relative; overflow: hidden; border-radius: 10px; background: color-mix(in srgb, var(--agent) 4%, var(--bg)) }
  .m-stage { position: absolute; left: 0; top: 0; transform-origin: 0 0; font-size: 13px; color: var(--ink) }
  .m-stage > * { position: absolute }
  .m-hot { box-shadow: 0 0 0 3px color-mix(in srgb, var(--agent) 55%, transparent), 0 8px 24px color-mix(in srgb, var(--agent) 25%, transparent) }

  .m-chat { left: 16px; top: 16px; width: 270px; height: 300px; border: 1px solid var(--line); border-radius: 10px; background: var(--paper); overflow: hidden; transition: box-shadow .4s }
  .m-bar { display: flex; gap: 8px; align-items: center; padding: 8px 10px; background: color-mix(in srgb, #5b5fc7 18%, var(--paper)); font-weight: 600; font-size: 12px }
  .m-tm { width: 18px; height: 18px; border-radius: 4px; background: #5b5fc7; color: #fff; display: grid; place-items: center; font-size: 11px }
  .m-msgs { padding: 10px; display: grid; gap: 8px; align-content: start }
  .m-me, .m-them { display: flex; gap: 6px; align-items: flex-end }
  .m-me { justify-content: flex-end }
  .m-bub { padding: 7px 10px; border-radius: 12px; max-width: 200px; line-height: 1.35; font-size: 12.5px }
  .m-me .m-bub { background: color-mix(in srgb, #5b5fc7 22%, var(--paper)); border-bottom-right-radius: 3px; min-height: 1.35em }
  .m-them .m-bub { background: color-mix(in srgb, var(--agent) 14%, var(--paper)); border-bottom-left-radius: 3px; animation: rise .4s ease-out }
  .m-av { width: 24px; height: 24px; border-radius: 50%; background: var(--people); color: #fff; display: grid; place-items: center; font-weight: 700; font-size: 11px; flex: none }
  .m-av.m-ai { background: color-mix(in srgb, var(--agent) 25%, var(--paper)); font-size: 13px }
  .m-caret { display: inline-block; width: 2px; height: 1em; background: currentColor; margin-left: 1px; vertical-align: -2px; animation: blink .8s steps(1) infinite }
  .m-tick { justify-self: end; color: var(--ok); font-size: 11px; animation: rise .3s ease-out }
  .m-status { color: var(--muted); font-size: 11.5px; font-style: italic }
  .m-dots3 i { display: inline-block; width: 4px; height: 4px; margin-left: 3px; border-radius: 50%; background: var(--muted); animation: hop 1s infinite }
  .m-dots3 i:nth-child(2) { animation-delay: .15s } .m-dots3 i:nth-child(3) { animation-delay: .3s }

  .m-gate { left: 300px; top: 118px; color: var(--gate); display: grid; justify-items: center; gap: 2px; border-radius: 30px 30px 6px 6px; transition: box-shadow .4s }
  .m-gate .m-lamp { fill: var(--line); transition: fill .3s }
  .m-gate.m-hot .m-lamp { fill: var(--ok) }
  .m-gate .m-lbl { font-size: 11px; font-weight: 600 }
  .m-badge { left: 16px; top: 330px; width: 270px; padding: 8px 10px; border-radius: 10px; background: var(--paper); border: 2px solid var(--gate); display: grid; gap: 2px; font-size: 11.5px }
  .m-badge span { color: var(--ok) }
  .m-env { font-size: 22px; opacity: 0; transition: left 1s ease-in-out, top 1s ease-in-out, opacity .3s }
  .m-env.m-show { opacity: 1 }

  .m-stn { top: 16px; width: 126px; min-height: 98px; padding: 8px; border: 1px solid var(--line); border-radius: 10px; background: var(--paper); display: grid; gap: 3px; align-content: start; transition: box-shadow .4s, border-color .4s }
  .m-stn small, .m-calc small, .m-appr small { color: var(--muted); font-size: 11px }
  .m-stn.m-done { border-color: color-mix(in srgb, var(--agent) 50%, var(--line)) }
  .m-found { margin-top: 3px; padding: 4px 6px; border-radius: 6px; background: color-mix(in srgb, var(--agent) 14%, var(--paper)); font-size: 11.5px; font-weight: 600; line-height: 1.3 }

  .m-calc { left: 390px; top: 322px; width: 225px; min-height: 120px; padding: 8px 10px; border: 1px solid var(--line); border-radius: 10px; background: var(--paper); display: grid; gap: 4px; align-content: start; transition: box-shadow .4s }
  .m-ln { font: 12px var(--f-mono); color: var(--ok); opacity: 0; animation: rise .4s ease-out forwards; animation-delay: var(--d) }
  .m-ln.m-bad { color: var(--gap); text-decoration: line-through }
  .m-ln.m-toss { animation: rise .4s ease-out forwards, toss 1s ease-in forwards; animation-delay: var(--d), calc(var(--d) + 1.2s) }

  .m-appr { left: 628px; top: 322px; width: 160px; min-height: 120px; padding: 8px 10px; border: 1px solid var(--line); border-radius: 10px; background: var(--paper); display: grid; gap: 5px; align-content: start; transition: box-shadow .4s }
  .m-slips { display: flex; gap: 3px }
  .m-slip { font-size: 9.5px; padding: 2px 4px; border-radius: 3px; background: color-mix(in srgb, var(--people) 20%, var(--paper)); border: 1px solid var(--people); animation: slide .5s ease-out both; animation-delay: var(--d) }
  .m-ok { justify-self: start; padding: 4px 10px; border-radius: 6px; background: var(--ok); color: #fff; font-weight: 700; font-size: 12px; animation: press .5s 1.2s both }
  .m-sap { animation: rise .4s 1.8s both }

  .m-bot { width: 80px; height: 88px; color: var(--agent); transition: left 1.1s cubic-bezier(.5, 0, .3, 1), top 1.1s cubic-bezier(.5, 0, .3, 1); z-index: 2 }
  .m-bot svg { overflow: visible; animation: bob 2.4s ease-in-out infinite }
  .m-bot .m-head { fill: color-mix(in srgb, var(--agent) 18%, var(--paper)); stroke: currentColor; stroke-width: 2.5 }
  .m-bot .m-body { fill: color-mix(in srgb, var(--agent) 30%, var(--paper)); stroke: currentColor; stroke-width: 2.5 }
  .m-bot .m-ant { fill: #ffd34d; filter: drop-shadow(0 0 5px #ffd34d) }
  .m-bot .m-heart { fill: #ff7aa8 }
  .m-bot .m-tyre { fill: var(--paper); stroke: currentColor; stroke-width: 2.5 }
  .m-bot .m-wheel line { stroke: currentColor; stroke-width: 1.6 }
  .m-bot .m-glass { fill: color-mix(in srgb, #7ff3ff 35%, transparent) }
  .m-bot .m-eyes { transform-origin: 36px 31px; animation: blinkeye 4s infinite }
  .m-bot .m-arm { opacity: 0; transform-origin: 54px 58px; transition: opacity .3s }
  .m-bot.m-looking .m-arm { opacity: 1; animation: scan 1.2s ease-in-out infinite }
  .m-bot.m-moving svg { animation: tilt 1.1s ease-in-out }
  .m-bot.m-moving .m-wheel { animation: spin .5s linear infinite }
  .m-bot.m-asleep .m-ant { fill: var(--line); filter: none }
  .m-bot.m-asleep .m-eyes { animation: none; transform: scaleY(.15) }
  .m-bot.m-asleep .m-smile { opacity: 0 }
  .m-bot.m-asleep svg { animation: breathe 3s ease-in-out infinite }
  .m-z { position: absolute; left: 62px; top: 4px; font: 700 14px var(--f-display); color: var(--muted); animation: zz 2.4s ease-out infinite; opacity: 0 }
  .m-z2 { animation-delay: .8s } .m-z3 { animation-delay: 1.6s; font-size: 18px }
  .m-think { position: absolute; left: 84px; top: -24px; width: 140px; padding: 8px 10px; border-radius: 14px; background: var(--paper); border: 2px solid var(--agent); font-size: 12px; line-height: 1.45 }
  .m-think b { display: block; color: var(--agent) }
  .m-think::after { content: ""; position: absolute; left: -10px; bottom: 6px; width: 12px; height: 12px; border-radius: 50%; background: var(--paper); border: 2px solid var(--agent) }

  .m-pop { animation: pop .45s cubic-bezier(.3, 1.6, .5, 1) both }
  @keyframes pop { from { transform: scale(.4); opacity: 0 } to { transform: scale(1); opacity: 1 } }
  @keyframes rise { from { transform: translateY(6px); opacity: 0 } to { transform: none; opacity: 1 } }
  @keyframes blink { 50% { opacity: 0 } }
  @keyframes hop { 0%, 60%, 100% { transform: none } 30% { transform: translateY(-4px) } }
  @keyframes bob { 0%, 100% { transform: none } 50% { transform: translateY(-4px) } }
  @keyframes breathe { 0%, 100% { transform: none } 50% { transform: scale(1.02, .98) } }
  @keyframes tilt { 0%, 100% { transform: none } 25% { transform: rotate(-6deg) } 75% { transform: rotate(4deg) } }
  @keyframes spin { to { transform: rotate(360deg) } }
  @keyframes scan { 0%, 100% { transform: rotate(0) } 50% { transform: rotate(-18deg) } }
  @keyframes blinkeye { 0%, 92%, 100% { transform: none } 95% { transform: scaleY(.1) } }
  @keyframes zz { 0% { transform: translate(0, 0); opacity: 0 } 20% { opacity: 1 } 100% { transform: translate(14px, -26px); opacity: 0 } }
  @keyframes toss { to { transform: translate(60px, -40px) rotate(25deg); opacity: 0 } }
  @keyframes slide { from { transform: translateX(-40px); opacity: 0 } to { transform: none; opacity: 1 } }
  @keyframes press { 0% { transform: scale(.6); opacity: 0 } 60% { transform: scale(1.12); opacity: 1 } 80% { transform: scale(.94) } 100% { transform: none } }

  .m-cap { display: grid; gap: 4px }
  .m-cap b { font: 700 16px var(--f-display) }
  .m-cap p { margin: 0; max-width: 75ch }
  .m-cap .m-why { color: var(--muted) }
  .m-cap .m-why span { font-weight: 700; color: var(--agent) }

  .m-still *, .m-still *::before, .m-still *::after { animation: none !important; transition: none !important }
  .m-still .m-ln, .m-still .m-slip, .m-still .m-ok, .m-still .m-sap { opacity: 1 }
  .m-still .m-ln.m-toss { opacity: .5 }
</style>
