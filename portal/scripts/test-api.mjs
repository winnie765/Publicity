import assert from 'node:assert/strict';
const origin=process.argv[2];if(!origin)throw Error('Pass the deployed website URL.');
for(const path of ['/','/workspace/login']){const r=await fetch(new URL(path,origin),{redirect:'manual'});assert.equal(r.status,200,path);console.log('PASS public access:',path);}
for(const path of ['/import','/upload','/admin','/workspace']){const r=await fetch(new URL(path,origin),{redirect:'manual'});assert.equal(r.status,307,path);assert(new URL(r.headers.get('location'),origin).pathname==='/workspace/login');console.log('PASS private page redirect:',path);}
for(const path of ['/api/data','/api/upload','/api/intelligence','/api/reports','/api/media?list=1']){const r=await fetch(new URL(path,origin),{redirect:'manual'});assert.equal(r.status,401,path);console.log('PASS private API rejection:',path);}
