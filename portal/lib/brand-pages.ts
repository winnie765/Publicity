const glowSource='https://www.tzuchi.org.sg/en/news-and-stories/local-news/glow-nanyang-opens-to-create-a-vibrant-intergenerational-active-ageing-space/';
export const defaultBrandCopy:Record<string,{subtitle:string;description:string;focus:string[];image:string;alt:string;source:string}>={
 SEEN:{subtitle:'Seniors Engagement & Enabling Node',description:'',focus:['Active Ageing','Health Promotion','Community Engagement','Social Connection'],image:'',alt:'Seniors participating in a seated exercise activity at Tzu Chi SEEN',source:'https://www.tzuchi.org.sg/en/our-missions/medicine/seniors-engagement-and-enabling-node-seen/'},
 GLOW:{subtitle:'Go! Live Outrageously Well',description:'',focus:['Wellness','Lifelong Learning','Healthy Living','Community Participation'],image:'',alt:'Community participants celebrating a group activity with exercise balls at GLOW Nanyang',source:glowSource},
 'Longevity Courtyard':{subtitle:'Wellness & Healthy Living Studio',description:'',focus:['Holistic Wellness','Active Living','Fitness & Mobility','Healthspan Development'],image:'',alt:'Participants using wellness exercise equipment at Tzu Chi Longevity Courtyard',source:glowSource},
};

export const brandPagesMarker='brand-pages-initialized';
export function defaultBrandPage(brand:string){const copy=defaultBrandCopy[brand];return {id:'brand-page-'+brand.toLowerCase().replace(/[^a-z0-9]+/g,'-'),brand,displayName:brand,title:brand,subtitle:copy.subtitle,overview:copy.description,focusAreas:[...copy.focus],buttonText:'Learn More',buttonLink:'',imageUrl:copy.image,imageAlt:copy.alt,thumbnailUrl:'',gallery:[],highlightIds:[],showActivities:true,showStories:true,published:true};}

export type BrandPageFields={sortOrder?:number;displayName?:string;subtitle?:string;focusAreas?:string[];buttonText?:string;buttonLink?:string;showActivities?:boolean;showStories?:boolean};

// Recognise old seeded descriptions without treating them as authored CMS content.
const retiredBrandDescriptions=new Set(["Supporting seniors through active ageing, community participation, wellness activities and meaningful social connections.","Empowering adults aged 40 and above to live healthy, connected and purposeful lives through wellness and community programmes.","A dedicated wellness space promoting active ageing, holistic health and healthy lifestyle habits for individuals and families."]);
export function authoredBrandPage<T extends {overview?:string;descriptionSource?:string}>(page:T):T{return page.descriptionSource!=='user'&&retiredBrandDescriptions.has(page.overview||'')?{...page,overview:''}:page;}

export function sortBrandPages<T extends {brand:string;sortOrder?:number}>(pages:readonly T[]):T[]{const defaults=['SEEN','GLOW','Longevity Courtyard'];const rank=(brand:string)=>{const index=defaults.indexOf(brand);return index<0?defaults.length:index;};return [...pages].sort((a,b)=>(a.sortOrder??10001)-(b.sortOrder??10001)||rank(a.brand)-rank(b.brand));}
