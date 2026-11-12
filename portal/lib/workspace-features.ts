/** Primary destinations only. Contextual shortcuts must open these tools, not copy them. */
export const workspaceFeatures={
 executive:{label:'Executive Dashboard',href:'/workspace',page:0,purpose:'Management summary and decisions'},
 posts:{label:'Social Media Posts',href:'/workspace/posts',page:16,purpose:'Create, edit and update recorded posts'},
 analytics:{label:'Social Media Analytics',href:'/workspace/analytics',page:11,purpose:'Detailed performance, comparisons and data quality'},
 facebook:{label:'Facebook',href:'/workspace/analytics/facebook',page:11,purpose:'Detailed Facebook performance'},
 instagram:{label:'Instagram',href:'/workspace/analytics/instagram',page:11,purpose:'Detailed Instagram performance'},
 hits:{label:'Top Hits Intelligence',href:'/workspace/top-hits',page:2,purpose:'Capped top-ten rankings and recurring features'},
 workvivo:{label:'Workvivo Insights',href:'/workspace/workvivo',page:5,purpose:'Internal performance and linked interactions'},
 followers:{label:'Followers',href:'/workspace/followers',page:10,purpose:'Account histories and follower record management'},
 trends:{label:'Industry Trends',href:'/workspace/industry-trends',page:18,purpose:'Dated external sector sources'},
 analyst:{label:'AI Social Media Analyst',href:'/workspace/analyst',page:19,purpose:'Evidence-linked recommendations and follow-up experiments'},
 builder:{label:'AI Dashboard Builder',href:'/workspace/dashboard-builder',page:20,purpose:'Staff-requested custom analytical views'},
 content:{label:'Content Intelligence',href:'/workspace/content',page:1,purpose:'Themes, relative performance and content strategy'},
 planner:{label:'Content Planner',href:'/workspace/planner',page:13,purpose:'Plans, events, campaigns and scheduling'},
 studio:{label:'AI Content Studio',href:'/workspace/assistant',page:14,purpose:'Writing and editing reviewed communications drafts'},
 reports:{label:'Reports',href:'/workspace/reports',page:12,purpose:'Generate monthly reporting outputs'},
 reportArchive:{label:'Reports Archive',href:'/workspace/reports/archive',page:12,purpose:'Saved report snapshots; accessed within Reports'},
 publicSite:{label:'Public Site Manager',href:'/workspace/site-manager',page:15,purpose:'Manage public content and media'},
 imports:{label:'Data Management & Imports',href:'/workspace/import',page:8,purpose:'Workbook review, imports, exports and dataset operations'},
 configuration:{label:'Configuration',href:'/workspace/settings',page:9,purpose:'Shared master data'},
 trash:{label:'Trash & Recycling Bin',href:'/workspace/trash',page:16,purpose:'Recover retained records or confirm permanent deletion'},
 guide:{label:'User Guide',href:'/workspace/user-guide',page:17,purpose:'How to use the product; accessed from Settings'},
 records:{label:'Records & Trash',href:'/workspace/records',page:16,purpose:'Compatible generic record/archive maintenance'}
} as const;
export type FeatureId=keyof typeof workspaceFeatures;
export type WorkspaceRoute={initialPage:number;initialAnalyticsPlatform?:'Facebook'|'Instagram';initialReportsArchive?:boolean;initialRecordsTrash?:boolean;initialPostsOnly?:boolean};
export const workspaceRoutes:Record<string,WorkspaceRoute>=Object.fromEntries(Object.entries(workspaceFeatures).map(([id,f])=>[f.href,{initialPage:f.page,...(id==='posts'?{initialPostsOnly:true}:id==='trash'?{initialRecordsTrash:true}:id==='reportArchive'?{initialReportsArchive:true}:id==='facebook'?{initialAnalyticsPlatform:'Facebook' as const}:id==='instagram'?{initialAnalyticsPlatform:'Instagram' as const}:{})}]));
// Old URLs remain valid. They are aliases, not additional sidebar tools.
for(const [alias,id] of Object.entries({'/workspace/admin':'imports','/workspace/advisor':'studio','/workspace/publishing':'publicSite'} as const))workspaceRoutes[alias]=workspaceRoutes[workspaceFeatures[id].href];
export const settingsFeatureIds:FeatureId[]=['guide'];
export const sidebarFeatureIds:FeatureId[]=['executive','posts','analytics','facebook','instagram','hits','workvivo','followers','trends','analyst','builder','content','planner','studio','reports','publicSite','imports','configuration','trash'];
export const primaryPageRoutes:Record<number,string>=Object.fromEntries(sidebarFeatureIds.filter(id=>!['facebook','instagram','trash'].includes(id)).map(id=>[workspaceFeatures[id].page,workspaceFeatures[id].href]));
primaryPageRoutes[16]=workspaceFeatures.posts.href;primaryPageRoutes[17]=workspaceFeatures.guide.href;

export function workspacePageName(page:number,postsOnly=false,trash=false){if(page===16)return postsOnly?workspaceFeatures.posts.label:trash?workspaceFeatures.trash.label:workspaceFeatures.records.label;if(page===12)return 'Monthly Report Generator';if(page===8)return 'Data Management';return Object.values(workspaceFeatures).find(f=>f.page===page)?.label||'Workspace';}
