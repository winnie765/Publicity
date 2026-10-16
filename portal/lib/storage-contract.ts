export type StoredRecord={id:string;kind:string;payload:any;updatedAt:string};
export type AuditEntry={id:string;actor:string;action:string;record_id:string;date:string};
export type AccountSnapshot={id:string;date:string;followers:number;account:string;createdAt:string;updatedAt:string};
export type Change={type:'insert';record:StoredRecord}|{type:'purge';id:string;kind:string}|{type:'archive';id:string;kind:string}|{type:'clearAICache'}|{type:'clearFacebookSnapshots'}|{type:'deleteAllData'}|{type:'upsert';record:StoredRecord}|{type:'delete';id:string;kind:string}|{type:'deleteInteractions';postId:string}|{type:'audit';entry:AuditEntry};
export interface Storage {readRecords():Promise<StoredRecord[]>;readAudit():Promise<AuditEntry[]>;apply(changes:Change[]):Promise<void>}
