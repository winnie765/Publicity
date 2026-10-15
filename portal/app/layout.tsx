import type { Metadata } from 'next';
import './globals.css';
import './public-site.css';
import './workspace-extensions.css';
import './image-publishing.css';
import './executive-presentation.css';
import './ai-insight-cards.css';
import './workspace-settings.css';
export const metadata: Metadata = {icons:{icon:'/favicon.svg?v=official-tzu-chi',shortcut:'/favicon.svg?v=official-tzu-chi'},title:'Tzu Chi | Community Care',description:'Community activities, meaningful stories and shared impact from GLOW and SEEN.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:"try{var t=localStorage.getItem('portal-theme')||'system';document.documentElement.dataset.theme=t==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;}catch(e){}"}}/></head><body>{children}</body></html>}
