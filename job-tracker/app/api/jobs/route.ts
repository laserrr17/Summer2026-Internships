import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { parseReadme } from '@/lib/parseReadme';

const REPO_URL = 'https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/dev/README.md';

// Create a server-side Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

// GET /api/jobs - Fetch all active jobs from database
export async function GET() {
  try {
    const supabase = getSupabaseClient();
    
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching jobs from database:', error);
      return NextResponse.json(
        { error: 'Failed to fetch jobs from database' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      jobs: jobs || [],
      count: jobs?.length || 0
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

// POST /api/jobs - Sync jobs from GitHub to database
export async function POST() {
  try {
    // Fetch README from GitHub
    const response = await fetch(REPO_URL, {
      headers: {
        'Accept': 'text/plain',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch README: ${response.status}`);
    }

    const readme = await response.text();
    const jobs = parseReadme(readme);

    // Store jobs in database
    const supabase = getSupabaseClient();

    // Mark all existing jobs as inactive first
    await supabase
      .from('jobs')
      .update({ is_active: false })
      .eq('is_active', true);

    // Insert or update jobs
    const jobsToUpsert = jobs.map(job => ({
      id: job.id,
      company: job.company,
      role: job.role,
      location: job.location,
      category: job.category,
      age: job.age,
      application_url: job.applicationUrl || null,
      is_active: true,
      updated_at: new Date().toISOString()
    }));

    const { error: upsertError } = await supabase
      .from('jobs')
      .upsert(jobsToUpsert, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      });

    if (upsertError) {
      console.error('Error upserting jobs:', upsertError);
      return NextResponse.json(
        { error: 'Failed to sync jobs to database' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      count: jobs.length,
      message: `Successfully synced ${jobs.length} jobs`
    });
  } catch (error) {
    console.error('Error syncing jobs:', error);
    return NextResponse.json(
      { error: 'Failed to sync jobs' },
      { status: 500 }
    );
  }
}

