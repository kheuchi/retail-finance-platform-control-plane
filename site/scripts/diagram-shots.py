"""Capture request-journey screenshots from a built site preview.

Usage: python site/scripts/diagram-shots.py --base http://127.0.0.1:4321/retail-finance-platform-control-plane/
Requires Node and Playwright + Chromium. Set PLAYWRIGHT_MODULE to a separate Playwright installation if needed.
This writes documentation images only. It never runs or deploys the finance platform.
"""
import argparse
import os
from pathlib import Path
import subprocess

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--base', required=True, help='Built site preview URL, including the configured base path')
parser.add_argument('--node', default='node')
args = parser.parse_args()
out = Path(__file__).resolve().parents[2] / 'docs' / 'architecture' / 'img'
out.mkdir(parents=True, exist_ok=True)
script = r'''
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base=process.env.JOURNEY_BASE.replace(/\/$/,'')+'/architecture/architecture.html';
const out=process.env.JOURNEY_OUT;
(async()=>{const browser=await chromium.launch();try{
 const page=await browser.newPage({viewport:{width:1180,height:1000},deviceScaleFactor:1.5,colorScheme:'light'});
 await page.goto(base,{waitUntil:'networkidle'});
 await page.getByRole('button',{name:'Expert',exact:true}).click();
 const jobs=[['built-hld','built','overview'],['target-hld','target','overview'],
 ['built-lld-data-platform','built','data'],['built-lld-ml','built','prep'],
 ['built-lld-agent','built','agent'],['built-lld-identity-cicd','built','identity'],
 ['target-lld-agent','target','agent']];
 for(const [name,version,kind] of jobs){
  await page.getByRole('button',{name:version==='built'?'As built':'Enterprise target proposed',exact:true}).click();
  await page.waitForFunction(v=>document.querySelector('.scope-note strong')?.textContent?.includes(v==='built'?'Demonstrated':'Proposed'),version);
  await page.evaluate(()=>{document.querySelectorAll('details').forEach(e=>e.open=true)});
  const css=await page.addStyleTag({content:`
   .journey-guide,.scope-footer,.supporting,.stage-pick,.flow-heading span{display:none!important}
   .journey-columns{grid-template-columns:1fr!important}.journey-main{gap:16px!important}
   .journey-intro{display:none!important}.stage-list{gap:29px!important}.stage{padding:15px 20px!important}
   .stage-summary{margin-top:8px!important}.request-card{padding:18px 22px!important}
   ${kind==='overview'?'.stage-detail,.preparation{display:none!important}':''}
   ${kind==='data'?'.stage:not([data-stage="evidence"]),.scope-note,.request-card,.flow-heading{display:none!important}.stage::after{display:none!important}':''}
   ${kind==='agent'?'.stage-detail,.preparation{display:none!important}':''}
   ${kind==='identity'?'.supporting{display:block!important}.journey-columns,.scope-note,.request-card,.preparation,.supporting>p{display:none!important}.support-grid{display:block!important}.support-grid details:not(#support-identity){display:none!important}':''}
   ${kind==='prep'?'.journey-columns,.scope-note,.request-card{display:none!important}':''}
  `});
  await page.locator('main').screenshot({path:out+'/'+name+'.png'});
  await css.evaluate(e=>e.remove());
  console.log(name);
 }
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
'''
env = dict(os.environ, JOURNEY_BASE=args.base, JOURNEY_OUT=str(out))
subprocess.run([args.node, '-e', script], env=env, check=True)
