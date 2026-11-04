import type {Post} from '../app/model';
export const workvivoInteractionTypes=['Like','Comment','Share','Mention','Repost','Collaboration','Attendance','Other'] as const;
export const workvivoStakeholders=[['AIC','Government'],['GRA','Government'],['SG Cares','Social Sector'],['SUSS','Partners'],['Republic Polytechnic','Partners'],['IMDA','Government'],['HDB','Government'],['NUHS','Partners'],['National Arts Council','Government'],['Food from the Heart','Social Sector'],['Quantum TX','Partners'],['Association of Drone Soccer Singapore','Partners'],['Community Partner','Partners'],['Other','Partners']] as const;
export type WorkvivoInteraction={id:string;postId:string;stakeholder_id?:string;stakeholder:string;interactionType:string;date:string;notes:string;count:number;legacy?:boolean};
export const hasWorkvivo=(post:Pick<Post,'platform'|'is_workvivo_associated'>)=>post.platform==='Workvivo'||(['Facebook','Instagram'].includes(post.platform)&&post.is_workvivo_associated===true);

