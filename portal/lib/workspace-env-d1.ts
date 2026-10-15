import {env} from 'cloudflare:workers';
export const workspacePassword=()=>String((env as unknown as Record<string,unknown>).WORKSPACE_PASSWORD||'');
export const automationSecret=()=>String((env as unknown as Record<string,unknown>).REPORT_AUTOMATION_SECRET||'');
