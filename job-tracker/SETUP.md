# Backend Setup Guide

This application now uses **Supabase** for database and authentication. Follow these steps to set it up:

## 1. Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for a free account (no credit card required)
3. Create a new project

## 2. Set Up the Database

1. In your Supabase project, go to the **SQL Editor**
2. Open the file `lib/database.sql` in this project
3. Copy all the SQL code
4. Paste it into the Supabase SQL Editor
5. Click **Run** to create the tables and security policies

## 3. Get Your API Keys

1. In Supabase, go to **Settings** → **API**
2. You'll see:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (a long string)
3. Keep this tab open, you'll need these values next

## 4. Configure Environment Variables

1. In the `job-tracker` folder, create a file named `.env.local`
2. Add these lines (replace with your actual values):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Important:** 
- Replace the values with YOUR actual Supabase URL and keys!
- The **service role key** is required for the sync feature to work
- Find all keys in: Supabase → Settings → API
- ⚠️ Keep the service role key secret - never commit it to git!

## 5. Start the Application

```bash
npm run dev
```

Visit `http://localhost:3000` and you should see the login page!

## 6. Create Your First Account

1. Click "Sign Up"
2. Enter your email and password (minimum 6 characters)
3. You'll be automatically logged in
4. Start tracking your job applications!

---

## Features

✅ **User Authentication** - Each user has their own account  
✅ **Secure Data** - Your data is private and encrypted  
✅ **Persistent Storage** - Data is saved in a real database  
✅ **Cross-Device Sync** - Access your data from any device  
✅ **Automatic Backups** - Supabase handles backups automatically  
✅ **Application Dates** - Track when you applied to each job  
✅ **Smart Sorting** - Most recent applications appear first  

---

## Troubleshooting

### "Supabase environment variables not set"

- Make sure you created `.env.local` in the `job-tracker` folder
- Check that the variable names are exactly: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart your dev server after creating/editing `.env.local`

### "Failed to fetch job listings"

- Check your internet connection
- The GitHub README might be temporarily unavailable
- Try clicking the refresh button

### "Authentication failed"

- Check that you ran the SQL migration in Supabase
- Verify your email is valid
- Password must be at least 6 characters

### Email Confirmation Required

By default, Supabase requires email confirmation. To disable this for development:

1. Go to **Authentication** → **Providers** → **Email**
2. Turn off "Confirm email"
3. Save changes

---

## Database Schema

The application uses a single table:

### `applied_jobs` table

- `id` - Auto-incrementing ID
- `user_id` - References the authenticated user
- `job_id` - Unique identifier for the job
- `company` - Company name
- `role` - Job title
- `location` - Job location
- `category` - Job category (Software Engineering, Quant, etc.)
- `age` - How old the listing is
- `application_url` - Link to apply
- `notes` - Optional notes (for future use)
- `applied_at` - Timestamp when marked as applied

Row Level Security (RLS) ensures users can only see their own data.

---

## Deployment to Vercel

When deploying to Vercel, you **don't use `.env.local`** - instead:

### Quick Steps:

1. **Push your code to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your repository
   - **Important:** Set root directory to `job-tracker`

3. **Add environment variables in Vercel dashboard:**
   - Go to your project → **Settings** → **Environment Variables**
   - Add `NEXT_PUBLIC_SUPABASE_URL` (value from Supabase)
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` (value from Supabase)
   - Select all environments (Production, Preview, Development)

4. **Redeploy**
   - Go to **Deployments** tab
   - Click (...) on latest deployment → **Redeploy**

📖 **Detailed Vercel Deployment Guide**: See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)

Your production site will automatically use the environment variables from Vercel!

---

## Security Notes

- The `anon` key is safe to use in the browser (it's public)
- Row Level Security (RLS) protects your data
- Never share your Supabase service role key (we don't use it in this app)
- Each user can only access their own data

---

## Migration from localStorage

If you had data in the old localStorage version:

1. Export your data using the Download button (before updating)
2. After updating, manually mark jobs as applied again
3. Sorry for the inconvenience! This new system is much more reliable.

---

## Support

If you encounter issues:
1. Check the browser console (F12) for error messages
2. Verify your Supabase project is active
3. Make sure you ran the SQL migration
4. Check that environment variables are set correctly

