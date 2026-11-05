import type {StrategyInsight} from '../lib/intelligence/types';
import {notifyWorkspaceChange} from './workspace-data-client';
export async function saveContentIdea(item:StrategyInsight){
 const record={id:crypto.randomUUID(),title:(item.title||'Content follow-up test').slice(0,300),description:['Observation: '+item.finding,'Why It Matters: '+item.explanation,'Recommended Action: '+item.recommendation,...(item.expectedImpact?['Expected Impact (hypothesis): '+item.expectedImpact]:[])].join('\n\n').slice(0,3000),category:'Content Intelligence',priority:'Normal',status:'Open'};
 const response=await fetch('/api/workspace',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:'idea',action:'save',record})}),result=await response.json() as {error?:string};if(!response.ok)throw Error(result.error||'The idea could not be saved.');notifyWorkspaceChange();
}
