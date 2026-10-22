export const postPlatforms=['Facebook','Instagram'] as const;
export function changePostPlatform(post:Record<string,any>,platform:string,choices:string[],accounts:{name:string;platform:string;brand?:string}[]){
 if(!postPlatforms.includes(platform as typeof postPlatforms[number]))throw Error('Choose Facebook or Instagram.');
 const account=accounts.find(a=>a.platform===platform&&a.brand===post.brand&&choices.includes(a.name))?.name||choices.find(name=>name.endsWith(' '+post.brand))||choices[0]||'';
 return {...post,platform,account,brand:accounts.find(a=>a.name===account&&a.platform===platform)?.brand||post.brand,...(post.platform!==platform?{views:undefined,reach:0,reportedMetrics:(post.reportedMetrics||[]).filter((k:string)=>!['views','reach'].includes(k))}:{})};
}
