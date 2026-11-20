import assert from 'node:assert/strict';
import {testCompiler} from './test-support/compiler.mjs';
const {workspaceData,invalidateWorkspaceData}=await testCompiler('.sites-runtime/test-workspace-cache')('app/workspace-data-client.ts');
let calls=0,clock=100000,reply={posts:[{id:'one'}]},pending;
const originalNow=Date.now;Date.now=()=>clock;
globalThis.fetch=async()=>{calls++;if(pending)await pending;return Response.json(reply)};
try{
 const core=await workspaceData('/api/data?scope=core');
 assert.equal(await workspaceData('/api/data?scope=followers'),core);
 clock+=16000;assert.equal(await workspaceData('/api/data?scope=core'),core);assert.equal(calls,1);
 clock+=300000;reply={posts:[{id:'two'}]};let release;pending=new Promise(r=>release=r);
 assert.equal(await workspaceData('/api/data?scope=core'),core);
 const refreshed=workspaceData('/api/data?scope=core',true);release();pending=null;assert.equal((await refreshed).posts[0].id,'two');assert.equal(calls,2);
 invalidateWorkspaceData();await workspaceData('/api/data?scope=followers');assert.equal(calls,3);
 await workspaceData('/api/data?scope=core');assert.equal(calls,4);
 invalidateWorkspaceData();globalThis.fetch=async()=>Response.json({error:'expired'},{status:401});await assert.rejects(workspaceData('/api/data?scope=core'),/Sign in/);
 globalThis.fetch=async()=>{calls++;return Response.json(reply)};await workspaceData('/api/data?scope=core');assert.equal(calls,5);
 invalidateWorkspaceData();let releaseLate;globalThis.fetch=()=>new Promise(resolve=>{releaseLate=()=>resolve(Response.json({posts:[{id:'obsolete'}]}))});const late=workspaceData('/api/data?scope=core');invalidateWorkspaceData();releaseLate();await assert.rejects(late,/interrupted|changed/);globalThis.fetch=async()=>Response.json(reply);assert.equal((await workspaceData('/api/data?scope=core')).posts[0].id,'two');
 console.log('PASS scope reuse, navigation, SWR, request coalescing, invalidation, scope isolation and session rejection');
}finally{Date.now=originalNow;invalidateWorkspaceData();}
