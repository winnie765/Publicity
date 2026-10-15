'use client';
import ThemedSelect from './themed-select';
import {useEffect,useState} from 'react';
type Theme='system'|'light'|'dark';
export default function ThemeControl(){const [theme,setTheme]=useState<Theme>('system');
 useEffect(()=>{try{const saved=localStorage.getItem('portal-theme');if(saved==='light'||saved==='dark'||saved==='system')setTheme(saved);}catch{}},[]);
 useEffect(()=>{const media=window.matchMedia('(prefers-color-scheme: dark)'),apply=()=>{document.documentElement.dataset.theme=theme==='system'?(media.matches?'dark':'light'):theme;};apply();media.addEventListener('change',apply);return()=>media.removeEventListener('change',apply);},[theme]);
 return <label className="theme-control"><span>Appearance</span><ThemedSelect aria-label="Appearance" value={theme} onValueChange={nextValue=>{const value=nextValue as Theme;setTheme(value);try{localStorage.setItem('portal-theme',value);}catch{}}}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></ThemedSelect></label>;
}
