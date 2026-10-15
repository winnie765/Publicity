import PublicPortal from '../../public-portal';
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <PublicPortal page="event" slug={id}/>;}
