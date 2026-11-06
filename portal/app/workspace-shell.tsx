'use client';
import {usePathname} from 'next/navigation';
import {Component,type ReactNode} from 'react';
import Portal from './portal';
import WorkspaceError from './workspace/error';
const routes:Record<string,{initialPage:number;initialAnalyticsPlatform?:'Facebook'|'Instagram';initialReportsArchive?:boolean;initialRecordsTrash?:boolean}>={"/workspace/analyst":{"initialPage":19},"/workspace/dashboard-builder":{"initialPage":20},"/workspace/industry-trends":{"initialPage":18},"/workspace/user-guide":{"initialPage":17},"/workspace/admin":{"initialPage":8},"/workspace/advisor":{"initialPage":14},"/workspace/analytics/facebook":{"initialPage":11,"initialAnalyticsPlatform":"Facebook"},"/workspace/analytics/instagram":{"initialPage":11,"initialAnalyticsPlatform":"Instagram"},"/workspace/analytics":{"initialPage":11},"/workspace/assistant":{"initialPage":14},"/workspace/compare":{"initialPage":4},"/workspace/content":{"initialPage":1},"/workspace/followers":{"initialPage":10},"/workspace/import":{"initialPage":8},"/workspace/insights":{"initialPage":7},"/workspace/outreach":{"initialPage":6},"/workspace":{"initialPage":0},"/workspace/planner":{"initialPage":13},"/workspace/publishing":{"initialPage":15},"/workspace/records":{"initialPage":16},"/workspace/reports/archive":{"initialPage":12,"initialReportsArchive":true},"/workspace/reports":{"initialPage":12},"/workspace/settings":{"initialPage":9},"/workspace/site-manager":{"initialPage":15},"/workspace/top-hits":{"initialPage":2},"/workspace/trash":{"initialPage":16,"initialRecordsTrash":true},"/workspace/workvivo":{"initialPage":5}};
class WorkspaceBoundary extends Component<{path:string;children:ReactNode},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 componentDidUpdate(previous:{path:string;children:ReactNode}){if(this.state.failed&&previous.path!==this.props.path)this.setState({failed:false});}
 render(){return this.state.failed?<WorkspaceError error={new Error('Workspace view unavailable')} reset={()=>this.setState({failed:false})}/>:this.props.children;}
}
export default function WorkspaceShell({children}:{children:React.ReactNode}){const pathname=usePathname(),route=routes[pathname];return route?<WorkspaceBoundary path={pathname}><Portal {...route}/></WorkspaceBoundary>:children;}
