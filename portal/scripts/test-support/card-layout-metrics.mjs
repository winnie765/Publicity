export const cardLayoutMetrics=`(()=>{
 const grid=document.querySelector('#content-showcases .ps-card-grid');
 const cards=[...grid.children].map((card,index)=>{const r=card.getBoundingClientRect();return {index,x:r.x,y:r.y,right:r.right,bottom:r.bottom,height:r.height};});
 const columns=[...new Set(cards.map(c=>Math.round(c.x)))];let totalExcessGap=0,maxGap=0,overlap=false;
 for(const x of columns){const rows=cards.filter(c=>Math.round(c.x)===x).sort((a,b)=>a.y-b.y);for(let i=1;i<rows.length;i++){const gap=rows[i].y-rows[i-1].bottom;maxGap=Math.max(maxGap,gap);totalExcessGap+=Math.max(0,gap-24);}}
 for(let i=0;i<cards.length;i++)for(let j=i+1;j<cards.length;j++){const a=cards[i],b=cards[j];if(Math.min(a.right,b.right)-Math.max(a.x,b.x)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y)>1)overlap=true;}
 const visualOrder=cards.toSorted((a,b)=>Math.abs(a.y-b.y)<1?a.x-b.x:a.y-b.y).map(c=>c.index);
 return {columns:columns.length,height:grid.getBoundingClientRect().height,maxGap,totalExcessGap,overlap,visualOrder,ordered:visualOrder.every((id,i)=>id===i)};
})()`;
