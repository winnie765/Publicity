import type {Config} from '../app/model';
import type {StoredRecord} from './storage-contract';

/** Remove unused linked accounts with their brand, never the records themselves. */
export function prepareBrandDeletion(previous:Config,next:Config,records:StoredRecord[]){
  const removed=previous.brands.filter(brand=>!next.brands.includes(brand));
  for(const brand of removed){
    const accounts=new Set([...previous.accounts,...(previous.followerAccounts||[]),...next.accounts,...(next.followerAccounts||[])].filter(account=>account.brand===brand).map(account=>account.name));
    function usesBrand(value:any):boolean{
      if(Array.isArray(value))return value.some(usesBrand);
      if(!value||typeof value!=='object')return false;
      return Object.entries(value).some(([key,entry])=>['brand','accountBrand','programme','accountProgramme'].includes(key)&&entry===brand||['account','sourceAccount'].includes(key)&&typeof entry==='string'&&accounts.has(entry)||usesBrand(entry));
    }
    const linked=records.filter(record=>!['config','generated_report','report'].includes(record.kind)&&usesBrand(record.payload));
    if(linked.length)throw Error(`Cannot delete brand "${brand}": ${linked.length} saved record${linked.length===1?' still uses':'s still use'} it. Reassign or remove those records first, including any recovery copies in Trash or Archive.`);
    next.accounts=next.accounts.filter(account=>account.brand!==brand&&!accounts.has(account.name));
    if(next.followerAccounts)next.followerAccounts=next.followerAccounts.filter(account=>account.brand!==brand&&!accounts.has(account.name));
  }
  return next;
}
