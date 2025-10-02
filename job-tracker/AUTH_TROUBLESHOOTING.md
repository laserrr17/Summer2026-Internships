# Authentication Error - 400 Bad Request

## The Error You're Seeing

```
uzwrpnnhtzrrithfdmsu.supabase.co/auth/v1/token?grant_type=password:1
Failed to load resource: the server responded with a status of 400 ()
```

This is a **400 Bad Request** error from Supabase authentication.

## Common Causes & Solutions

### 1. **Account Doesn't Exist** (Most Common)

If you're trying to **Sign In** but haven't created an account yet:

**Solution:**
- Click "Don't have an account? Sign up" at the bottom
- Create a new account first
- Then you can sign in

### 2. **Wrong Password**

If the account exists but password is incorrect:

**Solution:**
- Double-check your password
- Passwords are case-sensitive
- Try resetting password in Supabase dashboard if needed

### 3. **Email Confirmation Required**

Supabase might be set to require email confirmation.

**Check & Fix:**
1. Go to Supabase Dashboard
2. Navigate to: **Authentication** → **Providers** → **Email**
3. Find "**Confirm email**" setting
4. **Disable** it: Turn OFF "Enable email confirmations"
5. Click **Save**
6. Try logging in again

### 4. **Invalid Email Format**

**Solution:**
- Make sure email is in valid format: `user@example.com`
- No spaces before/after the email
- Must contain @ symbol

### 5. **Password Too Short**

**Solution:**
- Password must be **at least 6 characters**
- Try a longer password

### 6. **Environment Variables Not Set**

**Check:**
```bash
cd job-tracker
cat .env.local
```

You should see:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

If missing, add them and restart the dev server.

## Quick Fix Steps

### Option A: Create a New Account

1. On the login page, click **"Don't have an account? Sign up"**
2. Enter a **different email** (not the one you tried before)
3. Enter a **strong password** (at least 6 characters)
4. Confirm password
5. Click **Sign Up**

### Option B: Use Supabase Dashboard to Create User

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Authentication** → **Users**
4. Click **"Add User"** → **"Create new user"**
5. Enter email and password
6. **Disable "Auto Confirm User"** or enable it (based on your settings)
7. Click **Save**
8. Try signing in with those credentials

### Option C: Reset Database & Auth

If nothing works, reset everything:

1. Supabase Dashboard → **Table Editor**
2. Delete all users from auth schema (if needed)
3. Re-run the database setup: `lib/database.sql`
4. Create a fresh account

## Debugging Steps

### 1. Check Browser Console

Press **F12** → **Console tab**

Look for the actual error message. You should now see:
- More detailed error messages
- Which step failed
- Suggested solutions

### 2. Check Network Tab

Press **F12** → **Network tab**

1. Clear the log
2. Try logging in
3. Look for the request to `/auth/v1/token`
4. Click on it
5. Check **Response** tab for error details

Common error responses:
```json
{
  "error": "Invalid login credentials",
  "error_description": "Invalid login credentials"
}
```
→ **Solution:** Wrong email/password or account doesn't exist

```json
{
  "error": "Email not confirmed"
}
```
→ **Solution:** Disable email confirmation in Supabase

### 3. Verify Supabase Connection

Test if Supabase is reachable:

1. Open browser console
2. Paste this code:
```javascript
fetch(process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/')
  .then(r => console.log('Connection OK:', r.status))
  .catch(e => console.error('Connection failed:', e))
```

If you get a 200 or similar, Supabase is reachable.

## What I Fixed

1. ✅ **Added autocomplete attributes** - Fixes the console warning
2. ✅ **Better error messages** - Now shows user-friendly errors
3. ✅ **Better logging** - Check console for detailed error info

## Recommended: Disable Email Confirmation

For development, it's easier to disable email confirmation:

1. Supabase Dashboard → **Authentication** → **Providers**
2. Click **Email**
3. Scroll to **Email Confirmations**
4. Toggle **OFF**: "Enable email confirmations"
5. Click **Save**

This allows instant sign-up without checking email.

## Test Account Creation

Try creating a test account:

- Email: `test@example.com`
- Password: `test123456`

Steps:
1. Click "Sign up"
2. Enter the credentials above
3. Click Sign Up
4. You should be logged in automatically

If this works, your setup is correct!

## Still Having Issues?

### Check the exact error message

After the improvements I made, the error message in the browser should now be much clearer. Look at:

1. The red error box in the login form
2. Browser console (F12) - will show detailed error
3. Network tab - shows the actual API response

### Common Solutions Summary

| Error Message | Solution |
|--------------|----------|
| "Invalid email or password" | Account doesn't exist - try Sign Up |
| "Email not confirmed" | Disable email confirmation in Supabase |
| "already registered" | Account exists - use Sign In instead |
| "Password must be at least 6 characters" | Use longer password |
| "Server configuration error" | Check .env.local file |

---

**Try this now:**
1. Refresh your browser (Ctrl+R or Cmd+R)
2. Try signing up with a NEW email
3. Check the console for detailed error messages
4. Let me know what error you see!

