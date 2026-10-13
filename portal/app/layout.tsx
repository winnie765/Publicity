import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Tzu Chi | Community Care Intelligence',description:'Evidence-led content, stakeholder and outreach intelligence.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
