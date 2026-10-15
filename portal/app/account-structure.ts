import type {Dataset,Post,Config} from './model';
export const longevityBrand='Longevity Courtyard';
export const brandName=(value:string)=>/^(?:LC|Longevity\s+Courtyard)$/i.test(value.trim())?longevityBrand:value;
export const brandAccountName=(value:string)=>value.replace(/^(Facebook|Instagram)\s+LC$/i,(_,platform)=>platform[0].toUpperCase()+platform.slice(1).toLowerCase()+' '+longevityBrand);
export function renameLegacyBrand<T extends Record<string,any>>(record:T):T{
 const result:any={...record};for(const key of ['brand','accountBrand'])if(typeof result[key]==='string')result[key]=brandName(result[key]);if(typeof result.account==='string')result.account=brandAccountName(result.account);
 return result;
}
export function renameLegacyBrandConfig(config:Config):Config{
 return {...config,brands:[...new Set(config.brands.map(brandName))],accounts:[...new Map(config.accounts.map(a=>{const next=renameLegacyBrand({...a,name:brandAccountName(a.name)});return [next.name,next]})).values()],...(config.followerAccounts?{followerAccounts:[...new Map(config.followerAccounts.map(a=>{const next=renameLegacyBrand({...a,name:brandAccountName(a.name)});return [next.name,next]})).values()]}:{})};
}
export function dimensions(label:string){
 const found=/\b(GLOW|SEEN|LC|Longevity\s+Courtyard)(?:SG)?\b/i.exec(label)?.[1],brand=found?(/^(LC|Longevity)/i.test(found)?longevityBrand:found.toUpperCase()):'Unclassified';
 const location=/\b(Bukit\s*Batok|BB|Nanyang|NY)\b/i.exec(label)?.[1];
 return {brand,location:location?(/^(BB|Bukit)/i.test(location)?'Bukit Batok':'Nanyang'):'Unclassified'};
}
export function canonicalAccount(platform:string,label:string,brand:string){return platform==='Workvivo'?'Workvivo \u00b7 Internal':brand&&brand!=='Unclassified'?platform+' '+brand:platform==='Facebook'?'Facebook Unspecified':'Unspecified';}
const legacyFacebookAccount=(name:string)=>/^Facebook(?:\s*[\u00b7-]\s*|\s+)Shared$/i.test(name);
export function migrateDataset(data:Dataset):Dataset{
 const c:any=data.config,legacy=!c.brands&&!!c.programmes; c.brands??=c.programmes||[];if(legacy)for(const b of ['GLOW','SEEN'])if(!c.brands.includes(b))c.brands.push(b);if(legacy)for(const l of ['Bukit Batok','Nanyang'])if(!c.locations.includes(l))c.locations.push(l);delete c.programmes;Object.assign(c,renameLegacyBrandConfig(c));if(!c.brands.includes(longevityBrand))c.brands.push(longevityBrand);
 data.posts=data.posts.map(renameLegacyBrand);data.followers=data.followers.map(renameLegacyBrand);if(data.kpis)data.kpis=data.kpis.map(renameLegacyBrand);
 const hadSharedFacebook=c.accounts.some((a:any)=>a.platform==='Facebook'&&legacyFacebookAccount(a.name));
 const aliases=new Map<string,string>();
 for(const a of c.accounts){const brand=a.brand??a.programme??dimensions(a.name).brand;aliases.set(a.name,/^(Facebook|Instagram|Workvivo) [\u00b7]/.test(a.name)?canonicalAccount(a.platform,a.name,brand):a.name);}
 data.posts=data.posts.map((raw:any)=>{const p:any={...raw,brand:raw.brand??raw.programme??dimensions(raw.account).brand,description:raw.description??raw.notes??''};const derived=dimensions(p.brand+' '+p.location);p.brand=derived.brand==='Unclassified'?p.brand:derived.brand;p.location=derived.location==='Unclassified'?p.location:derived.location;p.account=p.platform==='Facebook'&&legacyFacebookAccount(raw.account||'')?canonicalAccount(p.platform,p.account,p.brand):aliases.get(raw.account)||canonicalAccount(p.platform,p.account,p.brand);delete p.programme;delete p.accountProgramme;return p;});
 data.followers=data.followers.map((raw:any)=>{const label=[raw.workbookAccount,raw.segment,raw.account].filter(Boolean).join(' '),brand=raw.accountBrand&&raw.accountBrand!=='Unclassified'?raw.accountBrand:dimensions(label).brand,sourcePlatform=raw.sourcePlatform||/source (Facebook|Instagram)/i.exec(raw.segment||'')?.[1]||(/^Instagram\b/i.test(raw.workbookAccount||'')||/^Instagram\b/i.test(raw.segment||'')?'Instagram':raw.platform)||c.accounts.find((a:any)=>a.name===raw.account)?.platform;return {...raw,platform:sourcePlatform,account:brand!=='Unclassified'&&['Facebook','Instagram'].includes(sourcePlatform)?sourcePlatform+' '+brand:raw.account,accountBrand:brand==='Unclassified'?undefined:brand,audienceScope:'account'};});
 const accountRows=c.accounts.filter((a:any)=>!(a.platform==='Facebook'&&legacyFacebookAccount(a.name))).map((a:any)=>{const name=aliases.get(a.name)||a.name,brand=a.brand||dimensions(name).brand;return {name,platform:a.platform,...(['Facebook','Instagram'].includes(a.platform)&&brand!=='Unclassified'?{brand}:{})}});
 for(const p of data.posts)if(!accountRows.some((a:any)=>a.name===p.account))accountRows.push({name:p.account,platform:p.platform,...(['Facebook','Instagram'].includes(p.platform)&&p.brand!=='Unclassified'?{brand:p.brand}:{})});
 if(hadSharedFacebook)for(const brand of c.brands.filter((b:string)=>b&&b!=='Unclassified')){const name=canonicalAccount('Facebook','',brand);if(!accountRows.some((a:any)=>a.platform==='Facebook'&&a.brand===brand))accountRows.push({name,platform:'Facebook',brand});}
 for(const brand of c.brands.filter((b:string)=>b&&b!=='Unclassified'))for(const platform of ['Facebook','Instagram'])if(!accountRows.some((a:any)=>a.platform===platform&&a.brand===brand))accountRows.push({name:platform+' '+brand,platform,brand});
 c.accounts=Array.from(new Map(accountRows.map((a:any)=>[a.name,a])).values());
 c.brands=[...new Set(data.posts.map(p=>p.brand).concat(c.brands.map((b:string)=>dimensions(b).brand==='Unclassified'?b:dimensions(b).brand)))];
 c.locations=[...new Set(data.posts.map(p=>p.location).concat(c.locations.map((l:string)=>dimensions(l).location==='Unclassified'?l:dimensions(l).location)))];
 for(const key of ['brands','locations','topics','types'])c[key]=c[key].filter((value:string)=>value!=='Unclassified');
 return data;
}
