import {Heart,Handshake,Sprout,House,Sparkles} from 'lucide-react';
import {PublicSection} from './public-components';

const values=[
 {title:'Compassion',description:'Serving with kindness, empathy and respect for all individuals.',Icon:Heart},
 {title:'Respect',description:'Valuing every person and every community we serve.',Icon:Handshake},
 {title:'Gratitude',description:'Appreciating volunteers, participants, partners and supporters.',Icon:Sprout},
 {title:'Community',description:'Building meaningful connections and stronger communities.',Icon:House},
 {title:'Service',description:'Contributing positively to the well-being of others through action.',Icon:Sparkles},
];

export default function PublicValues(){return <PublicSection title="Our Values" eyebrow="CARE IN ACTION" className="ps-values-section"><div className="ps-values-grid">{values.map(({title,description,Icon})=><article className="ps-value-card" key={title}><span className="ps-value-icon"><Icon size={25} aria-hidden="true"/></span><h3>{title}</h3><p>{description}</p></article>)}</div></PublicSection>;}
