import type {NextConfig} from 'next';
// Keep lint as its dedicated command, matching the previous Next.js 16 build behavior.
// Type checking remains enabled during production builds.
const nextConfig:NextConfig={distDir:process.env.NEXT_BUILD_DIR||'.next',serverExternalPackages:['@prisma/client'],poweredByHeader:false,eslint:{ignoreDuringBuilds:true}};
export default nextConfig;
