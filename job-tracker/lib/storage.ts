import { Job } from './parseReadme';

const STORAGE_KEY = 'job-applications-status';

export function saveAppliedJobs(jobIds: Set<string>): void {
  if (typeof window === 'undefined') return;
  try {
    const data = JSON.stringify(Array.from(jobIds));
    localStorage.setItem(STORAGE_KEY, data);
    console.log(`✅ Saved ${jobIds.size} applied jobs to localStorage`);
  } catch (error) {
    console.error('❌ Failed to save to localStorage:', error);
    alert('Warning: Unable to save data. You may be in private browsing mode or have cookies disabled.');
  }
}

export function loadAppliedJobs(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      console.log('ℹ️ No applied jobs found in localStorage');
      return new Set();
    }
    
    const array = JSON.parse(stored);
    console.log(`✅ Loaded ${array.length} applied jobs from localStorage`);
    return new Set(array);
  } catch (error) {
    console.error('❌ Failed to load from localStorage:', error);
    return new Set();
  }
}

export function toggleJobApplied(jobId: string): Set<string> {
  const appliedJobs = loadAppliedJobs();
  
  if (appliedJobs.has(jobId)) {
    appliedJobs.delete(jobId);
  } else {
    appliedJobs.add(jobId);
  }
  
  saveAppliedJobs(appliedJobs);
  return appliedJobs;
}

export function exportAppliedJobs(jobs: Job[]): void {
  const appliedJobs = jobs
    .filter(job => job.applied)
    .map(job => ({
      company: job.company,
      role: job.role,
      location: job.location,
      category: job.category,
      applicationUrl: job.applicationUrl,
      appliedAt: job.appliedAt,
      age: job.age,
    }));
  
  const dataStr = JSON.stringify(appliedJobs, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `applied-jobs-${new Date().toISOString().split('T')[0]}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

