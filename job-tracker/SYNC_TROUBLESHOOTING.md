# Quick Sync Troubleshooting Checklist

## ✅ Pre-Flight Checklist

Before clicking the Sync button, make sure:

- [ ] Database tables created (ran `lib/database.sql` in Supabase SQL Editor)
- [ ] `.env.local` file exists in the `job-tracker` folder
- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set correctly
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set correctly  
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set (⚠️ **REQUIRED for sync!**)
- [ ] Development server restarted after adding env vars
- [ ] You are logged into the app

## 🔍 Debugging Steps

### 1. Check Environment Variables

In your terminal, from the `job-tracker` folder, run:

```bash
# Check if .env.local exists
ls -la .env.local

# View contents (be careful - don't share this output!)
cat .env.local
```

You should see all three variables set.

### 2. Check Browser Console

1. Open Developer Tools (F12 or Right-click → Inspect)
2. Go to the **Console** tab
3. Click the Sync button
4. Look for error messages

**Common messages:**

| Message | Solution |
|---------|----------|
| `Missing SUPABASE_SERVICE_ROLE_KEY` | Add the service role key to `.env.local` |
| `Permission denied` | Using wrong key or RLS issue |
| `Failed to fetch README` | GitHub rate limit or network issue |
| `No jobs found in README` | README format changed (rare) |

### 3. Check Network Tab

1. Open Developer Tools → **Network** tab
2. Click Sync button
3. Look for a POST request to `/api/jobs`
4. Click on it to see the response

**What to look for:**

- **Status 200**: Success! Check response body for job count
- **Status 500**: Server error - check the error message in response
- **Status 502**: GitHub fetch failed - try again later

### 4. Check Server Logs

If running locally, look at your terminal where `npm run dev` is running. You should see:

```
Fetching README from GitHub...
Fetched README (XXX bytes)
Parsed XXX jobs from README
Marking existing jobs as inactive...
Upserting XXX jobs...
Successfully synced XXX jobs
```

### 5. Verify Database

Check if jobs were actually inserted:

1. Go to Supabase Dashboard → **Table Editor**
2. Select the `jobs` table
3. You should see rows of data
4. Check the `is_active` column (should be `true` for current jobs)

## 🐛 Common Issues & Fixes

### Issue: "Server configuration error: SUPABASE_SERVICE_ROLE_KEY is required"

**Fix:**
1. Go to Supabase → Settings → API
2. Find the **service_role** secret key (NOT the anon key)
3. Add to `.env.local`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your-actual-key-here
   ```
4. Restart dev server: Stop (Ctrl+C), then run `npm run dev`

### Issue: Sync says "success" but table is empty

**Possible causes:**
1. Using anon key instead of service role key
2. RLS policies blocking inserts
3. README parsing returned 0 jobs

**Debug:**
1. Check browser console for actual error
2. Verify you're using the **service_role** key
3. Re-run `lib/database.sql` to recreate tables and policies

### Issue: Jobs appear but disappear on refresh

**Cause:** Jobs are marked as `is_active = false`

**Fix:**
1. Click Sync again (will mark them as active)
2. Or manually update in Supabase: `UPDATE jobs SET is_active = true`

### Issue: Can sync but can't mark jobs as applied

**Different issue** - Related to `applied_jobs` table or user auth

**Fix:**
1. Verify logged in (check user icon in navbar)
2. Check `applied_jobs` table exists in Supabase
3. Check RLS policies on `applied_jobs` table

## 📊 Expected Behavior

### Successful Sync Flow:

1. Click "Sync Jobs" button
2. Button shows loading state (disabled)
3. Alert: "Successfully synced [number] jobs from GitHub!"
4. Jobs appear in the table
5. You can filter, search, and mark jobs as applied

### First Sync vs. Re-Sync:

**First sync:**
- Creates new jobs in database
- All jobs marked as `is_active = true`

**Re-sync (subsequent syncs):**
- Marks all existing jobs as `is_active = false`
- Updates existing jobs or creates new ones
- Updated/new jobs marked as `is_active = true`
- Old jobs remain in DB but hidden (allows preserving your "applied" status)

## 🔐 Security Notes

**Why do we need the service role key?**
- The `jobs` table has Row Level Security (RLS)
- Regular users can only READ jobs
- Only service role can INSERT/UPDATE jobs
- This prevents unauthorized modifications

**Is it safe?**
- ✅ YES - when used only in server-side API routes (like we do)
- ❌ NO - if exposed in client-side code
- Our implementation uses it ONLY in `/app/api/jobs/route.ts` (server-side)

## 📞 Still Having Issues?

1. Check all items in the Pre-Flight Checklist above
2. Review the error message in console
3. Look at server logs in your terminal
4. Verify your Supabase project is active (not paused)
5. Try a fresh database setup (re-run `lib/database.sql`)

## 🚀 After Sync Works

You should be able to:
- See 1000+ internship postings
- Filter by category (Software, Data Science, etc.)
- Search by company or location
- Mark jobs as applied
- Track application dates
- Export your applied jobs

---

**Pro Tip:** Set up a cron job or GitHub Action to sync jobs daily automatically!



