'use client';
import Link from 'next/link';
import {LayoutDashboard,ChartNoAxesCombined,Flame,Network,Users,FileText,CalendarDays,Sparkles,Globe,Database,Settings,Trash2,BookOpen,PanelsTopLeft,MessagesSquare,Library,Building2,Target} from 'lucide-react';
import SidebarGroup from './sidebar-group';
export default function WorkspaceNavigation({page,platform,trash=false,onNavigate}:{page:number;platform:string;trash?:boolean;onNavigate?:()=>void}){
 const item=(label:string,href:string,Icon:typeof Users,active:boolean)=> <Link key={href} href={href} onClick={onNavigate} className={active?'active':''} aria-current={active?'page':undefined}><Icon size={18} aria-hidden="true"/><span>{label}</span></Link>;
 return <nav className="workspace-navigation" aria-label="Primary navigation">
  <div className="workspace-nav-section">Staff Workspace</div>
  {item('Executive Dashboard','/workspace',LayoutDashboard,page===0)}
  {item('Social Media Posts','/workspace/records?kind=posts',Library,page===16&&!trash)}
  <div className="workspace-nav-section">Analytics Dashboard</div>
  <SidebarGroup id="social-media-analytics" label="Social Media Analytics" icon={ChartNoAxesCombined} href="/workspace/analytics" active={page===11} current={page===11&&platform==='Overview'}>{(['Facebook','Instagram'] as const).map(name=>item(name,'/workspace/analytics/'+name.toLowerCase(),ChartNoAxesCombined,page===11&&platform===name))}</SidebarGroup>
  {item('Top Hits Intelligence','/workspace/top-hits',Flame,page===2)}
  {item('Workvivo Insights','/workspace/workvivo',Network,page===5)}
  {item('Followers','/workspace/followers',Users,page===10)}
  {item('Industry Trends','/workspace/industry-trends',Globe,page===18)}
  <SidebarGroup id="additional-analysis" label="More Analysis" icon={ChartNoAxesCombined} defaultOpen={false} active={[4,6,7].includes(page)}>
   {item('Brand Comparison','/workspace/compare',Building2,page===4)}{item('Outreach Evaluation','/workspace/outreach',Target,page===6)}{item('Insight Engine','/workspace/insights',Sparkles,page===7)}
  </SidebarGroup>
  <div className="workspace-nav-section">AI & Content</div>
  {item('AI Social Media Analyst','/workspace/analyst',MessagesSquare,page===19)}
  {item('AI Dashboard Builder','/workspace/dashboard-builder',PanelsTopLeft,page===20)}
  {item('Content Intelligence','/workspace/content',ChartNoAxesCombined,page===1)}
  <SidebarGroup id="content-workspace" label="Content Workspace" icon={CalendarDays} active={page===13||page===14}>{item('Content Planner','/workspace/planner',CalendarDays,page===13)}{item('AI Content Studio','/workspace/assistant',Sparkles,page===14)}</SidebarGroup>
  {item('Reports','/workspace/reports',FileText,page===12)}
  {item('Public Site Manager','/workspace/site-manager',Globe,page===15)}
  <div className="workspace-nav-section">Administration</div>
  {item('Data Management & Imports','/workspace/import',Database,page===8)}
  {item('Configuration','/workspace/settings',Settings,page===9)}
  {item('Trash & Recycling Bin','/workspace/trash',Trash2,page===16&&trash)}
  {item('User Guide','/workspace/user-guide',BookOpen,page===17)}
 </nav>;
}
