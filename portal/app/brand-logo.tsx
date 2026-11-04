/** Company branding is bundled with the application and cannot be changed through the CMS. */
export default function BrandLogo({mark=false,className='',decorative=false}:{mark?:boolean;className?:string;decorative?:boolean}){
 const source=mark?'/brand/tzu-chi-emblem.svg':'/brand/tzu-chi-singapore.svg';
 return <img className={'official-logo '+(mark?'official-logo-mark':'official-logo-full')+' '+className} src={source} alt={decorative?'':'Tzu Chi Community Care'} aria-hidden={decorative||undefined} width={mark?188:1480} height={188} decoding="async"/>;
}
