/** Hosting errors can be plain text or HTML rather than application JSON. */
export async function readApiResponse(response:Response):Promise<any>{
 const text=await response.text();let body:any;
 try{body=JSON.parse(text);}catch{
  const message=response.status===413?'The file or request is too large. Try a smaller file or fewer records.':response.status===401?'Your workspace session has expired. Sign in again to continue.':response.status===504||response.status===408?'The request timed out. Refresh the records to check whether it completed before trying again.':`The server could not complete the request (HTTP ${response.status}). Refresh the records before retrying.`;
  throw Error(message);
 }
 if(!response.ok)throw Error(typeof body?.error==='string'?body.error:`Request failed (HTTP ${response.status}).`);
 return body;
}
