# Migration to Backend Database

## What Changed?

Your job tracker has been **upgraded from localStorage to a proper backend database** with user authentication!

### Before (localStorage):
- ❌ Data lost on browser cache clear
- ❌ Not synced across devices
- ❌ No multi-user support
- ❌ Limited to one browser

### After (Supabase Backend):
- ✅ Data persists in PostgreSQL database
- ✅ Sync across all your devices
- ✅ Each user has their own account
- ✅ Secure email + password authentication
- ✅ Automatic backups
- ✅ No data loss

---

## New Files Created

### Configuration & Services
- `lib/supabase.ts` - Supabase client configuration
- `lib/authService.ts` - User authentication (sign up, sign in, sign out)
- `lib/jobService.ts` - Job application CRUD operations
- `lib/database.sql` - Database schema and security policies

### Updated Components
- `components/AuthForm.tsx` - New login/signup form (replaces old LoginForm)
- `components/JobTracker.tsx` - Updated to use Supabase auth & database
- `components/AppliedJobs.tsx` - Updated to use Supabase auth & database

### Documentation
- `SETUP.md` - Complete setup guide for Supabase
- `env-template.txt` - Environment variables template
- `README.md` - Updated with new features and setup instructions

---

## What You Need To Do

### 1. Set Up Supabase (5 minutes)

1. **Create Account**: Go to [supabase.com](https://supabase.com) and sign up (free!)
2. **Create Project**: Click "New Project" and give it a name
3. **Run SQL Migration**: 
   - Go to SQL Editor in Supabase
   - Copy all code from `lib/database.sql`
   - Paste and click "Run"
4. **Get API Keys**:
   - Go to Settings → API
   - Copy the "Project URL" and "anon public" key

### 2. Configure Environment Variables

Create a file named `.env.local` in the `job-tracker` folder:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace with your actual values from step 1!

### 3. Start the App

```bash
npm run dev
```

### 4. Create Your Account

- Click "Sign Up"
- Enter your email and password
- Start tracking jobs!

---

## Database Schema

### `applied_jobs` table

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Auto-incrementing primary key |
| user_id | uuid | References auth.users (who owns this record) |
| job_id | text | Unique job identifier |
| company | text | Company name |
| role | text | Job title |
| location | text | Job location |
| category | text | Job category |
| age | text | How old the listing is |
| application_url | text | Link to apply (optional) |
| notes | text | User notes (optional, for future use) |
| applied_at | timestamp | When job was marked as applied |

**Security**: Row Level Security (RLS) ensures users can only access their own data.

---

## Breaking Changes

### Old Auth System (localStorage)
```typescript
// Old way - localStorage password
const isAuth = isAuthenticated();  // Checked localStorage
login(password);  // Just a password
```

### New Auth System (Supabase)
```typescript
// New way - Email + Password
const user = await getCurrentUser();  // Gets actual user from Supabase
await signIn(email, password);  // Email + password required
```

### Old Storage System
```typescript
// Old way - localStorage
const applied = loadAppliedJobs();  // From localStorage
toggleJobApplied(jobId);  // Saves to localStorage
```

### New Storage System
```typescript
// New way - Database
const applied = await getAppliedJobs();  // From database
await toggleJobApplication(job, isApplied);  // Saves to database
```

---

## Features You Can Add Later

The new backend enables many future enhancements:

- 📝 **Notes**: Add notes to each application
- 📅 **Deadlines**: Set application deadlines
- 📊 **Analytics**: Track application success rates
- 🔔 **Notifications**: Email reminders for deadlines
- 👥 **Sharing**: Share your list with friends
- 📱 **Mobile App**: Build a native mobile version

All of these are now possible because your data is in a real database!

---

## Troubleshooting

### "Supabase environment variables not set"
→ Make sure `.env.local` exists with correct values  
→ Restart your dev server after creating the file

### "Failed to sign in"
→ Check that you ran the SQL migration in Supabase  
→ Make sure your password is at least 6 characters

### Email confirmation required
→ Go to Supabase: Authentication → Providers → Email  
→ Turn off "Confirm email" for development

---

## Migration from Old Data

Unfortunately, **localStorage data cannot be automatically migrated** because:
1. Old system had no user accounts (just one password for everyone)
2. New system requires individual user accounts
3. Data was stored client-side only

**If you had important data:**
1. Use the old version to export your data (Download button)
2. Keep the JSON file for reference
3. In the new version, manually re-mark jobs as applied

Sorry for the inconvenience! The new system is much more reliable.

---

## Questions?

Read the detailed [SETUP.md](SETUP.md) guide for more information.

