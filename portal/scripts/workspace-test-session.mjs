import fs from 'node:fs';
import ts from 'typescript';
fs.mkdirSync('.sites-runtime',{recursive:true});
process.env.REPORT_AUTOMATION_SECRET??=crypto.randomUUID()+crypto.randomUUID();
process.env.WORKSPACE_PASSWORD??=crypto.randomUUID()+crypto.randomUUID();
for(const name of ['workspace-env','workspace-security']){const source=fs.readFileSync('lib/'+name+'.ts','utf8').replace("from './workspace-env'","from './workspace-env.mjs'");fs.writeFileSync('.sites-runtime/'+name+'.mjs',ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);}
const {createSession,sessionCookie}=await import('../.sites-runtime/workspace-security.mjs'),token=await createSession();
export class AuthenticatedRequest extends Request{constructor(input,init={}){const url=new URL(typeof input==='string'?input:input.url),headers=new Headers(init.headers||{});if(!headers.has('cookie'))headers.set('cookie',sessionCookie+'='+token);if(!headers.has('origin'))headers.set('origin',url.origin);super(input,{...init,headers});}}
