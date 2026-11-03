'use client';
import {useEffect,useState} from 'react';
import {databaseImageSource} from '../lib/content-media';
type Branding={logoUrl:string;logoMarkUrl:string};
let pending=false,cached:Promise<Branding>|undefined,loadedAt=0;
function loadBranding(force=false){if(force&&!pending||Date.now()-loadedAt>60000&&!pending)cached=undefined;if(!cached){pending=true;cached=fetch('/api/public?branding=1',{cache:'no-store'}).then(async response=>{if(!response.ok)throw Error();const result=await response.json() as Branding;loadedAt=Date.now();return result}).catch(()=>({logoUrl:'',logoMarkUrl:''})).finally(()=>{pending=false})}return cached;}
export default function BrandLogo({mark=false,className='',decorative=false,src}:{mark?:boolean;className?:string;decorative?:boolean;src?:string}){
 const [branding,setBranding]=useState<Branding>({logoUrl:'',logoMarkUrl:''}),[failed,setFailed]=useState('');
 useEffect(()=>{if(src!==undefined)return;let active=true;const update=(force=false)=>{void loadBranding(force).then(value=>{if(active)setBranding(value)})};update();const changed=()=>update(true),storage=(event:StorageEvent)=>{if(event.key==='portal-public-revision')changed()};window.addEventListener('portal-data-changed',changed);window.addEventListener('storage',storage);return()=>{active=false;window.removeEventListener('portal-data-changed',changed);window.removeEventListener('storage',storage)}},[src]);
 const source=databaseImageSource(src??(mark?branding.logoMarkUrl||branding.logoUrl:branding.logoUrl)),classes='official-logo '+(mark?'official-logo-mark':'official-logo-full')+' '+className;
 return source&&failed!==source?<img className={classes} src={source} alt={decorative?'':'Tzu Chi Community Care'} aria-hidden={decorative||undefined} width={mark?188:1480} height={188} decoding="async" onError={()=>setFailed(source)}/>:<span className={classes+' official-logo-text'} aria-hidden={decorative||undefined}>{mark?'TC':'Tzu Chi Community Care'}</span>;
}
