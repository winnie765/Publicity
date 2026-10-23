export type ReportIndexRow={id:string;label:string;frequency:string;generatedAt:string;mode:string;posts:number};
export const reportIndexSql=`SELECT id,payload->'period'->>'label' AS label,
 payload->'period'->>'frequency' AS frequency,payload->>'generatedAt' AS "generatedAt",
 COALESCE(payload->'ai'->>'mode','calculated') AS mode,
 COALESCE((payload->'current'->>'posts')::integer,0) AS posts
 FROM portal_records WHERE kind='generated_report' ORDER BY payload->>'generatedAt' DESC`;
export const reportIndexSqlite=`SELECT id,json_extract(payload,'$.period.label') AS label,
 json_extract(payload,'$.period.frequency') AS frequency,json_extract(payload,'$.generatedAt') AS generatedAt,
 COALESCE(json_extract(payload,'$.ai.mode'),'calculated') AS mode,
 COALESCE(json_extract(payload,'$.current.posts'),0) AS posts
 FROM records WHERE kind='generated_report' ORDER BY generatedAt DESC`;
