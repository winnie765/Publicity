import type {Dataset,Post,Config} from './model';
export function dimensions(label:string){
 const brand=/\b(GLOW|SEEN)(?:SG)?\b/i.exec(label)?.[1]?.toUpperCase()||'Unclassified';
 const location=/\b(Bukit\s*Batok|BB|Nanyang|NY)\b/i.exec(label)?.[1];
 return {brand,location:location?(/^(BB|Bukit)/i.test(location)?'Bukit Batok':'Nanyang'):'Unclassified'};
}
export function canonicalAccount(platform:string,label:string,brand:string){return platform==='Facebook'?'Facebook · Shared':platform==='Workvivo'?'Workvivo · Internal':brand!=='Unclassified'?`Instagram ${brand}`:'Instagram · Unspecified account';}
export function migrateDataset(data:Dataset):Dataset{
 const c:any=data.config,legacy=!c.brands&&!!c.programmes; c.brands??=c.programmes||[];if(legacy)for(const b of ['GLOW','SEEN'])if(!c.brands.includes(b))c.brands.push(b);if(legacy)for(const l of ['Bukit Batok','Nanyang'])if(!c.locations.includes(l))c.locations.push(l);delete c.programmes;
 const aliases=new Map<string,string>();
 for(const a of c.accounts){const brand=a.brand??a.programme??dimensions(a.name).brand;aliases.set(a.name,/^(Facebook|Instagram|Workvivo) [\u00b7]/.test(a.name)?canonicalAccount(a.platform,a.name,brand):a.name);}
 data.posts=data.posts.map((raw:any)=>{const p:any={...raw,brand:raw.brand??raw.programme??dimensions(raw.account).brand,description:raw.description??raw.notes??''};const derived=dimensions(p.brand+' '+p.location);p.brand=derived.brand==='Unclassified'?p.brand:derived.brand;p.location=derived.location==='Unclassified'?p.location:derived.location;p.account=aliases.get(raw.account)||canonicalAccount(p.platform,p.account,p.brand);delete p.programme;delete p.accountProgramme;return p;});
 data.followers=data.followers.map((raw:any)=>{const platform=raw.platform||c.accounts.find((a:any)=>a.name===raw.account)?.platform;if(raw.importSheet?.trim()==='Followers'){const shared=c.accounts.find((a:any)=>a.platform==='Facebook');return {...raw,platform:'Facebook',account:shared?aliases.get(shared.name)||shared.name:canonicalAccount('Facebook','','Unclassified'),segment:raw.segment||raw.account,workbookAccount:raw.workbookAccount||raw.account.replace(/^(Facebook|Instagram|Workvivo) [\u00b7] /,''),audienceScope:'shared-snapshot',accountBrand:undefined};}return {...raw,account:aliases.get(raw.account)||raw.account,...(platform==='Facebook'&&/^Facebook [\u00b7]/.test(raw.account)&&!raw.account.includes('Shared')?{segment:raw.segment||raw.account,audienceScope:'legacy-segment'}:{})};});
 c.accounts=Array.from(new Map(c.accounts.map((a:any)=>{const name=aliases.get(a.name)||a.name;return [name,{name,platform:a.platform,...(a.platform==='Instagram'&&dimensions(name).brand!=='Unclassified'?{brand:dimensions(name).brand}:{})}]})).values());
 c.brands=[...new Set(data.posts.map(p=>p.brand).concat(c.brands.map((b:string)=>dimensions(b).brand==='Unclassified'?b:dimensions(b).brand)))];
 c.locations=[...new Set(data.posts.map(p=>p.location).concat(c.locations.map((l:string)=>dimensions(l).location==='Unclassified'?l:dimensions(l).location)))];
 return data;
}
