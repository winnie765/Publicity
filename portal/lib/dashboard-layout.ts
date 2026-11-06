export const dashboardWidgets=['overview','trend','formats','posts'] as const;
export type DashboardWidget=typeof dashboardWidgets[number];
export type DashboardLayout={version:1;title:string;brand:string;platform:'All platforms'|'Facebook'|'Instagram';widgets:DashboardWidget[]};
export const defaultDashboardLayout:DashboardLayout={version:1,title:'My Performance Dashboard',brand:'All brands',platform:'All platforms',widgets:['overview','trend','formats']};
export const dashboardLayoutKey='portal-personal-dashboard-v1';
export function parseDashboardLayout(value:unknown):DashboardLayout|null{
 if(!value||typeof value!=='object'||Array.isArray(value))return null;
 const row=value as Partial<DashboardLayout>;
 if(row.version!==1||typeof row.title!=='string'||!row.title.trim()||row.title.length>100||typeof row.brand!=='string'||row.brand.length>120||!['All platforms','Facebook','Instagram'].includes(row.platform||'')||!Array.isArray(row.widgets)||!row.widgets.length||row.widgets.length>dashboardWidgets.length||row.widgets.some(key=>!dashboardWidgets.includes(key))||new Set(row.widgets).size!==row.widgets.length)return null;
 return {version:1,title:row.title.trim(),brand:row.brand,platform:row.platform!,widgets:[...row.widgets]};
}
