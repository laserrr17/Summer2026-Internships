# Summer 2026 Internship Tracker

A beautiful, modern web application to track your job applications from the [SimplifyJobs/Summer2026-Internships](https://github.com/SimplifyJobs/Summer2026-Internships) repository.

## Features

- 🔐 **Password Protection**: Secure your application data with password authentication
- 📊 **Live Data**: Automatically fetches the latest job listings from the SimplifyJobs GitHub repository
- 🔄 **Auto-Updates**: Jobs refresh automatically - see new postings as they're added!
- ✅ **Application Tracking**: Check off jobs as you apply with persistent local storage
- 🔍 **Advanced Filtering**: Search by company, role, location, category, and application status
- 📈 **Statistics Dashboard**: See total jobs, applied count, and remaining opportunities at a glance
- 💾 **Export Functionality**: Download your applied jobs list as JSON
- 🔗 **Direct Application Links**: Click to apply directly from the table
- 🎨 **Beautiful UI**: Built with shadcn/ui components and Tailwind CSS
- ⚡ **Fast & Responsive**: Next.js with optimized performance
- 🚀 **Vercel Ready**: Deploy in seconds with zero configuration

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone this repository or navigate to the job-tracker directory:
```bash
cd job-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **First Time Setup**: Set a password to protect your application data (minimum 4 characters)
2. **Login**: Enter your password to access the job tracker
3. **Browse Jobs**: The app automatically loads all job listings from the SimplifyJobs repository
4. **Filter Jobs**: Use the search bar and dropdown filters to find specific opportunities
5. **Track Applications**: Click the checkbox next to any job to mark it as applied
6. **Apply to Jobs**: Click the "Apply" link to open the application page in a new tab
7. **View Stats**: Check your progress in the statistics cards at the top
8. **Refresh Data**: Click the refresh button to get the latest job listings (or wait 1 hour for auto-refresh)
9. **Export Data**: Click the download button to export your applied jobs list
10. **Logout**: Click the logout button to secure your data when you're done

### 📝 Important Notes

- **Job Updates**: The app automatically fetches fresh jobs from GitHub! See [UPDATE_GUIDE.md](./UPDATE_GUIDE.md) for details
- **Your Data**: All tracking data is stored locally in your browser - nothing is sent to external servers
- **Vercel Deploy**: Ready to deploy! See [DEPLOYMENT.md](./DEPLOYMENT.md) for instructions

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Storage**: Browser LocalStorage

## Build for Production

```bash
npm run build
npm start
```

## Deploy to Vercel

This app is ready to deploy on Vercel! See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

Quick deploy:
```bash
npm install -g vercel
vercel
```

### Key Features for Deployment:
- ✅ No environment variables needed
- ✅ Server-side API route for fetching jobs (no CORS issues)
- ✅ Automatic caching (1 hour)
- ✅ All data stored locally in user's browser
- ✅ Works perfectly on Vercel's free tier

## Features in Detail

### Password Protection
- Your password is stored securely in browser localStorage (base64 encoded)
- First-time users set up a password, returning users must log in
- No data is sent to any server - everything stays on your device
- **Important**: Remember your password! If forgotten, you'll need to reset (see below)

### Smart Filtering
- Search across company names, roles, and locations
- Filter by job category (Software Engineering, Data Science, etc.)
- Filter by application status (Applied/Not Applied)

### Data Persistence
Your application status is saved locally in your browser, so you won't lose track of your progress even if you close the tab.

### Export Functionality
Export your applied jobs list as a JSON file for backup or integration with other tools.

## Security & Privacy

All data is stored locally in your browser using localStorage:
- Your password (base64 encoded)
- Your application tracking data
- No data is ever sent to external servers (except fetching job listings from GitHub)

### Reset Password

If you forget your password, open your browser's console and run:
```javascript
localStorage.removeItem('job-tracker-password');
localStorage.removeItem('job-tracker-authenticated');
```
Then refresh the page to set a new password. **Note**: This will keep your application data intact.

## Contributing

Feel free to submit issues or pull requests to improve this tool!

## License

MIT License - feel free to use this for your own job search!
