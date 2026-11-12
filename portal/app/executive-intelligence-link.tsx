'use client';
import Link from 'next/link';
import type {Filters} from '../lib/intelligence/types';
export const executiveIntelligenceLink='/workspace#executive-performance-intelligence';
export function ExecutiveIntelligenceLink({filters={}}:{filters?:Filters}){const query=new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([k,v])=>['start','end','platform','account','brand','location'].includes(k)&&typeof v==='string'))).toString();return <Link className="epi-context-link" href={'/workspace'+(query?'?'+query:'')+'#executive-performance-intelligence'}>View Executive Performance Intelligence</Link>;}
