import type {ReactNode} from 'react';
import {ChartNoAxesCombined} from 'lucide-react';

/** Shared parent card for an overview, its KPIs and supporting content. */
export default function IntelligenceSection({title,description,children,accent='green'}:{title:string;description?:string;children:ReactNode;accent?:'green'|'blue'|'purple'}){
  return <section className={'intelligence-parent accent-'+accent} aria-label={title}><header className="intelligence-parent-heading"><span className="intelligence-parent-icon"><ChartNoAxesCombined size={23} aria-hidden="true"/></span><div><h2>{title}</h2>{description&&<p>{description}</p>}</div></header><div className="intelligence-parent-body">{children}</div></section>;
}
