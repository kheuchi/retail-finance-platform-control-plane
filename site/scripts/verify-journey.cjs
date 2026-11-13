/* Browser acceptance checks for X.3. Uses a separate Playwright install via PLAYWRIGHT_MODULE.
   JOURNEY_BASE points to a built preview. No finance services or cloud actions are invoked. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base=(process.env.JOURNEY_BASE || 'http://127.0.0.1:4322/retail-finance-platform-control-plane/').replace(/\/?$/,'/');
const out=process.env.JOURNEY_ARTIFACTS || path.resolve('artifacts/journey-verification');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch();
 const report={views:[],checks:[],errors:[],failedResponses:[]};
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000},colorScheme:'light'});
  page.on('pageerror',e=>report.errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(base))report.failedResponses.push(`${r.status()} ${r.url()}`)});
  for(const route of ['','architecture/architecture.html','landscape/platform-landscape.html','landscape/tools.html']){
   const response=await page.goto(base+route,{waitUntil:'networkidle'});assert.equal(response.status(),200);
  }
  const route='architecture/architecture.html';
  let canonical;
  for(const width of [1440,768,390]){
   await page.setViewportSize({width,height:1000});
   await page.goto(base+route,{waitUntil:'networkidle'});
   for(const version of ['built','target'])for(const mode of ['Simple','Expert']){
    await page.getByRole('button',{name:version==='built'?'As built':'Enterprise target proposed',exact:true}).click();
    await page.waitForFunction(v=>document.querySelector('.scope-note strong')?.textContent?.includes(v==='built'?'Demonstrated':'Proposed'),version);
    await page.getByRole('button',{name:mode,exact:true}).click();
    const labels=await page.locator('.stage-list > li h3').allTextContents();
    assert.equal(labels.length,8);canonical??=labels;assert.deepEqual(labels,canonical);
    const details=await page.locator('.stage-detail').count();assert.equal(details,mode==='Expert'?8:0);
    assert.equal(await page.locator('.stage-list .addition').count(),version==='target'?8:0);
    assert.equal(await page.locator('.journey-flow').getByText(/Secret Manager/).count(),0);
    const geometry=await page.locator('.stage-list > li').evaluateAll(es=>es.map(e=>({top:e.getBoundingClientRect().top,bottom:e.getBoundingClientRect().bottom})));
    for(let i=1;i<8;i++)assert.ok(geometry[i].top>geometry[i-1].bottom,'Stages must flow down the page');
    const size=await page.evaluate(()=>({viewport:innerWidth,width:document.documentElement.scrollWidth}));assert.ok(size.width<=size.viewport,JSON.stringify(size));
    report.views.push({width,version,mode,stages:labels.length,overflow:false});
    if(width===1440&&mode==='Simple')await page.screenshot({path:path.join(out,`${version}-simple-desktop.png`),fullPage:true});
    if(width===390&&mode==='Expert'&&version==='target')await page.screenshot({path:path.join(out,'target-expert-mobile.png'),fullPage:true});
   }
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(base+route+'#built-hld',{waitUntil:'networkidle'});
  await page.getByRole('button',{name:'Simple',exact:true}).click();
  await page.getByRole('button',{name:'Next stage',exact:true}).click();
  await page.getByRole('button',{name:'Follow stage 2: Check access and readiness',exact:true}).getAttribute('aria-pressed').then(x=>assert.equal(x,'true'));
  await page.getByRole('button',{name:'Play',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('.stage.active')?.getAttribute('data-stage')==='plan',{timeout:6500});
  await page.getByRole('button',{name:'Pause',exact:true}).click();
  report.checks.push('Next, Play and Pause advance the selected stage');
  await page.getByRole('button',{name:'Follow stage 7: Get human approval',exact:true}).click();
  await page.getByRole('button',{name:'Show this stage in the workflow ↓',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('[data-stage="approve"]').getBoundingClientRect().top>=0 && document.querySelector('[data-stage="approve"]').getBoundingClientRect().top<innerHeight*0.75);
  report.checks.push('Follow control brings the chosen stage into view');
  await page.getByRole('button',{name:'Enterprise target proposed',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('.stage.active')?.getAttribute('data-stage')==='approve' && document.querySelector('.scope-note strong')?.textContent?.includes('Proposed'));
  await page.getByRole('button',{name:'As built',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('.stage.active')?.getAttribute('data-stage')==='approve' && document.querySelector('.scope-note strong')?.textContent?.includes('Demonstrated'));
  report.checks.push('Changing versions preserves the stage being compared');
  for(const [hash,expected] of [['built-lld-0','evidence'],['built-lld-1','evidence'],['built-lld-2','plan'],['built-lld-3','check'],['target-lld-4','plan'],['built-net','request'],['target-hld','request']]){
   await page.goto(base+route+'#'+hash,{waitUntil:'networkidle'});
   await page.waitForFunction(id=>document.querySelector('.stage.active')?.getAttribute('data-stage')===id,expected);
  }
  await page.goto(base+route+'#built-net',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>{const e=document.querySelector('#support-network');return e.open && e.getBoundingClientRect().top<innerHeight});
  report.checks.push('Seven legacy architecture links resolve; supporting-control links reveal their detail');
  for(const version of ['built','target']){
   await page.goto(base+'landscape/platform-landscape.html#'+version,{waitUntil:'networkidle'});
   await page.waitForFunction(v=>document.querySelector('.scope-note strong')?.textContent?.includes(v==='built'?'Demonstrated':'Proposed'),version);
   assert.deepEqual(await page.locator('.stage-list > li h3').allTextContents(),canonical);
  }
  report.checks.push('Landscape and architecture preserve identical stage order');
  await page.goto(base+route,{waitUntil:'networkidle'});
  await page.getByRole('searchbox',{name:'Search the site'}).fill('trusted evidence');
  const hit=page.locator('.search .res a').filter({hasText:'Retrieve trusted evidence'}).first();
  await hit.waitFor();await hit.click();
  await page.waitForFunction(()=>document.querySelector('.stage.active')?.getAttribute('data-stage')==='evidence');
  assert.equal(await page.getByRole('button',{name:'Expert',exact:true}).getAttribute('aria-pressed'),'true');
  report.checks.push('Search lands at the evidence stage and opens Expert detail');
  await page.setViewportSize({width:390,height:844});await page.emulateMedia({colorScheme:'dark'});
  await page.goto(base+route+'#built-hld',{waitUntil:'networkidle'});
  await page.getByRole('button',{name:'Simple',exact:true}).click();
  await page.screenshot({path:path.join(out,'built-simple-mobile-dark.png'),fullPage:true});
  assert.equal(report.errors.length,0,report.errors.join('\n'));assert.equal(report.failedResponses.length,0,report.failedResponses.join('\n'));
  report.checks.push('No page JavaScript errors or local HTTP failures during checked flows');
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
