import assert from 'node:assert/strict';
const origin=process.argv[2];if(!origin)throw Error('Pass the deployed website URL.');
for(const path of ['/','/import','/upload','/admin','/api/data']){const r=await fetch(new URL(path,origin),{redirect:'manual'});assert.equal(r.status,200,path);console.log('PASS anonymous access:',path);}
