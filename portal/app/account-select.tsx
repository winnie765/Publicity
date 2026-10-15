'use client';

import {useId} from 'react';
import ThemedSelect from './themed-select';
import {Layers,Network} from 'lucide-react';

function AccountIcon({name}:{name:string}){
 if(/^Facebook\b/i.test(name))return <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className="themed-select-platform" fill="currentColor"><path d="M14 22v-9h3l.5-4H14V7c0-1.2.4-2 2-2h2V1.5c-.8-.1-1.8-.3-3-.3-3 0-5 1.8-5 5.2V9H7v4h3v9z"/></svg>;
 if(/^Instagram\b/i.test(name))return <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className="themed-select-platform" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>;
 const Icon=/^Workvivo\b/i.test(name)?Network:Layers;
 return <Icon size={16} aria-hidden="true" className="themed-select-platform"/>;
}

export default function AccountSelect({value,onChange,options}:{value:string;onChange:(value:string)=>void;options:string[]}){
 const id=useId();
 return <label className="filter-dropdown" htmlFor={id}><span id={id+'-label'}>Account</span>
  <ThemedSelect id={id} aria-labelledby={id+'-label'} value={value} onValueChange={onChange} options={[...new Set(options)].map(name=>({value:name,label:name}))} renderIcon={name=><AccountIcon name={name}/>}/>
 </label>;
}
