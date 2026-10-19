import {Heart,Handshake,Sprout} from 'lucide-react';
import {PublicSection} from './public-components';

const values=[
 {title:'Respect',description:'Valuing every person and every community we serve.',Icon:Handshake},
 {title:'Gratitude',description:'Appreciating volunteers, participants, partners and supporters.',Icon:Sprout},
 {title:'Love',description:'Caring for others with kindness, warmth and an open heart.',Icon:Heart},
];

export default function PublicValues(){return <PublicSection title="Our Values" eyebrow="CARE IN ACTION" className="ps-values-section"><div className="ps-values-grid">{values.map(({title,description,Icon})=><article className="ps-value-card" key={title}><span className="ps-value-icon"><Icon size={25} aria-hidden="true"/></span><h3>{title}</h3><p>{description}</p></article>)}</div></PublicSection>;}
