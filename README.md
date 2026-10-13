# Tzu Chi Community Care Intelligence Portal

The application is in [`portal/`](portal/). It is a public Excel-first website with no visitor login or user accounts.

For Vercel, select `portal` as the Root Directory and set the two server-only Supabase database connection variables described in [deployment instructions](portal/DEPLOYMENT.md). Prisma migrations and Supabase configuration are included. Upload **Social Media Report V1.xlsx** through `/import` to update the dashboards.
