'use client';
import ThemedSelect from './themed-select';
import {useEffect,useState} from 'react';
type Theme='system'|'light'|'dark';
export default function ThemeControl({hidden=false}:{hidden?:boolean}){const [theme,setTheme]=useState<Theme>('light');
 useEffect(()=>{const sync=()=>{try{const saved=localStorage.getItem('portal-theme');if(saved==='light'||saved==='dark'||saved==='system')setTheme(saved);}catch{}};sync();window.addEventListener('storage',sync);window.addEventListener('portal-theme-change',sync);return()=>{window.removeEventListener('storage',sync);window.removeEventListener('portal-theme-change',sync)}},[]);
 useEffect(()=>{const media=window.matchMedia('(prefers-color-scheme: dark)'),apply=()=>{document.documentElement.dataset.theme=theme==='system'?(media.matches?'dark':'light'):theme;};apply();media.addEventListener('change',apply);return()=>media.removeEventListener('change',apply);},[theme]);
 if(hidden)return null;
 return <label className="theme-control"><span>Appearance</span><ThemedSelect aria-label="Appearance" value={theme} onValueChange={nextValue=>{const value=nextValue as Theme;setTheme(value);try{localStorage.setItem('portal-theme',value);}catch{}window.dispatchEvent(new Event('portal-theme-change'));}}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></ThemedSelect></label>;
}
