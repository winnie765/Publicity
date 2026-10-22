'use client';
import type {Post} from './model';
export function workvivoSuggestion(post:Pick<Post,'platform'|'title'|'description'>){
 if(post.platform!=='Workvivo')return null;
 const text=post.title+' '+post.description;
 const matches=text.match(/\b(?:AIC|community partners?|partnership|collaboration|joint programmes?|social service agenc(?:y|ies))\b/gi);
 if(!matches)return null;
 return {type:'Partner Engagement',category:'Ecosystem Collaboration',stakeholder:/\bAIC\b/i.test(text)?'AIC':'Partner',matches:[...new Set(matches)]};
}
export function WorkvivoClassificationQueue({posts,onReview}:{posts:Post[];onReview:(post:Post)=>void}){
 const pending=posts.filter(p=>!p.classificationReviewed&&workvivoSuggestion(p));
 return <section className="card workspace-editor"><span className="eyebrow">SMART TAGGING / HUMAN REVIEW</span><h2>Workvivo Classification Review</h2><p>{pending.length} posts have keyword-based classification suggestions. These are content tags, not verified stakeholder activity.</p>{pending.slice(0,5).map(post=>{const suggestion=workvivoSuggestion(post)!;return <article className="workvivo-review-row" key={post.id}><div><h3>{post.title}</h3><p>{suggestion.type} / {suggestion.category} / {suggestion.stakeholder}</p></div><button className="button" onClick={()=>onReview(post)}>Review classification</button></article>})}{pending.length>5&&<a className="button" href="/workspace/import">Review other records in Data Management</a>}</section>;
}
export default function WorkvivoSmartTags({post,onChange}:{post:Post;onChange:(patch:Partial<Post>)=>void}){
 if(post.platform!=='Workvivo')return null;
 const suggestion=workvivoSuggestion(post);
 return <section className="workvivo-smart-tags"><h3>Workvivo Smart Classification</h3>{suggestion&&!post.classificationReviewed&&<><p>Suggested from: {suggestion.matches.join(', ')}. Review before applying.</p><p><strong>{suggestion.type}</strong> / {suggestion.category} / {suggestion.stakeholder}</p><button type="button" className="button" onClick={()=>onChange({is_collaboration_post:true,collaborating_with:suggestion.stakeholder,topic:suggestion.category,ecosystemCategory:suggestion.category,stakeholderTag:suggestion.stakeholder,classificationReviewed:true})}>Apply suggestion</button><button type="button" className="button" onClick={()=>onChange({classificationReviewed:true})}>Dismiss suggestion</button></>}{!suggestion&&<p>Enter a title and description to check for collaboration keywords.</p>}<label className="field">Ecosystem category<input maxLength={120} value={post.ecosystemCategory||''} onChange={e=>onChange({ecosystemCategory:e.target.value,classificationReviewed:true})}/></label><label className="field">Stakeholder tag<input maxLength={120} value={post.stakeholderTag||''} onChange={e=>onChange({stakeholderTag:e.target.value,classificationReviewed:true})}/></label><small>Tags describe content. Log verified stakeholder interactions separately. You can edit the content type and topic above.</small>{post.classificationReviewed&&suggestion&&<button type="button" className="text-button" onClick={()=>onChange({classificationReviewed:false})}>Review suggestion again</button>}</section>;
}
