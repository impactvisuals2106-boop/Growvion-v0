# Email Setup Guide

This guide will help you configure email functionality for the contact form.

## Step 1: Get Gmail App Password

Since Gmail requires "App Passwords" for third-party applications, you need to generate one:

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification** (enable it if not already enabled)
3. Scroll down to **App passwords**
4. Click **Select app** → Choose "Mail"
5. Click **Select device** → Choose "Other (Custom name)" → Enter "Impact Visuals Website"
6. Click **Generate**
7. **Copy the 16-character password** (you'll need this for the next step)

## Step 2: Configure Environment Variables

1. Create a `.env.local` file in the root directory (if it doesn't exist)
2. Add the following variables:

```env
EMAIL_USER=impactvisuals2106@gmail.com
EMAIL_PASSWORD=your-16-character-app-password-here
```

**Important:** 
- Replace `your-16-character-app-password-here` with the App Password you generated in Step 1
- Never commit `.env.local` to git (it's already in `.gitignore`)

## Step 3: Restart the Development Server

After adding the environment variables, restart your Next.js server:

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm run dev
```

## How It Works

1. When a user submits the contact form, the data is sent to `/api/contact`
2. The API route uses Nodemailer to send an email to `impactvisuals2106@gmail.com`
3. The email includes:
   - Sender's name
   - Sender's email (as reply-to)
   - Phone number (if provided)
   - Message content
4. The form data is also saved to localStorage for the admin dashboard

## Testing

1. Fill out the contact form on your website
2. Click "Send Message"
3. Check the inbox of `impactvisuals2106@gmail.com`
4. You should receive an email with the form submission details

## Troubleshooting

### Error: "Invalid login"
- Make sure you're using an **App Password**, not your regular Gmail password
- Verify the App Password is correct (no spaces)

### Error: "Authentication failed"
- Ensure 2-Step Verification is enabled on your Google Account
- Generate a new App Password and update `.env.local`

### Email not received
- Check spam/junk folder
- Verify the `EMAIL_USER` in `.env.local` matches the Gmail account
- Check server logs for error messages

## Production Deployment

When deploying to production (Vercel, Netlify, etc.):

1. Add the same environment variables in your hosting platform's dashboard
2. The variables should be:
   - `EMAIL_USER`
   - `EMAIL_PASSWORD`

For Vercel:
- Go to Project Settings → Environment Variables
- Add both variables
- Redeploy your application

## Alternative: Using Other Email Services

If you prefer not to use Gmail, you can modify `app/api/contact/route.ts` to use:
- **SendGrid**
- **Mailgun**
- **AWS SES**
- **Resend**

Just update the transporter configuration accordingly.




