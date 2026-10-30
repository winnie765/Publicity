import {Heart,Handshake,Sprout} from 'lucide-react';
import {PublicSection} from './public-components';

const values=[
 {title:'Respect',description:'Valuing every person and every community we serve.',Icon:Handshake},
 {title:'Gratitude',description:'Appreciating volunteers, participants, partners and supporters.',Icon:Sprout},
 {title:'Love',description:'Caring for others with kindness, warmth and an open heart.',Icon:Heart},
];

export default function PublicValues({settings}:{settings?:import('../lib/public-site-config').PublicHomeSettings}){return <PublicSection id="values" title={settings?.valuesTitle||"Our Values"} eyebrow="CARE IN ACTION" className="ps-values-section"><div className="ps-values-grid">{(settings?.values?settings.values.filter(value=>!value.hidden).map((value,index)=>({...value,Icon:[Handshake,Sprout,Heart][index%3]})):[...values,...(settings?.additionalValues||[]).map(value=>({...value,Icon:Heart}))]).map(({title,description,Icon},index)=><article className="ps-value-card" key={index}><span className="ps-value-icon"><Icon size={25} aria-hidden="true"/></span><h3>{!settings?.values&&settings?.[(["respectTitle","gratitudeTitle","loveTitle"] as const)[index]]||title}</h3><p>{!settings?.values&&settings?.[(["respectDescription","gratitudeDescription","loveDescription"] as const)[index]]||description}</p></article>)}</div></PublicSection>;}
