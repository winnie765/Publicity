import {loadData} from './data-service';
import type {Storage} from './storage-contract';
import {hasWorkvivo} from './workvivo-interaction-types';
import {workvivoPosts} from './workvivo-posts';
import {assessPost,postEvidence,contentPortfolio} from './post-content-intelligence';
import {industryEvidence,readIndustryTrends} from './industry-trends';
import {calculateEvidence} from './intelligence/evidence';
import type {Filters} from './intelligence/types';

export function contentFilters(value:any):Filters{
 if(value!==undefined&&(!value||typeof value!=='object'||Array.isArray(value)))throw Error('Choose valid content filters.');
 const filters:Filters={};for(const key of ['start','end','brand','platform','account','location'] as const){const entry=value?.[key];if(entry!==undefined&&entry!==''){if(typeof entry!=='string'||entry.length>120)throw Error('Choose valid content filters.');filters[key]=entry;}}
 for(const key of ['start','end'] as const)if(filters[key]&&(!/^\d{4}-\d{2}-\d{2}$/.test(filters[key]!)||!Number.isFinite(Date.parse(filters[key]!))||new Date(filters[key]!).toISOString().slice(0,10)!==filters[key]))throw Error('Choose valid reporting dates.');
 if(filters.start&&filters.end&&filters.start>filters.end)throw Error('The start date must precede the end date.');if(filters.platform&&!['Facebook','Instagram','Workvivo'].includes(filters.platform))throw Error('Choose a supported platform.');return filters;
}
export async function contentIntelligenceEvidence(store:Storage,input:any){
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Choose a post or content filter selection.');
 const data=await loadData(store,input?.postId?'social':'followers');
 if(input.postId!==undefined){
  if(typeof input.postId!=='string'||!input.postId.trim()||input.postId.length>100)throw Error('Choose a saved post.');const original=data.posts.find(post=>post.id===input.postId);if(!original)throw Error('The post is no longer available.');
  if(input.context!==undefined&&!['social','workvivo'].includes(input.context))throw Error('Choose a valid post context.');
  if(input.context==='workvivo'&&!hasWorkvivo(original))throw Error('This post is not associated with Workvivo.');
  const posts=input.context==='workvivo'?workvivoPosts(data.posts):data.posts,target=posts.find(post=>post.id===original.id);if(!target)throw Error('The post is not available in this context.');
  const assessment=assessPost(posts,target);return {assessment,pack:postEvidence(assessment)};
 }
 const filters=contentFilters(input?.filters),portfolio=contentPortfolio(data,filters),industry=await readIndustryTrends(store),pack=calculateEvidence(data,'content',filters),external=industryEvidence(industry);
 pack.scope='content-strategy';pack.plannerContext=portfolio.posts.length>0||!!industry?.articles.length;pack.version='content-strategy-v1';
 pack.facts.push({id:'CTHEMES',label:'Calculated content theme rankings',text:JSON.stringify(portfolio.themes)},{id:'CFORMATS',label:'Calculated content format rankings',text:JSON.stringify(portfolio.formats)},{id:'CBRANDS',label:'Calculated brand rankings',text:JSON.stringify(portfolio.brands)},{id:'CPOSTS',label:'Post assessment coverage',text:JSON.stringify({high:portfolio.high.length,belowAverageOrLowVisibility:portfolio.low.length,total:portfolio.posts.length})},...external.facts);
 pack.limitations.push(...external.limitations,'Theme and format rankings are within each platform and require at least three measured posts per group. Unclassified themes are not inferred from titles.','Propose a measurable content test rather than inventing a recommended percentage allocation, a guaranteed impact or a cause. External source updates do not establish social-media performance.');
 return {portfolio,industry,pack};
}
