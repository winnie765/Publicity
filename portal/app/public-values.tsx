import {PublicSection} from './public-components';

const values=[
 {title:'Respect',description:'Valuing every person and every community we serve.'},
 {title:'Gratitude',description:'Appreciating volunteers, participants, partners and supporters.'},
 {title:'Love',description:'Caring for others with kindness, warmth and an open heart.'},
];

export default function PublicValues({settings}:{settings?:import('../lib/public-site-config').PublicHomeSettings}){return <PublicSection id="values" title={settings?.valuesTitle||"Our Values"} eyebrow="CARE IN ACTION" className="ps-values-section"><div className="ps-values-grid">{(settings?.values?settings.values.filter(value=>!value.hidden):[...values,...(settings?.additionalValues||[])]).map(({title,description},index)=><article className="ps-value-card" key={index}><h3>{!settings?.values&&settings?.[(["respectTitle","gratitudeTitle","loveTitle"] as const)[index]]||title}</h3><p>{!settings?.values&&settings?.[(["respectDescription","gratitudeDescription","loveDescription"] as const)[index]]||description}</p></article>)}</div></PublicSection>;}
