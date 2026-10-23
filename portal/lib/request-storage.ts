import type {Storage,StoredRecord} from './storage-contract';

/** Per-request snapshot only: coalesce concurrent/repeated reads, never across users. */
export function requestStorage(base:Storage):Storage{
  const reads=new Map<string,Promise<StoredRecord[]>>(),individual=new Map<string,Promise<StoredRecord|null>>();let audit:ReturnType<Storage['readAudit']>|undefined;
  return {...base,
    ...(base.readRecordsByIds?{readRecordsByIds(ids:readonly string[]){const full=reads.get('*');if(full)return full.then(rows=>structuredClone(rows.filter(row=>ids.includes(row.id))));return base.readRecordsByIds!(ids).then(rows=>structuredClone(rows));}}:{}),
    ...(base.readRecord?{readRecord(id:string){const full=reads.get('*');if(full)return full.then(rows=>structuredClone(rows.find(row=>row.id===id)||null));let pending=individual.get(id);if(!pending){pending=base.readRecord!(id);individual.set(id,pending);pending.catch(()=>individual.delete(id));}return pending.then(row=>structuredClone(row));}}:{}),
    readRecords(kinds){
      const key=kinds?[...new Set(kinds)].sort().join('|'):'*';
      const full=reads.get('*');if(full)return full.then(rows=>structuredClone(kinds?rows.filter(row=>kinds.includes(row.kind)):rows));
      if(kinds)for(const [candidate,promise]of reads)if(candidate!=='*'&&kinds.every(kind=>candidate.split('|').includes(kind)))return promise.then(rows=>structuredClone(rows.filter(row=>kinds.includes(row.kind))));
      let pending=reads.get(key);
      if(!pending){pending=base.readRecords(kinds);reads.set(key,pending);pending.catch(()=>reads.delete(key));}
      return pending.then(rows=>structuredClone(rows));
    },
    readAudit(){if(!audit){audit=base.readAudit();audit.catch(()=>{audit=undefined});}return audit.then(rows=>structuredClone(rows));},
    async apply(changes){try{await base.apply(changes);}finally{reads.clear();individual.clear();audit=undefined;}}
  };
}
