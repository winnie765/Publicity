import PublicPortal from '../../public-portal';
export default async function Page({params}:{params:Promise<{brand:string}>}){const {brand}=await params;return <PublicPortal page="programme" slug={brand}/>;}
