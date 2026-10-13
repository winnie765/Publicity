export type StoredRecord={id:string;kind:string;payload:any;updatedAt:string};
export type AuditEntry={id:string;actor:string;action:string;record_id:string;date:string};
export type FacebookSnapshot={id:string;date:string;followers:number;createdAt:string;updatedAt:string};
export type Change={type:'facebookSnapshot';date:string;followers:number;updatedAt:string}|{type:'deleteFacebookSnapshot';date:string}|{type:'clearFacebookSnapshots'}|{type:'deleteAllData'}|{type:'upsert';record:StoredRecord}|{type:'delete';id:string;kind:string}|{type:'deleteInteractions';postId:string}|{type:'audit';entry:AuditEntry};
export interface Storage {readFacebookFollowers():Promise<FacebookSnapshot[]>;readRecords():Promise<StoredRecord[]>;readAudit():Promise<AuditEntry[]>;apply(changes:Change[]):Promise<void>}
