import SoftwareEngineeringJobs from '@/components/SoftwareEngineeringJobs';

// Force this page to be client-side only to avoid prerendering issues
export const dynamic = 'force-dynamic';

export default function SoftwareEngineeringPage() {
  return <SoftwareEngineeringJobs />;
}

