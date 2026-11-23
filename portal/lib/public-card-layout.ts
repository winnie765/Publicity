/** Source-order masonry: the minimum available column top never decreases.
 * Ties choose the leftmost column, so visual (top, left) order matches DOM order. */
export function publicCardPositions(heights:number[],columns:number,gap=24){
 const bottoms=Array(Math.max(1,Math.floor(columns))).fill(0) as number[];
 const positions=heights.map(height=>{
  const top=Math.min(...bottoms),column=bottoms.indexOf(top);
  bottoms[column]=top+Math.max(0,height)+gap;
  return {top,column};
 });
 return {positions,height:heights.length?Math.max(...bottoms)-gap:0};
}
