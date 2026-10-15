export default function BrandLogo({mark=false,className='',decorative=false}:{mark?:boolean;className?:string;decorative?:boolean}){
 return <img className={'official-logo '+(mark?'official-logo-mark':'official-logo-full')+' '+className} src={mark?'/brand/tzu-chi-emblem.svg':'/brand/tzu-chi-singapore.svg'} alt={decorative?'':'Buddhist Compassion Relief Tzu-Chi Foundation (Singapore)'} aria-hidden={decorative||undefined} width={mark?333:1480} height={188} decoding="async"/>;
}
