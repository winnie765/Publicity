'use client';
import Link from 'next/link';
import {LayoutDashboard,ChartNoAxesCombined,Flame,Network,Users,FileText,CalendarDays,Sparkles,Globe,Database,Settings,Trash2,PanelsTopLeft,MessagesSquare,Library,Building2,Target} from 'lucide-react';
import SidebarGroup from './sidebar-group';
import {workspaceFeatures as features,type FeatureId} from '../lib/workspace-features';
export default function WorkspaceNavigation({page,platform,trash=false,postsOnly=false,onNavigate}:{page:number;platform:string;trash?:boolean;postsOnly?:boolean;onNavigate?:()=>void}){
 const item=(id:FeatureId,Icon:typeof Users,active:boolean)=> {const {label,href}=features[id];return <Link key={href} href={href} onClick={onNavigate} className={active?'active':''} aria-current={active?'page':undefined}><Icon size={18} aria-hidden="true"/><span>{label}</span></Link>;};
 return <nav className="workspace-navigation" aria-label="Primary navigation">
  <div className="workspace-nav-section">Staff Workspace</div>
  {item('executive',LayoutDashboard,page===0)}
  {item('posts',Library,page===16&&postsOnly)}
  <div className="workspace-nav-section">Analytics Dashboard</div>
  <SidebarGroup id="social-media-analytics" label="Social Media Analytics" icon={ChartNoAxesCombined} href={features.analytics.href} active={page===11} current={page===11&&platform==='Overview'}>{(['Facebook','Instagram'] as const).map(name=>item(name==='Facebook'?'facebook':'instagram',ChartNoAxesCombined,page===11&&platform===name))}</SidebarGroup>
  {item('hits',Flame,page===2)}
  {item('workvivo',Network,page===5)}
  {item('followers',Users,page===10)}
  {item('trends',Globe,page===18)}
  <SidebarGroup id="additional-analysis" label="More Analysis" icon={ChartNoAxesCombined} defaultOpen={false} active={[4,6,7].includes(page)}>
   {item('brands',Building2,page===4)}{item('outreach',Target,page===6)}{item('insights',Sparkles,page===7)}
  </SidebarGroup>
  <div className="workspace-nav-section">AI & Content</div>
  {item('analyst',MessagesSquare,page===19)}
  {item('builder',PanelsTopLeft,page===20)}
  {item('content',ChartNoAxesCombined,page===1)}
  <SidebarGroup id="content-workspace" label="Content Workspace" icon={CalendarDays} active={page===13||page===14}>{item('planner',CalendarDays,page===13)}{item('studio',Sparkles,page===14)}</SidebarGroup>
  {item('reports',FileText,page===12)}
  {item('publicSite',Globe,page===15)}
  <div className="workspace-nav-section">Administration</div>
  {item('imports',Database,page===8)}
  {item('configuration',Settings,page===9)}
  {item('trash',Trash2,page===16&&trash)}
 </nav>;
}
