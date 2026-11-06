'use client';
import {useEffect} from 'react';
import type {Post} from './model';
import type {ImportBatch} from './import';
import type {SheetData} from './standard-workbook';
import {importPostReview} from '../lib/social-post-workflow';
export default function ImportPostReview({batches,existing,sheets,approved,onApproval}:{batches:ImportBatch[];existing:Post[];sheets:SheetData[]|null;approved:boolean;onApproval:(value:boolean)=>void}){
 const posts=batches.filter(batch=>batch.kind==='posts').flatMap(batch=>batch.items) as Post[],review=importPostReview(posts,existing);
 useEffect(()=>onApproval(false),[batches]);
 return <section className="sp-review" aria-label="Import post checks"><h3>Post Import Checks</h3><p>{posts.length} post records / {review.updates} matching saved IDs / {review.metricChanges} measurement updates / {review.possibleDuplicates} possible duplicates with different IDs.</p><p>Blank source measurements remain unavailable; recorded zeros remain zero. Only columns supplied by the workbook are checked. Public publishing fields are preserved when absent.</p>{sheets&&<details><summary>Review workbook columns</summary>{sheets.map(sheet=><p key={sheet.name}><strong>{sheet.name}:</strong> {sheet.headers.filter(Boolean).join(', ')}</p>)}</details>}{review.possibleDuplicates>0&&<p className="sp-warning">Some rows share an original URL or platform/account/date/title with another record. Check the preview before importing; new IDs create additional records.</p>}{review.metricChanges>0&&<label className="sp-confirm"><input type="checkbox" checked={approved} onChange={event=>onApproval(event.target.checked)}/>I reviewed the measurement changes. Keep the previous values in metric history and apply the workbook values.</label>}</section>;
}
