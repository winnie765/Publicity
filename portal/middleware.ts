import {NextResponse,type NextRequest} from 'next/server';
import {authenticated,automationAuthorized} from './lib/workspace-security';
const publicPages=new Set(['/','/community','/showcase','/programmes','/stories','/impact','/workspace/login']);
export async function middleware(request:NextRequest){
 const path=request.nextUrl.pathname;
 if(path.startsWith('/_next/')||path.startsWith('/assets/')||/\.(?:ico|svg|png|jpg|jpeg|webp|css|js|woff2?)$/.test(path))return NextResponse.next();
 if(publicPages.has(path)||/^\/(stories|programmes)\/[^/]+$/.test(path)||path==='/api/public'||path==='/api/session'){
  const response=NextResponse.next();response.headers.set('Cache-Control','no-store');response.headers.set('Content-Security-Policy',path==='/workspace/login'?"frame-ancestors 'none'":"frame-ancestors *");return response;
 }
 if(!await authenticated(request)&&!await automationAuthorized(request)){
  if(path.startsWith('/api/'))return NextResponse.json({error:'Workspace sign-in required.'},{status:401,headers:{'Cache-Control':'no-store'}});
  const url=new URL('/workspace/login',request.url);url.searchParams.set('next',path.startsWith('/workspace')?path:'/workspace'+path);return NextResponse.redirect(url);
 }
 if(!path.startsWith('/workspace')&&!path.startsWith('/api/'))return NextResponse.redirect(new URL('/workspace'+path+request.nextUrl.search,request.url));
 const response=NextResponse.next();response.headers.set('Cache-Control','private, no-store');response.headers.set('X-Frame-Options','DENY');response.headers.set('Content-Security-Policy',"frame-ancestors 'none'");return response;
}
export const config={matcher:['/((?!_next/static|_next/image|favicon.ico).*)']};
