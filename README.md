# Tzu Chi Community Care Intelligence Portal

The Next.js/React application is in [`portal/`](portal/). It includes a public community website and a private staff Workspace protected by the existing workspace session. Public visitors receive a restricted publishing projection, not the private analytics dataset.

For Vercel, select `portal` as the Root Directory and configure the server-only database, workspace, storage and optional AI settings described in the [deployment instructions](portal/DEPLOYMENT.md). Prisma migrations and Supabase configuration are included. Staff can manage records directly or import Excel through `/workspace/import`.

See the [workspace audit and improvements](portal/PRODUCT-IMPROVEMENTS.md) for current architecture, verification and known limitations. The in-app User Guide documents current staff workflows.
