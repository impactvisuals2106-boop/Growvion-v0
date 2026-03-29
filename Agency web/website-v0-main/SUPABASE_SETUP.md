# Supabase Setup Guide

This guide will help you set up Supabase database for storing contact form submissions.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click **"New Project"**
4. Fill in the project details:
   - **Name**: Impact Visuals (or any name you prefer)
   - **Database Password**: Create a strong password (save it securely)
   - **Region**: Choose the closest region to your users
5. Click **"Create new project"**
6. Wait for the project to be set up (takes 1-2 minutes)

## Step 2: Create the Database Table

1. In your Supabase dashboard, go to **"Table Editor"** (left sidebar)
2. Click **"New table"**
3. Configure the table:
   - **Name**: `leads`
   - **Description**: Contact form submissions
4. Add the following columns:

| Column Name | Type | Default Value | Nullable | Description |
|------------|------|---------------|----------|-------------|
| `id` | `uuid` | `gen_random_uuid()` | No | Primary key (auto-generated) |
| `name` | `text` | - | No | Contact name |
| `email` | `text` | - | No | Contact email |
| `phone` | `text` | - | Yes | Contact phone (optional) |
| `message` | `text` | - | No | Contact message |
| `created_at` | `timestamptz` | `now()` | No | Timestamp (auto-generated) |

5. Click **"Save"** to create the table

### Alternative: Using SQL Editor

You can also create the table using SQL:

1. Go to **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Paste this SQL:

```sql
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security (optional, for production)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all operations (for admin dashboard)
-- In production, you should restrict this based on authentication
CREATE POLICY "Allow all operations on leads" ON leads
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

4. Click **"Run"** to execute

## Step 3: Get Your API Keys

1. In your Supabase dashboard, go to **"Settings"** (gear icon)
2. Click **"API"** in the left sidebar
3. You'll see:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

## Step 4: Configure Environment Variables

1. Open your `.env.local` file in the project root
2. Add these variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Email Configuration (keep existing)
EMAIL_USER=impactvisuals2106@gmail.com
EMAIL_PASSWORD=your-app-password-here
```

**Example:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Step 5: Install Dependencies

The Supabase client is already added to `package.json`. Install it:

```bash
npm install
```

## Step 6: Restart the Development Server

After adding environment variables:

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## How It Works

1. **Contact Form Submission:**
   - User fills out the form and clicks "Send Message"
   - Email is sent to `impactvisuals2106@gmail.com`
   - Data is saved to Supabase `leads` table

2. **Admin Dashboard:**
   - Admin logs in at `/admin`
   - Dashboard fetches all leads from Supabase
   - Admin can view and delete leads

## Testing

1. Submit a test contact form on your website
2. Check Supabase dashboard → **Table Editor** → `leads` table
3. You should see the new entry
4. Check the admin dashboard at `/admin` - it should show the lead

## Security Notes

### For Production:

1. **Row Level Security (RLS):**
   - The current setup allows all operations
   - For production, you should:
     - Enable RLS on the `leads` table
     - Create policies based on user authentication
     - Use service role key for server-side operations (keep it secret!)

2. **API Keys:**
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe to expose (it's public)
   - Never expose the `service_role` key in client-side code
   - Use environment variables for all sensitive data

3. **Database Access:**
   - Consider adding authentication to the admin dashboard
   - Use Supabase Auth for user management
   - Implement proper access controls

## Troubleshooting

### Error: "Failed to load leads"
- Check if Supabase environment variables are set correctly
- Verify the table name is `leads` (case-sensitive)
- Check Supabase dashboard for any errors

### Error: "Failed to save lead"
- Verify the table structure matches the expected schema
- Check if all required fields (name, email, message) are present
- Look at server logs for detailed error messages

### Data not appearing in dashboard
- Refresh the page
- Check browser console for errors
- Verify the API route `/api/leads` is working
- Check Supabase dashboard to see if data was saved

## Next Steps

- Add pagination for large datasets
- Add search/filter functionality
- Implement email notifications for new leads
- Add export functionality (CSV/Excel)
- Set up real-time subscriptions for live updates




