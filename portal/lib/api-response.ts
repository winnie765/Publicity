/** Hosting errors can be plain text or HTML rather than application JSON. */
export async function readApiResponse(response:Response):Promise<any>{
 const text=await response.text();let body:any;
 try{body=JSON.parse(text);}catch{
  const message=response.status===413?'The import is too large. Import a smaller workbook.':response.status===401?'Your session has expired. Sign in again before importing.':response.status===504||response.status===408?'The import request timed out. Refresh the records to check whether it completed before trying again.':`The server could not complete the request (HTTP ${response.status}). Refresh the records before retrying. If this continues, check the Vercel function logs for /api/data.`;
  throw Error(message);
 }
 if(!response.ok)throw Error(typeof body?.error==='string'?body.error:`Request failed (HTTP ${response.status}).`);
 return body;
}
