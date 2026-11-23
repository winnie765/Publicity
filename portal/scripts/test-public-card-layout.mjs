import assert from 'node:assert/strict';
import {testCompiler} from './test-support/compiler.mjs';
const load=testCompiler('.sites-runtime/public-card-layout-tests');
const {publicCardPositions}=await load('lib/public-card-layout.ts');
for(const columns of [1,2,3])for(const heights of [[],[220],[400,220,700,160,340,240,900],[0,0,0],[300,300,300,300],Array.from({length:100},(_,i)=>(i*73)%800+80)]){
 const {positions,height}=publicCardPositions(heights,columns);
 assert.equal(positions.length,heights.length);
 let previous=-1;const bottoms=Array(columns).fill(0);
 positions.forEach(({top,column},i)=>{
  assert(top>=previous,'source order must be monotonic from top to bottom');
  assert.equal(top,bottoms[column],'no unnecessary space above a card in its column');
  if(i&&top===previous)assert(column>positions[i-1].column,'ties must read left to right');
  previous=top;bottoms[column]=top+heights[i]+24;
 });
 assert.equal(height,heights.length?Math.max(...bottoms)-24:0);
}
console.log('PASS ordered placement, tie order, exact 24px gaps, no overlaps, empty/single-column and changing-height inputs.');
