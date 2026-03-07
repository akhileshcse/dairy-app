# Jamindar Dairy Management System

Welcome to the Jamindar Dairy project monorepo! This repository contains both the **Dashboard** (Next.js) for farm administrators and the **Mobile App** (React Native/Expo) for field workers and farmers.

## How to Deploy the Dashboard on Vercel

This repository is already configured and **100% Vercel Ready** out of the box. Follow these steps to host it live for free:

1. Log in to your [Vercel](https://vercel.com) account and click **Add New Project**.
2. Import this GitHub repository (`akhileshcse/dairy`).
3. In the "Configure Project" screen, make the following two quick changes:
   - **Framework Preset**: Make sure `Next.js` is selected.
   - **Root Directory**: Click the "Edit" button and select the `dashboard` folder (since this is a monorepo).
4. Drop down the **Environment Variables** section and add the two Supabase variables exactly as you have them in your local `.env.local` file:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://dfguyftlfnpduetjxubb.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `(Your Supabase Anon/Publishable Key)`
5. Click **Deploy**! 🚀

Vercel will successfully build the app directly from the `dashboard` folder and give you a live HTTPS link!
