export type ImageDimensions={width:number;height:number};
export function validImageDimensions(value:unknown):value is ImageDimensions{
 const v=value as ImageDimensions|undefined;return !!v&&Number.isInteger(v.width)&&Number.isInteger(v.height)&&v.width>0&&v.height>0&&v.width<=30000&&v.height<=30000&&v.width*v.height<=200_000_000;
}
/** Bounded header parsing only; no decode, re-encode, remote URL access or guesses. */
export function imageDimensions(bytes:Uint8Array):ImageDimensions|undefined{
 const b=bytes.subarray(0,262144),v=new DataView(b.buffer,b.byteOffset,b.byteLength);
 const text=(start:number,end:number)=>String.fromCharCode(...b.slice(start,end));
 let width=0,height=0,orientation=1;
 try{
  if(b.length>=24&&v.getUint32(0)===0x89504e47&&v.getUint32(4)===0x0d0a1a0a&&text(12,16)==='IHDR'){width=v.getUint32(16);height=v.getUint32(20);}
  else if(b.length>=30&&text(0,4)==='RIFF'&&text(8,12)==='WEBP'){
   const u24=(n:number)=>b[n]+b[n+1]*256+b[n+2]*65536;
   if(text(12,16)==='VP8X'){width=1+u24(24);height=1+u24(27);}
   else if(text(12,16)==='VP8 '&&b[23]===0x9d&&b[24]===1&&b[25]===0x2a){width=v.getUint16(26,true)&0x3fff;height=v.getUint16(28,true)&0x3fff;}
   else if(text(12,16)==='VP8L'&&b[20]===0x2f){const n=v.getUint32(21,true);width=(n&0x3fff)+1;height=((n>>>14)&0x3fff)+1;}
  }else if(b[0]===255&&b[1]===216){
   let offset=2;while(offset+4<=b.length){
    if(b[offset++]!==255)break;while(b[offset]===255)offset++;
    const marker=b[offset++];if(marker===0xda||marker===0xd9)break;
    if(marker===0x01||marker>=0xd0&&marker<=0xd7)continue;
    const length=v.getUint16(offset);if(length<2||offset+length>b.length)break;
    if(marker===0xe1&&text(offset+2,offset+8)==='Exif\0\0'){
     const t=offset+8,little=text(t,t+2)==='II';if(v.getUint16(t+2,little)===42){const directory=t+v.getUint32(t+4,little),count=v.getUint16(directory,little);for(let i=0;i<Math.min(count,256);i++){const entry=directory+2+i*12;if(entry+12>offset+length)break;if(v.getUint16(entry,little)===0x112)orientation=v.getUint16(entry+8,little);}}
    }
    if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)&&length>=7){height=v.getUint16(offset+3);width=v.getUint16(offset+5);}
    offset+=length;
   }
  }
 }catch{return undefined;}
 if(orientation>=5&&orientation<=8)[width,height]=[height,width];
 return validImageDimensions({width,height})?{width,height}:undefined;
}
export async function readImageHeader(body:BodyInit|null){
 if(!body)return new Uint8Array();const stream=body instanceof ReadableStream?body:new Response(body).body;if(!stream)return new Uint8Array();
 const reader=stream.getReader(),parts:Uint8Array[]=[];let length=0;
 try{while(length<262144){const next=await reader.read();if(next.done)break;const part=next.value.subarray(0,262144-length);parts.push(part);length+=part.length;}}finally{await reader.cancel().catch(()=>{});}
 const result=new Uint8Array(length);let offset=0;for(const part of parts){result.set(part,offset);offset+=part.length;}return result;
}
