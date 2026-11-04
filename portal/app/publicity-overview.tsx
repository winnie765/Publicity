'use client';
import {useMemo} from 'react';
import Link from 'next/link';
import type {Dataset} from './model';
import {publicityIntelligence} from '../lib/publicity-intelligence';
import IntelligenceSection from './intelligence-section';
import {Kpi,number} from './analytics-ui';
export function PublicityOverview({data,start,end}:{data:Dataset;start?:string;end?:string}){const summary=useMemo(()=>publicityIntelligence(data,start,end),[data,start,end]);return <IntelligenceSection title="Publicity Intelligence" description="Automated data quality and recorded stakeholder activity."><div className="metrics"><Kpi title="Data Quality Score" value={summary.quality.score===null?'Unavailable':summary.quality.score+'%'} note={summary.quality.validated+' / '+summary.quality.total+' records pass automatic checks'}/><Kpi title="Stakeholder Posts" value={number(summary.overall.posts)} note="Distinct posts with logged interactions"/><Kpi title="Stakeholder Interactions" value={number(summary.overall.interactions)} note="Verified activities entered by staff"/><Kpi title="Data Issues" value={number(summary.quality.issues.length)} note="Records requiring review"/></div><Link className="button" href="/workspace/publicity">Open Stakeholder Reporting</Link></IntelligenceSection>}
