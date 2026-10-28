export async function imageUploadResponse(response:Response):Promise<string>{
 let result:any;try{result=JSON.parse(await response.text())}catch{throw Error(response.status===413?'This photo is too large for the live upload service. Try a smaller image under 4 MB.':response.status===401?'Your session has expired. Sign in again, then upload the photo.':response.status===504?'The photo upload timed out. Please try again.':'The photo upload failed (HTTP '+response.status+'). Please try again.');}
 if(!response.ok)throw Error(typeof result?.error==='string'?result.error:'The photo could not be uploaded.');
 if(typeof result?.url!=='string'||!result.url.startsWith('/api/media?key='))throw Error('The upload did not return an image. Please try again.');
 return result.url;
}
