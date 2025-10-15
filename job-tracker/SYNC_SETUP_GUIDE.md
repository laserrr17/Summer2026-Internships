# Sync Jobs Setup Guide

## Problem
When you click the "Sync" button, the jobs table remains empty because the sync operation requires the `SUPABASE_SERVICE_ROLE_KEY` environment variable.

## Why is this needed?
The `jobs` table has Row Level Security (RLS) enabled. Only users with the `service_role` permission can insert or update jobs. This is a security feature to prevent unauthorized modifications.

## Solution

### Step 1: Get your Service Role Key from Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Scroll down to **Project API keys**
5. Find the **`service_role`** key (it's different from the `anon` key)
6. Click the eye icon to reveal it
7. Copy the key

⚠️ **WARNING**: The service role key bypasses all Row Level Security. Keep it secret and never expose it in client-side code!

### Step 2: Add the Service Role Key to your environment

#### For Local Development:

1. Open (or create) the file `.env.local` in the `job-tracker` folder
2. Add this line (replace with your actual key):

```env
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key-here
```

Your `.env.local` should now look like this:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

3. **Restart your development server**:
   - Stop the server (Ctrl+C)
   - Run `npm run dev` again

#### For Production (Vercel):

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Click **Add New**
4. Enter:
   - **Name**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: (paste your service role key)
   - **Environments**: Check all (Production, Preview, Development)
5. Click **Save**
6. **Redeploy** your application for the changes to take effect

### Step 3: Test the Sync

1. Refresh your browser (to clear any cache)
2. Log in to your app
3. Click the **"Sync Jobs"** button (🔄 icon)
4. You should see a success message: "Successfully synced [number] jobs from GitHub!"
5. The jobs should now appear in your table

## Troubleshooting

### Error: "SUPABASE_SERVICE_ROLE_KEY is required"
- **Cause**: The environment variable is not set
- **Fix**: Follow Step 2 above and make sure to restart your dev server

### Error: "Permission denied"
- **Cause**: Using wrong key or RLS policy issue
- **Fix**: 
  1. Double-check you copied the **service_role** key (not the anon key)
  2. Verify the database schema was set up correctly by running the SQL in `lib/database.sql`

### Sync succeeds but jobs still don't show
- **Cause**: README parsing might have failed or returned 0 jobs
- **Check**: 
  1. Open browser console (F12) and look for error messages
  2. Check the Network tab for the POST request to `/api/jobs`
  3. The response should show the count of jobs synced

### Jobs show but can't mark as applied
- **Cause**: Different issue - user authentication or RLS for applied_jobs table
- **Fix**: Make sure you're logged in and the `applied_jobs` table exists with correct RLS policies

## What Changed?

I've improved the error handling so you'll get clear error messages if:
- The service role key is missing
- There's a permission issue
- The sync operation fails for any reason

The error messages will now guide you to the solution instead of failing silently.

## Next Steps

After syncing successfully:
1. ✅ You should see all jobs from the GitHub README
2. ✅ You can filter by category, location, etc.
3. ✅ You can mark jobs as applied
4. ✅ Your data persists across sessions
5. ✅ Re-syncing will update the job list with new postings

---

**Need help?** Check the console logs (F12 → Console) for detailed error messages.



