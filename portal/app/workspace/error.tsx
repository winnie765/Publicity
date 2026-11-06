'use client';
import Link from 'next/link';
export default function WorkspaceError({reset}:{error:Error&{digest?:string};reset:()=>void}){
 return <section className="workspace-recovery" role="alert"><span className="eyebrow">STAFF WORKSPACE</span><h1>This page could not be opened.</h1><p>Your saved records have not been removed. Try opening the page again, or return to the dashboard.</p><div className="workspace-recovery-actions"><button className="button primary" onClick={reset}>Try Again</button><Link className="button" href="/workspace">Open Dashboard</Link><Link className="button" href="/workspace/user-guide">User Guide</Link></div></section>;
}
