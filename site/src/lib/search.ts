import {STAGES, SUPPORT, PREPARATION} from '../data/journey';
import {CATS} from '../data/tools';
import {url} from './url';
export interface Hit {t:string;p:string;x:string;h:string;m?:'simple'|'expert';k?:string}
const clean=(s:string)=>s.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
export function buildIndex():Hit[]{
 const out:Hit[]=[];
 for(const version of ['built','target'] as const){
  for(const [i,s] of STAGES.entries())out.push({t:`${i+1}. ${s.title}`,p:`${version==='built'?'As built':'Enterprise target · proposed'} · Request journey`,x:clean([s.actor,s.summary,s.input,s.output,s.detail,s.stop,...s.calls,...(version==='target'?[s.addition,...s.targetCalls]:[])].join(' · ')),h:`${url('architecture/architecture.html')}#${version}-hld-${s.id}`,m:'expert'});
  for(const s of SUPPORT)out.push({t:s.title,p:`${version==='built'?'As built':'Proposed target'} · Supporting controls`,x:s.built+(version==='target'?' '+s.target:''),h:`${url('architecture/architecture.html')}#${version}-${s.id==='identity'?'sec':s.id==='network'?'net':s.id==='observe'?'obs':'more'}`,m:'expert'});
 }
 out.push({t:'Before the request: data and ML preparation',p:'As built · Scheduled work',x:PREPARATION.flat().join(' · '),h:`${url('architecture/architecture.html')}#built-lld-0`,m:'expert'});
 for(const c of CATS)out.push({t:c.n,p:`Tools · ${c.st==='built'?'Demonstration':'Production options or separate extensions'}`,x:clean([c.kid,...c.t.flatMap(t=>[t.n,t.why])].join(' · ')),h:`${url('landscape/tools.html')}#${c.id}`,k:c.t.map(t=>t.n).join(' · ')});
 return out;
}
