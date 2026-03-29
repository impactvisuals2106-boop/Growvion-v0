# Impact Visuals - Next.js Website

A modern marketing agency website built with Next.js and React.

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
├── app/                 # Next.js App Router pages
├── components/          # React components
├── public/             # Static assets
├── styles/             # Global styles
└── lib/                # Utility functions
```

## Features

- Modern React components
- Responsive design
- Admin dashboard for lead management
- Smooth animations
- SEO optimized
- Email notifications via Gmail
- Supabase database integration

## Deployment

This project is ready to deploy to Vercel. See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel

1. Push your code to GitHub/GitLab/Bitbucket
2. Import project in Vercel
3. Add environment variables (see VERCEL_DEPLOYMENT.md)
4. Deploy!

## Environment Variables

Required environment variables (add in Vercel dashboard):

- `EMAIL_USER` - Gmail address for sending emails
- `EMAIL_PASSWORD` - Gmail App Password
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key

"# website-v0" 
