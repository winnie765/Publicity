'use client';
import {usePathname} from 'next/navigation';
import {Component,type ReactNode} from 'react';
import Portal from './portal';
import WorkspaceError from './workspace/error';
import {workspaceRoutes as routes} from '../lib/workspace-features';
class WorkspaceBoundary extends Component<{path:string;children:ReactNode},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 componentDidUpdate(previous:{path:string;children:ReactNode}){if(this.state.failed&&previous.path!==this.props.path)this.setState({failed:false});}
 render(){return this.state.failed?<WorkspaceError error={new Error('Workspace view unavailable')} reset={()=>this.setState({failed:false})}/>:this.props.children;}
}
export default function WorkspaceShell({children}:{children:React.ReactNode}){const pathname=usePathname(),route=routes[pathname];return route?<WorkspaceBoundary path={pathname}><Portal {...route}/></WorkspaceBoundary>:children;}
