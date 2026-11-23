import fs from 'node:fs';
const origin='https://publicity-six.vercel.app';
const response=await fetch(origin+'/api/public',{signal:AbortSignal.timeout(45000)});
if(!response.ok)throw Error('Published image inventory unavailable: HTTP '+response.status);
const data=await response.json();
function kind(value){if(!value)return 'missing';const u=new URL(value,origin);return u.pathname==='/api/media'?'managed-media':u.pathname.includes('/storage/v1/')?'storage-url':'external-url';}
const inventory=(data.stories||[]).map(p=>({id:p.id,title:p.title,date:p.date,original:p.imageUrl||'',thumbnail:p.thumbnailUrl||'',originalKind:kind(p.imageUrl),thumbnailKind:kind(p.thumbnailUrl),separateThumbnail:!!p.thumbnailUrl&&p.thumbnailUrl!==p.imageUrl,provenance:'Published projection fields; original-file dimensions and crop history not supplied.'}));
const summary={publishedPosts:inventory.length,withOriginal:inventory.filter(p=>p.original).length,thumbnailOnly:inventory.filter(p=>!p.original&&p.thumbnail).length,separateThumbnail:inventory.filter(p=>p.separateThumbnail).length,noImage:inventory.filter(p=>!p.original&&!p.thumbnail).length,originalKinds:Object.fromEntries(['managed-media','storage-url','external-url','missing'].map(k=>[k,inventory.filter(p=>p.originalKind===k).length]))};
fs.mkdirSync('.sites-runtime',{recursive:true});fs.writeFileSync('.sites-runtime/public-image-source-inventory.json',JSON.stringify({summary,inventory},null,2));console.log(JSON.stringify(summary));
