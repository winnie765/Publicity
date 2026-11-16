import type {StrategyInsight} from '../lib/intelligence/types';
import {notifyWorkspaceChange} from './workspace-data-client';
export async function saveContentIdea(item:StrategyInsight,review?:{title?:string;description?:string;sourceRefs?:{title:string;url:string}[]}){
 const refs:string[]=[];for(const ref of (review?.sourceRefs||[]).slice(0,3)){const value=ref.title.slice(0,300)+'\n'+ref.url;if(refs.join('\n\n').length+value.length+2<=2500)refs.push(value);}const sourceText=refs.join('\n\n'),prefix=sourceText?sourceText+'\n\n':'';
 const record={id:crypto.randomUUID(),title:(review?.title||item.title||'Content follow-up test').slice(0,300),description:prefix+(review?.description||['Observation: '+item.finding,'Why It Matters: '+item.explanation,'Recommended Action: '+item.recommendation,...(item.expectedImpact?['Expected Impact (hypothesis): '+item.expectedImpact]:[])].join('\n\n')).slice(0,Math.max(0,3000-prefix.length)),category:'Content Intelligence',priority:'Normal',status:'Open'};
 const response=await fetch('/api/workspace',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:'idea',action:'save',record})}),result=await response.json() as {error?:string};if(!response.ok)throw Error(result.error||'The idea could not be saved.');notifyWorkspaceChange();
}
