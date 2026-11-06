import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
/** Compile isolated test dependencies recursively; never reuse another suite's output. */
export function testCompiler(out,{environment='globalThis.cmsTestEnv',transform=(source)=>source}={}){
 fs.mkdirSync(out,{recursive:true});const compiled=new Set();
 function compile(file){
  const id=file.replace(/[/.]/g,'-')+'.mjs';if(compiled.has(file))return id;compiled.add(file);
  let source=transform(fs.readFileSync(file,'utf8'),file).replace("import {env} from 'cloudflare:workers';",'const env='+environment+';').replaceAll("from 'next/link'","from 'next/link.js'").replaceAll("from 'next/navigation'","from 'next/navigation.js'").replaceAll("from 'next/server'","from 'next/server.js'").replace(/import\s+['"][^'"]+\.css['"];?/g,'');
  source=source.replace(/(from\s*|import\s*\()(['"])([^'"]+)\2/g,(match,prefix,quote,target)=>{
   if(!target.startsWith('.')&&!target.startsWith('@/'))return match;
   let base=target.startsWith('@/')?target.slice(2):path.posix.normalize(path.posix.join(path.posix.dirname(file),target));
   if(base.endsWith('/storage'))base=base.replace(/\/storage$/,'/storage-d1');
   if(base.endsWith('/media-storage'))base=base.replace(/\/media-storage$/,'/media-storage-d1');
   const next=['.ts','.tsx','.mts','/index.ts','/index.tsx'].map(suffix=>base+suffix).find(file=>fs.existsSync(file));
   return next?prefix+quote+'./'+compile(next)+quote:match;
  });
  fs.writeFileSync(out+'/'+id,ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText);return id;
 }
 return file=>import(path.resolve(out,compile(file)).replaceAll('\\','/').replace(/^([A-Za-z]):/,'file:///$1:'));
}
