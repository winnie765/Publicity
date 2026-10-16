import {followerAccounts,followerSeries} from './follower-accounts';
import {accountFollowerAnalytics} from './facebook-follower-analytics';
import type {Dataset} from './model';

export function followerComparison(data:Dataset,start?:string,end?:string){
 return followerAccounts(data).map(account=>{
  const history=followerSeries(data,'account',account.name,end),analytics=accountFollowerAnalytics(history.snapshots,[],history.raw,account.name);
  const snapshot=history.coverage[0]?.snapshot,latest=snapshot?analytics.rows.find(r=>r.date===snapshot.date):undefined;
  const previous=snapshot?history.snapshots.filter(s=>s.date<snapshot.date).at(-1):undefined;
  const rows=analytics.rows.filter(r=>(!start||r.key>=start.slice(0,7))&&(!end||r.key<=end.slice(0,7)));
  const prior=latest?analytics.rows.filter(r=>r.key<latest.key).at(-1):undefined;
  const momentum=latest?.growthPercentage!=null&&prior?.growthPercentage!=null?latest.growthPercentage-prior.growthPercentage:null;
  return {...account,snapshot,previous,growth:latest?.sincePrevious,growthPercentage:latest?.sincePreviousPercentage,monthlyRate:latest?.growthPercentage,momentum,rows};
 });
}
