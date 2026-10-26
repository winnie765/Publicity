import {ArrowUpRight} from 'lucide-react';
import {PublicSection} from './public-components';

const groups=[
 {platform:'Facebook',accounts:[
  {label:'Facebook GLOW',url:'https://www.facebook.com/glow.tzuchisg'},
  {label:'Facebook SEEN',url:'https://www.facebook.com/seen.tzuchisg'},
  {label:'Facebook Longevity Courtyard',url:'https://www.facebook.com/longevitycourtyard'},
 ]},
 {platform:'Instagram',accounts:[
  {label:'Instagram GLOW',url:'https://www.instagram.com/glow.tzuchisg/'},
  {label:'Instagram Longevity Courtyard',url:'https://www.instagram.com/longevitycourtyard/'},
 ]},
];
function PlatformIcon({platform}:{platform:string}){
 return platform==='Facebook'?<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 22v-9h3l.5-4H14V7c0-1.2.4-2 2-2h2V1.5c-.8-.1-1.8-.3-3-.3-3 0-5 1.8-5 5.2V9H7v4h3v9z"/></svg>:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>;
}
export default function PublicSocialLinks({settings}:{settings?:import('../lib/public-site-config').PublicHomeSettings}){
 const keys=[["facebookGlow","facebookSeen","facebookLc"],["instagramGlow","instagramLc"]];
 const legacyGroups=groups.map((group,i)=>({...group,accounts:group.accounts.map((account,j)=>({...account,label:(settings as any)?.[keys[i][j]+"Label"]||account.label,url:(settings as any)?.[keys[i][j]+"Link"]||account.url}))}));
 const visibleGroups=settings?.socialAccounts?['Facebook','Instagram'].map(platform=>({platform,accounts:settings.socialAccounts!.filter(a=>a.platform===platform&&!a.hidden)})).filter(group=>group.accounts.length):legacyGroups;
 return <PublicSection id="social-media" eyebrow="STAY CONNECTED" title={settings?.socialTitle||"Follow Our Social Media"} description={settings?.socialDescription||"Stay connected with our latest activities, community stories and programme updates."} className="ps-social-section"><div className="ps-social-groups">{visibleGroups.map(group=><section className="ps-social-group" key={group.platform} aria-labelledby={'social-'+group.platform.toLowerCase()}><h3 id={'social-'+group.platform.toLowerCase()}>{group.platform}</h3><div className="ps-social-links">{group.accounts.map(account=><a key={account.url} className="ps-social-account" href={account.url} target="_blank" rel="noopener noreferrer" aria-label={account.label+' (opens in a new tab)'}><span className="ps-social-icon"><PlatformIcon platform={group.platform}/></span><span>{account.label}</span><ArrowUpRight size={20} aria-hidden="true"/></a>)}</div></section>)}</div></PublicSection>;
}
