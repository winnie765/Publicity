const encoder=new TextEncoder();
export const industryCronConfigured=()=>!!process.env.CRON_SECRET&&process.env.CRON_SECRET.length>=32;
export async function industryCronAuthorized(request:Request){
 if(request.method!=='GET'||new URL(request.url).pathname!=='/api/industry-trends/refresh'||!industryCronConfigured())return false;
 const expected='Bearer '+process.env.CRON_SECRET,supplied=request.headers.get('authorization')||'';
 const a=new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(expected))),b=new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(supplied)));let mismatch=0;for(let i=0;i<a.length;i++)mismatch|=a[i]^b[i];return mismatch===0;
}
