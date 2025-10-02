import AppliedJobs from '@/components/AppliedJobs';

// Force this page to be client-side only to avoid prerendering issues
export const dynamic = 'force-dynamic';

export default function AppliedPage() {
  return <AppliedJobs />;
}

