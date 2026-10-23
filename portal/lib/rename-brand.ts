import type {Config} from '../app/model';

export function prepareBrandRename(previous:Config,next:Config,rename:unknown){
  if(!rename||typeof rename!=='object')throw Error('Choose an existing brand to rename.');
  const {from,to}=rename as {from:string;to:string};
  if(typeof from!=='string'||typeof to!=='string'||!previous.brands.includes(from)||!next.brands.includes(to)||from!==to&&next.brands.includes(from))throw Error('Brand configuration has changed. Refresh and try the rename again.');
  if(from!==to&&previous.brands.includes(to))throw Error('A brand with this name already exists.');
  const accounts=new Map<string,string>();
  for(const entry of [...next.accounts,...(next.followerAccounts||[])]){
    if(entry.brand!==from)continue;
    entry.brand=to;
    const escaped=from.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const name=entry.name.replace(new RegExp('\\b'+escaped+'\\b','gi'),()=>to);
    if(name!==entry.name){accounts.set(entry.name,name);entry.name=name;}
  }
  function references(value:any):any{
    if(Array.isArray(value))return value.map(references);
    if(!value||typeof value!=='object')return value;
    return Object.fromEntries(Object.entries(value).map(([key,entry])=>[key,['brand','accountBrand','programme','accountProgramme'].includes(key)&&entry===from?to:['account','sourceAccount'].includes(key)&&typeof entry==='string'&&accounts.has(entry)?accounts.get(entry):references(entry)]));
  }
  return {config:next,references};
}
