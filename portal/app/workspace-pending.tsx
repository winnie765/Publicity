'use client';
export default function WorkspacePending(){return <div className="workspace-pending" role="status" aria-label="Loading page"><span className="sr-only">Loading page...</span><div className="workspace-pending-line"/><div className="workspace-pending-grid">{[0,1,2].map(i=><div className="workspace-pending-card" key={i}/>)}</div></div>;}
