# How Job Updates Work

## Automatic Job List Updates

Your Summer 2026 Internship Tracker **automatically stays up-to-date** with the latest job postings! Here's how:

### 🔄 When Updates Happen

The app fetches fresh job listings from GitHub in these scenarios:

1. **On Page Load**: Every time you log in and load the app
2. **Manual Refresh**: When you click the refresh button (↻) 
3. **Server Cache**: The API caches data for 1 hour, then fetches fresh data

### 📡 Where Jobs Come From

The app fetches directly from:
```
https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/dev/README.md
```

This is the same source as the official repository, ensuring you always see the latest postings.

### 🎯 Update Flow

```
GitHub Repo Updates
    ↓
Your App API Route (fetches every hour)
    ↓
Parser extracts jobs from README
    ↓
Your browser displays updated list
    ↓
Your "Applied" status is preserved!
```

### ✅ Your Data is Safe

When job listings update:
- ✅ New jobs appear automatically
- ✅ Removed/closed jobs disappear
- ✅ **Your "applied" checkmarks are preserved**
- ✅ Your application tracking history stays intact

The app matches jobs by a unique ID (company + role + location), so even if job details change slightly, your tracking data remains accurate.

### 🚀 Deployment Updates

If you're running on Vercel or another host:

- **Job Data**: Updates automatically (no redeploy needed!)
- **App Code**: Requires redeployment when you change features

### ⏱️ Update Frequency

- **Production**: Every 1 hour (cached on server)
- **Development**: Every page load (no caching)
- **Manual**: Click refresh button anytime

### 🔍 How to Check for New Jobs

1. Click the refresh button (↻) in the filters section
2. Or simply reload your browser page
3. New jobs will appear at the top (usually marked as "0d" age)

### 📊 What Updates

| Item | Updates Automatically? |
|------|----------------------|
| New job postings | ✅ Yes |
| Job status (🔒 closed) | ✅ Yes |
| Job age ("0d", "1d", etc.) | ✅ Yes |
| Company names | ✅ Yes |
| Your "Applied" checkmarks | ❌ No (stays on your device) |
| Your password | ❌ No (stays on your device) |

### 💡 Pro Tips

1. **Check Daily**: Visit your tracker daily to see new postings
2. **Watch for Age**: Jobs marked "0d" are posted today
3. **Refresh Often**: Click refresh before each application session
4. **Export Regularly**: Download your applied jobs list as backup

### 🛠️ Technical Details

The app uses Next.js API Routes with caching:
```typescript
next: { revalidate: 3600 } // 1 hour cache
```

This balances:
- 🚀 Fast loading times
- 📡 Up-to-date job listings
- 💰 Reasonable API usage

### ❓ Troubleshooting

**Q: I don't see new jobs that are on GitHub**
- Click the refresh button
- Wait 1 hour for cache to expire
- Clear browser cache if needed

**Q: Jobs I applied to disappeared**
- They may have been closed/removed from the repo
- Your "applied" status is still saved
- Export your data regularly as backup

**Q: How long until I see today's jobs?**
- Usually within 1 hour
- Click refresh to force update

---

Remember: Your job tracker is always connected to the latest SimplifyJobs repository data! 🎉

