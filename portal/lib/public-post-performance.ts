import type {Post} from '../app/model';
import {contentMetricValue,postAssessor} from './post-content-intelligence';
export type PublicPostPerformance={postDate:string;contentType:string;engagement:number|null;reach:number|null;views:number|null;summary:string;insights:{observation:string;whyItMatters:string;recommendedAction:string;source:'calculated'}};
/** Only approved public posts are supplied; private text and individual peer records are never returned. */
export function publicPostPerformance(posts:Post[]){
 const assess=postAssessor(posts);
 return (post:Post):PublicPostPerformance=>{const assessment=assess(post);return {postDate:post.date,contentType:post.type||'Not recorded',engagement:contentMetricValue(post,'engagement'),reach:contentMetricValue(post,'reach'),views:contentMetricValue(post,'views'),summary:assessment.classification==='Insufficient Evidence'?'More comparable recorded results are needed to assess relative performance.':assessment.classification,insights:{observation:assessment.briefing.finding,whyItMatters:assessment.briefing.explanation,recommendedAction:assessment.briefing.recommendation,source:'calculated'}};};
}
