import {industryEvidence,selectIndustryArticles,trendFilters,type TrendFilters} from './industry-trends';
import {summarisePosts} from './analytical-dashboards';
import {loadData} from './data-service';
import {readIndustryTrends} from './industry-trends';
import type {Storage} from './storage-contract';
export async function industryOpportunityEvidence(store:Storage,input:TrendFilters={},selected:unknown=[]){
 const filters=trendFilters(input),snapshot=await readIndustryTrends(store),eligible=selectIndustryArticles(snapshot,filters);
 if(!Array.isArray(selected)||selected.length>3||selected.some(id=>typeof id!=='string'||!eligible.some(a=>a.id===id)))throw Error('Select up to three available source updates in the current filters.');
 const articles=selected.length?eligible.filter(a=>selected.includes(a.id)):eligible.slice(0,3);if(!articles.length)throw Error('No qualifying dated sources in this selection. Choose a wider period or check for updates.');
 const data=await loadData(store,'social'),pack=industryEvidence({...snapshot!,articles}),brands=data.config.brands.filter(b=>b!=='Unclassified').slice(0,20),formats=data.config.types.slice(0,30);
 if(!brands.length||!formats.length)throw Error('Add a brand and content type in Configuration before generating content ideas.');
 pack.industryContext={brands,formats};pack.facts.push({id:'IPLAN',label:'Allowed planning context',text:JSON.stringify({brands,platforms:['Facebook','Instagram'],formats,context:'Tzu Chi Community Care in Singapore. Suggestions are drafts for staff review, never verified audience preferences or promised results.'})});
 const rows=data.posts.filter(p=>p.status!=='draft'&&['Facebook','Instagram'].includes(p.platform));
 for(const platform of ['Facebook','Instagram'])for(const brand of brands){const group=rows.filter(p=>p.platform===platform&&p.brand===brand),stats=summarisePosts(group);if(stats.measured>=3)pack.facts.push({id:'INTERNAL'+pack.facts.length,label:'Internal descriptive performance',text:JSON.stringify({platform,brand,measured:stats.measured,averageInteractions:stats.average,limitation:'Descriptive all-history mix; not proof that an external topic will improve engagement.'})});}
 return {pack,articles,filters};
}
