import JobTracker from '@/components/JobTracker';

// Force this page to be client-side only to avoid prerendering issues
export const dynamic = 'force-dynamic';

export default function Home() {
  return <JobTracker />;
}
