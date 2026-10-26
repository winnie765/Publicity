import {Heart,Handshake,Sprout} from 'lucide-react';
import {PublicSection} from './public-components';

const values=[
 {title:'Respect',description:'Valuing every person and every community we serve.',Icon:Handshake},
 {title:'Gratitude',description:'Appreciating volunteers, participants, partners and supporters.',Icon:Sprout},
 {title:'Love',description:'Caring for others with kindness, warmth and an open heart.',Icon:Heart},
];

export default function PublicValues({settings}:{settings?:import('../lib/public-site-config').PublicHomeSettings}){return <PublicSection id="values" title={settings?.valuesTitle||"Our Values"} eyebrow="CARE IN ACTION" className="ps-values-section"><div className="ps-values-grid">{values.map(({title,description,Icon},index)=><article className="ps-value-card" key={title}><span className="ps-value-icon"><Icon size={25} aria-hidden="true"/></span><h3>{settings?.[(["respectTitle","gratitudeTitle","loveTitle"] as const)[index]]||title}</h3><p>{settings?.[(["respectDescription","gratitudeDescription","loveDescription"] as const)[index]]||description}</p></article>)}</div></PublicSection>;}
