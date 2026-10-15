import type {Dataset,Follower} from './model';
import {dimensions} from './account-structure';
import {latestFollower} from './follower-snapshots';
export type FollowerAccount={name:string;platform:string;brand?:string};
export const defaultFollowerAccounts:FollowerAccount[]=['Facebook','Instagram'].flatMap(platform=>['SEEN','GLOW','Longevity Courtyard'].map(brand=>({name:platform+' '+brand,platform,brand})));
export function followerAccount(platform:string,label:string){const brand=dimensions(label).brand;return brand==='Unclassified'?{name:label,platform}:{name:platform+' '+brand,platform,brand};}
export function followerAccounts(data:Dataset){return Array.from(new Map([...defaultFollowerAccounts,...data.config.brands.filter(b=>b&&b!=='Unclassified').flatMap(brand=>['Facebook','Instagram'].map(platform=>({name:platform+' '+brand,platform,brand}))),...data.config.accounts.filter(a=>!!a.brand),...(data.config.followerAccounts||[]),...data.followers.map((f:any)=>({name:f.account,platform:f.platform||data.config.accounts.find(a=>a.name===f.account)?.platform||'',brand:f.accountBrand||dimensions(f.account).brand}))].map(a=>[a.name,a])).values()).filter(a=>a.platform==='Facebook'||a.platform==='Instagram');}
export function accountSnapshots(rows:Follower[]){if(new Set(rows.map(f=>f.account)).size>1)throw Error("Select one account before calculating follower history.");return [...new Set(rows.map(f=>f.date))].sort().flatMap(date=>{const f=latestFollower(rows.filter(f=>f.date===date));return f?[{id:f.id,date,followers:f.followers,createdAt:'',updatedAt:(f as any).updatedAt||'',account:f.account}]:[];});}
// Brand totals use the latest known count for each component account as of a date.
// Before every component has an observation, the total is unavailable.
export function followerSeries(data:Dataset,view:'account'|'brand',selection:string,cutoff='9999-12-31'){
 const accounts=followerAccounts(data).filter(a=>view==='account'?a.name===selection:a.brand===selection);
 const raw=data.followers.filter(f=>accounts.some(a=>a.name===f.account)&&f.date<=cutoff);
 const coverage=accounts.map(a=>({...a,snapshot:latestFollower(raw.filter(f=>f.account===a.name),cutoff)}));
 const snapshots=view==='account'?accountSnapshots(raw):[...new Set(raw.map(f=>f.date))].sort().flatMap(date=>{const parts=accounts.map(a=>latestFollower(raw.filter(f=>f.account===a.name),date));return accounts.length&&parts.every(Boolean)?[{id:selection+'-'+date,date,followers:parts.reduce((n,f)=>n+f!.followers,0),createdAt:'',updatedAt:'',account:selection}]:[];});
 return {accounts,raw,snapshots,coverage,latest:snapshots.at(-1),complete:!!accounts.length&&coverage.every(c=>!!c.snapshot)};
}
