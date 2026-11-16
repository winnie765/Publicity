import assert from 'node:assert/strict';
import fs from 'node:fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {testCompiler} from './test-support/compiler.mjs';
const load=testCompiler('.sites-runtime/sidebar-layout-tests');
const {default:Navigation}=await load('app/workspace-navigation.tsx'),{default:Settings}=await load('app/workspace-settings-menu.tsx');
const {workspaceFeatures,sidebarFeatureIds}=await load('lib/workspace-features.ts');
for(const [page,platform] of [[0,'Overview'],[11,'Facebook'],[11,'Instagram'],[10,'Overview']]){
 const html=renderToStaticMarkup(React.createElement(Navigation,{page,platform}));
 assert(html.includes('aria-label="Primary navigation" tabindex="0"'),'scroll region is keyboard focusable');
 for(const id of sidebarFeatureIds){const href=workspaceFeatures[id].href;assert.equal(html.split('href="'+href+'"').length-1,1,'exactly one destination '+href);}
 assert(!html.includes('User Guide'));assert(html.includes('aria-current="page"'));assert(html.includes('aria-controls="social-media-analytics-navigation"'));assert(html.includes('aria-controls="content-workspace-navigation"'));
}
const settings=renderToStaticMarkup(React.createElement(Settings));assert.equal(settings.split('aria-label="Workspace Settings"').length-1,1,'original Settings trigger appears once');
assert.equal(workspaceFeatures.guide.href,'/workspace/user-guide');assert(fs.readFileSync('app/workspace-settings-menu.tsx','utf8').includes('href:workspaceFeatures.guide.href'));
// Layout contract: no non-shrinking navigation or sidebar clipping can hide the footer again.
const css=fs.readFileSync('app/workspace-navigation.css','utf8'),nav=css.match(/\.app-shell \.workspace-navigation \{([^}]+)\}/)[1];
assert(nav.includes('flex:1 1 0'));assert(nav.includes('overflow-y:auto'));assert(nav.includes('min-height:'));assert(!nav.includes('flex-shrink:0'));
assert(css.includes('height:100dvh'));assert(css.includes('overflow-y:auto'));
assert(!fs.readFileSync('app/workspace-settings.css','utf8').includes('.sidebar{overflow:hidden}'));
console.log('PASS: all primary destinations unique, keyboard scroll region, active pages, expandable groups, original Settings and Settings-only User Guide, bounded flex/overflow regression contract.');
