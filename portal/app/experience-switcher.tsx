'use client';
import Link from 'next/link';
import {Globe,LockKeyhole} from 'lucide-react';
export default function ExperienceSwitcher({active}:{active:'public'|'workspace'}){
 return <nav className="experience-switcher" aria-label="Switch experience"><Link href="/" aria-current={active==='public'?'page':undefined}><Globe size={15}/><span>Public Portal</span></Link><a href="/workspace" target={active==='public'?'_blank':undefined} rel={active==='public'?'noopener noreferrer':undefined} aria-label={active==='public'?'Open Workspace in a new tab':undefined} aria-current={active==='workspace'?'page':undefined}><LockKeyhole size={15}/><span>Workspace</span></a></nav>;
}
