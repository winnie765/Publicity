// Isolated password-session fixture for business-feature tests; never imported by production.
globalThis.aiVerifiedSessions??=new Map();
export function verifiedAISessionSource(source,file){
 if(file==='lib/workspace-auth-state.ts')return "export const saveSession=async(token,expiry)=>globalThis.aiVerifiedSessions.set(token,expiry);export const sessionExists=async(token,now)=>globalThis.aiVerifiedSessions.get(token)>now;export const revokeSession=async token=>globalThis.aiVerifiedSessions.delete(token);export const passwordAttempt=async()=>true;";
 return source;
}
