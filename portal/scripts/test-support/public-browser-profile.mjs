import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';
/** Real browser against the running isolated production server. */
export async function publicBrowserProfile(base,label,dir){
 let browser,ws;const requests=[],errors=[];
 try{
  const profile=path.join(dir,'edge');browser=spawn(process.env.EDGE_BINARY||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',['--headless','--disable-gpu','--no-first-run','--disable-extensions','--disable-background-networking','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:'ignore'});
  for(let i=0;i<100&&!fs.existsSync(profile+'/DevToolsActivePort');i++)await new Promise(r=>setTimeout(r,100));
  const port=fs.readFileSync(profile+'/DevToolsActivePort','utf8').split('\n')[0],tabs=await(await fetch('http://127.0.0.1:'+port+'/json')).json();ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});let sequence=0;const pending=new Map();
  ws.onmessage=event=>{const message=JSON.parse(event.data);if(pending.has(message.id)){const p=pending.get(message.id);pending.delete(message.id);message.error?p.reject(Error(JSON.stringify(message.error))):p.resolve(message.result);}else if(message.method==='Network.requestWillBeSent'&&message.params.request.url.includes('/api/public'))requests.push(message.params.request.url);else if(message.method==='Runtime.exceptionThrown')errors.push(message.params.exceptionDetails.exception?.description||message.params.exceptionDetails.text);};
  const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++sequence;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
  const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(result.exceptionDetails)throw Error(result.exceptionDetails.text);return result.result.value;};
  const wait=async expression=>{for(let i=0;i<150;i++){if(await evaluate('Boolean('+expression+')'))return;await new Promise(r=>setTimeout(r,100));}throw Error('Browser timeout: '+expression);};
  await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await send('Page.addScriptToEvaluateOnNewDocument',{source:"const originalInterval=window.setInterval;window.setInterval=(fn,ms,...args)=>{if(ms===300000)window.__publicRefresh=fn;return originalInterval(fn,ms,...args);};"});
  const timings=[];let at=performance.now();await send('Page.navigate',{url:base+'/'});await wait("document.readyState==='complete'&&!document.querySelector('.ps-loading')&&document.body.textContent.includes('Published activity')");timings.push({action:'first public content',ms:performance.now()-at});await new Promise(r=>setTimeout(r,500));const initialRequests=requests.length;
  if(label==='after')assert.equal(initialRequests,0,'SSR hydration must not duplicate the initial API request');
  const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(dir,'desktop.png'),Buffer.from(shot.data,'base64'));
  await evaluate('window.__navPending=true');at=performance.now();await send('Page.reload');await wait("!window.__navPending&&document.readyState==='complete'&&!document.querySelector('.ps-loading')&&document.body.textContent.includes('Published activity')");timings.push({action:'reload public content',ms:performance.now()-at});await new Promise(r=>setTimeout(r,400));
  if(label==='after')assert.equal(requests.length,0);
  at=performance.now();await evaluate("document.querySelector('a[href^=\"/stories/\"]').click()");await wait("document.querySelector('.ps-article-heading')&&!document.querySelector('.ps-loading')");timings.push({action:'source-detail Link navigation',ms:performance.now()-at});
  if(label==='after'){
   await wait('window.__publicRefresh');await evaluate('window.__publicRefresh()');await wait('true');await new Promise(r=>setTimeout(r,500));assert.equal(requests.length,1,'explicit validation uses one conditional request');assert(await evaluate("!!document.querySelector('.ps-article-heading')"));
   const before=requests.length;await evaluate("window.dispatchEvent(new Event('focus'))");await new Promise(r=>setTimeout(r,250));assert.equal(requests.length,before,'focus must not download public records');
   await send('Network.setBlockedURLs',{urls:['*api/public*']});await evaluate('window.__publicRefresh()');await wait("document.querySelector('.ps-refresh-notice')");assert(await evaluate("!!document.querySelector('.ps-article-heading')"),'network failure must preserve content');await send('Network.setBlockedURLs',{urls:[]});
  }
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});assert(await evaluate('document.documentElement.scrollWidth<=window.innerWidth'),'mobile page must not overflow');const mobile=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(dir,'mobile.png'),Buffer.from(mobile.data,'base64'));
  assert.equal(errors.length,0,errors.join('\n'));return {timings,initialPublicApiRequests:initialRequests,totalPublicApiRequests:requests.length,screenshots:[path.join(dir,'desktop.png'),path.join(dir,'mobile.png')]};
 }finally{ws?.close();browser?.kill();}
}
