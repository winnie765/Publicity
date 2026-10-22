export const postLocations=['Bukit Batok','Nanyang','Bukit Batok + Nanyang'];
export function normalizeLocation(value:unknown){
 const text=typeof value==='string'?value.trim():'';
 if(!text||/^(unclassified|unspecified|no location)$/i.test(text))return '';
 const parts=text.toLowerCase().split(/\s*[+&,]\s*/).map(p=>p.replace(/\s+/g,''));
 if(parts.length===2&&parts.includes('bukitbatok')&&parts.includes('nanyang'))return postLocations[2];
 return postLocations.find(p=>p.toLowerCase()===text.toLowerCase())||text;
}
export function locationMatches(value:unknown,filter?:string){return !filter||/^all locations$/i.test(filter)||(/^no location$|^unspecified$/i.test(filter)?!normalizeLocation(value):normalizeLocation(value)===normalizeLocation(filter));}
