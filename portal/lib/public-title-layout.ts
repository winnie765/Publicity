/** Presentation hint only: never modifies or truncates the stored/displayed title. */
export function publicTitleDensity(title:string):'short'|'long'{
 const units=Array.from(title.trim()).reduce((sum,char)=>sum+((char.codePointAt(0)||0)>=0x2e80?2:1),0);
 return units>72||/\S{29,}/u.test(title)?'long':'short';
}
