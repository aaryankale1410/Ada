# Aaryan & Akshada 💕

A unified Next.js web application co-locating the interactive React frontend and API route handlers (with Supabase and Google Gemini AI integration), deployed effortlessly to **Vercel** with zero Python and zero Render dependencies.

## Architecture

- **Framework**: Next.js 16 (App Router) + React 19
- **Animations**: Framer Motion
- **Database**: Supabase (`@supabase/supabase-js`)
- **AI / LLM**: Google Gemini 2.5 Flash (`@google/generative-ai`)
- **Deployment**: Vercel (Frontend & Serverless API co-located)

## Features

- **Project Eclipse Gate Screen**: Top Secret cyber terminal access gate
- **Memory Carousel**: Photo slides with touch swipe and smooth transitions
- **Together Time Counter**: Live animated time counter tracking days, hours, minutes, seconds
- **Open When... Letters**: AI-powered personalized letters
- **Period Tracker**: Visual circular tracker, cycle stats, and AI health comments
- **Last Met Tracker**: Counter, date display, and Bollywood Narrator AI comments
- **Last Special Night Tracker**: Counter, date display, and Cheeky Friend AI comments
- **Places Wishlist**: Interactive tabbed wishlist, visited places, and visit charts/stats
- **Food Suggester**: AI dinner decider and meal history chips

## Local Development

1. Ensure dependencies are installed:
   ```bash
   npm install
   ```

2. Your `.env.local` contains:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   SUPABASE_KEY=your_supabase_anon_key
   SUPABASE_URL=your_supabase_url
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Deploying to Vercel

1. Push this repository to GitHub / GitLab / Bitbucket.
2. In the [Vercel Dashboard](https://vercel.com):
   - Click **Add New...** → **Project**
   - Import your repository (Vercel automatically detects Next.js at root)
3. Under **Environment Variables**, add:
   - `GEMINI_API_KEY`
   - `SUPABASE_KEY`
   - `SUPABASE_URL`
4. Click **Deploy**!
