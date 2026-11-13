<script lang="ts">
  import {onMount, tick} from 'svelte';
  import {STAGES, PREPARATION, SUPPORT, VIEWS, type Version} from '../data/journey';
  let {landscape=false}: {landscape?: boolean}=$props();
  let version=$state<Version>('built');
  let mode=$state<'simple'|'expert'>('simple');
  let view=$state('big');
  let active=$state(0);
  let playing=$state(false);
  const stage=$derived(STAGES[active]);
  const technical=$derived(mode==='expert');
  const relevantSupport=$derived(view==='net'?'network':view==='obs'||view==='eval'?'observe':view==='sec'||(view==='lld'&&active===1)?'identity':view==='more'?'cost':'');
  function fromHash(){
    const parts=location.hash.slice(1).split('-');
    version=parts[0]==='target'?'target':'built';
    view=parts[0]==='eval'?'eval':VIEWS.some(([k])=>k===parts[1])?parts[1]:'big';
    const legacy=parts[1]==='lld'?({'0':3,'1':3,'2':2,'3':1,'4':2} as Record<string,number>)[parts[2]]:undefined;
    active=legacy??Math.max(0,STAGES.findIndex(s=>s.id===parts[2]));
    playing=false;
    if(view==='lld')setMode('expert');
    void tick().then(()=>{
      if(relevantSupport)document.getElementById(`support-${relevantSupport}`)?.scrollIntoView({block:'start'});
      else if(view==='lld'&&active===3)document.querySelector('.preparation')?.scrollIntoView({block:'start'});
      else if(parts[2])document.querySelector(`[data-stage="${STAGES[active].id}"]`)?.scrollIntoView({block:'start'});
    });
  }
  function go(v:Version,section=view){location.hash=`${v}-${section}-${STAGES[active].id}`;}
  function setMode(m:'simple'|'expert'){mode=m;try{localStorage.setItem('rfp-mode',m)}catch{}}
  function pick(i:number){active=i;playing=false;}
  function advance(delta:number){active=Math.max(0,Math.min(7,active+delta));}
  function showStage(){document.querySelector(`[data-stage="${stage.id}"]`)?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
  onMount(()=>{
    try{mode=localStorage.getItem('rfp-mode')==='expert'?'expert':'simple'}catch{}
    fromHash();
    const onMode=(e:Event)=>setMode((e as CustomEvent<'simple'|'expert'>).detail);
    window.addEventListener('hashchange',fromHash);window.addEventListener('rfp-mode',onMode);
    const timer=setInterval(()=>{if(playing){if(active===7)playing=false;else active+=1}},4500);
    return()=>{clearInterval(timer);window.removeEventListener('hashchange',fromHash);window.removeEventListener('rfp-mode',onMode)};
  });
</script>

<div class="journey">
  <div class="journey-toolbar wrap">
    <div class="journey-switches">
      <div class="segmented" role="group" aria-label="Architecture version">
        <button aria-pressed={version==='built'} onclick={()=>go('built')}>As built</button>
        <button aria-pressed={version==='target'} onclick={()=>go('target')}>Enterprise target <small>proposed</small></button>
      </div>
      <div class="segmented" role="group" aria-label="Explanation level">
        <button aria-pressed={mode==='simple'} onclick={()=>setMode('simple')}>Simple</button>
        <button aria-pressed={mode==='expert'} onclick={()=>setMode('expert')}>Expert</button>
      </div>
    </div>
    <p class="journey-reading-note">Read the stages from top to bottom. Switch to Expert for the component hand-offs; the route stays the same.</p>
  </div>
  <main class="wrap journey-main">
    <div class="journey-intro">
      <p class="eyebrow">{landscape?'Platform landscape, in request order':'One request · eight stages · one direction'}</p>
      <h2>{version==='built'?'Follow a month-end request':'The same request, designed for production'}</h2>
      <p>{version==='built'?'Follow the demonstrated implementation from the controller’s question to the approved result. Read from top to bottom.':'The month-end question, stage numbers and direction stay the same. Each proposed addition appears beside the existing capability.'}</p>
    </div>
    <div class="scope-note" class:proposed={version==='target'}>
      <strong>{version==='built'?'Demonstrated implementation · currently paused':'Proposed redesign · not deployed'}</strong>
      <p>{version==='built'?'The core was demonstrated in October 2026. The paid network endpoints were removed on 17 October; this page is not a live finance application.':'This is a design for extending the month-end demonstration. Portal, user-scoped policy, evidence versioning, review UI and delivery guarantees have not been implemented. No runtime or infrastructure changes accompany this redesign.'}</p>
    </div>
    <details class="preparation" open={view==='lld'&&active===3}>
      <summary>Before the request: prepare the trusted data</summary>
      <p>This scheduled work runs separately. The agent reads its results; a question does not rebuild the lakehouse or retrain the models.</p>
      <ol>{#each PREPARATION as [name,description]}<li><strong>{name}</strong><span>{description}</span></li>{/each}</ol>
      {#if version==='target'}<p class="addition">Proposed: replace synthetic source files with approved source integrations and freshness checks. The preparation path remains separate from the request.</p>{/if}
    </details>
    <div class="request-card"><span class="eyebrow">The request stays the same in every view</span><blockquote>“Draft the August 2026 month-end commentary: revenue and margin against budget, exceptions, and the forecast.”</blockquote><p>Expected result: checked commentary, released only after a controller approves.</p></div>
    <div class="journey-columns">
      <section class="journey-flow" aria-label="Request workflow">
        <div class="flow-heading"><h3>Start here ↓</h3><span>Read down to the delivered result</span></div>
        <ol class="stage-list">
          {#each STAGES as s,i}
            <li class="stage" class:active={i===active} class:human={i===0||i===6} data-stage={s.id}>
              <div class="stage-top"><span class="stage-number">{String(i+1).padStart(2,'0')}</span><div><span class="actor">{s.actor}</span><h3>{s.title}</h3></div><button class="stage-pick" aria-label={`Follow stage ${i+1}: ${s.title}`} aria-pressed={i===active} onclick={()=>pick(i)}>Follow</button></div>
              <p class="stage-summary">{s.summary}</p>
              <div class="stage-result"><span>Then</span> {s.output}</div>
              {#if version==='target'}<div class="addition"><strong>Production addition · proposed</strong><p>{s.addition}</p></div>{/if}
              {#if technical}
                <details class="stage-detail" open={view==='net'||view==='lld'||i===active}>
                  <summary>Components and hand-offs</summary>
                  <ol class="component-chain">{#each version==='target'?s.targetCalls:s.calls as call}<li>{call}</li>{/each}</ol>
                  <p>{s.detail}</p>
                  {#if version==='target'}<p>The chain above is the proposed production path. The paragraph describes the demonstrated implementation it extends.</p>{/if}
                </details>
              {/if}
              {#if view==='eval'||view==='sec'}<p class="stop"><strong>Gate:</strong> {s.stop}</p>{/if}
            </li>
          {/each}
        </ol>
      </section>
      <aside class="journey-guide" aria-label="Walk-through controls">
        <div class="guide-card">
          <p class="eyebrow">Follow one request</p>
          <div class="player-controls"><button aria-label="Previous stage" disabled={active===0} onclick={()=>{playing=false;advance(-1)}}>←</button><button onclick={()=>{if(active===7)active=0;playing=!playing}}>{playing?'Pause':'Play'}</button><button aria-label="Next stage" disabled={active===7} onclick={()=>{playing=false;advance(1)}}>→</button></div>
          <div aria-live="polite" class="current-stage"><span>Stage {active+1} of 8</span><h3>{stage.title}</h3><p>{stage.summary}</p><dl><dt>Receives</dt><dd>{stage.input}</dd><dt>Passes onward</dt><dd>{stage.output}</dd></dl><p class="stop">{stage.stop}</p></div>
          <button class="show-stage" onclick={showStage}>Show this stage in the workflow ↓</button>
          <p class="guide-note">The numbers describe the journey. The agent can read more evidence while drafting; approval still gates every send.</p>
        </div>
        <div class="continuity-card"><h3>What changes between views?</h3><p><strong>Simple → Expert:</strong> the same eight stages, with component hand-offs revealed.</p><p><strong>As built → Target:</strong> the same request, with production additions marked as proposals.</p></div>
      </aside>
    </div>
    <section class="supporting" aria-label="Supporting controls">
      <p class="eyebrow">Supporting the whole journey</p><h2>Essential controls, outside the main path</h2><p>These services protect and operate the workflow. They are not extra investigation steps for the reader to navigate.</p>
      <div class="support-grid">{#each SUPPORT as s}<details open={s.id===relevantSupport} id={`support-${s.id}`}><summary>{s.title}</summary><p>{s.built}</p>{#if version==='target'}<p class="addition">{s.target}</p>{/if}</details>{/each}</div>
    </section>
    <section class="scope-footer" id="redesign-scope"><h2>What this redesign changes</h2><p>The website and documentation explain the platform in request order. The data pipelines, agent implementation and cloud infrastructure are unchanged. As-built capabilities remain the demonstration; production additions remain proposals.</p><p>Margin recovery is a separate possible use case, not the enterprise version of this request. Its earlier design remains in <a href="https://github.com/kheuchi/retail-finance-platform-control-plane/blob/main/docs/target/margin-recovery.md">the margin recovery design</a>.</p></section>
  </main>
</div>
