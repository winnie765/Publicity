import {spawnSync} from 'node:child_process';
const steps=process.env.SITES_BUILD_TARGET==='sites'
  ? [['scripts/run-framework.mjs','build']]
  : [['node_modules/prisma/build/index.js','generate'],['node_modules/next/dist/bin/next','build','--webpack']];
for(const args of steps){const result=spawnSync(process.execPath,args,{stdio:'inherit'});if(result.error)throw result.error;if(result.status!==0)process.exit(result.status??1);}
