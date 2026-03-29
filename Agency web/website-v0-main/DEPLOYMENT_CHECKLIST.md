# Pre-Deployment Checklist

Use this checklist before deploying to Vercel.

## Code Preparation

- [ ] All code committed to Git
- [ ] Code pushed to GitHub/GitLab/Bitbucket
- [ ] No sensitive data in code (use environment variables)
- [ ] `.env.local` is in `.gitignore` (should not be committed)

## Environment Variables to Add in Vercel

Copy these values from your `.env.local` file:

```
EMAIL_USER=impactvisuals2106@gmail.com
EMAIL_PASSWORD=nrzhcuoioyliqlno
NEXT_PUBLIC_SUPABASE_URL=https://adfukbefpealopyxidal.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkZnVrYmVmcGVhbG9weXhpZGFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDE2MjAsImV4cCI6MjA4NTAxNzYyMH0.sZymITcMzyljlig5MzlWmxOKLEkPANAPb0xwPvB5hJI
```

## Database Setup

- [ ] Supabase project created
- [ ] `leads` table created in Supabase
- [ ] Supabase credentials obtained
- [ ] Tested database connection locally

## Email Setup

- [ ] Gmail App Password generated
- [ ] Email sending tested locally
- [ ] Email credentials ready for Vercel

## Testing

- [ ] Home page loads correctly
- [ ] Contact form works
- [ ] Email is sent on form submission
- [ ] Data is saved to Supabase
- [ ] Admin dashboard accessible
- [ ] Admin dashboard shows leads

## Vercel Configuration

- [ ] Vercel account created
- [ ] Git repository connected
- [ ] Environment variables added in Vercel
- [ ] Build settings verified

## Post-Deployment

- [ ] Site accessible at Vercel URL
- [ ] All pages load correctly
- [ ] Contact form works in production
- [ ] Admin dashboard works in production
- [ ] Emails are being sent
- [ ] Data is saving to Supabase




