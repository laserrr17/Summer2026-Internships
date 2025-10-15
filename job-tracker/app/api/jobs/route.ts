import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { parseReadme } from '@/lib/parseReadme';

const REPO_URL = 'https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/dev/README.md';

// Create a server-side Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  // For POST (sync), use service role key. For GET, can use anon key.
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

// GET /api/jobs - Fetch all active jobs from database
export async function GET() {
  try {
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error('Missing NEXT_PUBLIC_SUPABASE_URL');
      return NextResponse.json(
        { error: 'Server configuration error: Missing database URL' },
        { status: 500 }
      );
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_ANON_KEY');
      return NextResponse.json(
        { error: 'Server configuration error: Missing database credentials' },
        { status: 500 }
      );
    }

    const supabase = getSupabaseClient();
    
    // Fetch all active jobs (no limit - Supabase default is 1000)
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(10000); // Increased from default 1000 to support more jobs

    if (error) {
      console.error('Error fetching jobs from database:', error);
      return NextResponse.json(
        { error: `Failed to fetch jobs from database: ${error.message}` },
        { status: 500 }
      );
    }

    // Filter out jobs without application URLs
    const jobsWithUrls = (jobs || []).filter(job => job.application_url && job.application_url.trim() !== '');
    console.log(`Returning ${jobsWithUrls.length} jobs with URLs (filtered out ${(jobs?.length || 0) - jobsWithUrls.length} without URLs)`);

    return NextResponse.json({ 
      jobs: jobsWithUrls,
      count: jobsWithUrls.length
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching jobs:', errorMessage);
    return NextResponse.json(
      { error: `Failed to fetch jobs: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// POST /api/jobs - Sync jobs from GitHub to database
export async function POST() {
  try {
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error('Missing NEXT_PUBLIC_SUPABASE_URL');
      return NextResponse.json(
        { error: 'Server configuration error: Missing database URL' },
        { status: 500 }
      );
    }

    // Check for service role key - required for syncing jobs
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing SUPABASE_SERVICE_ROLE_KEY - required for syncing jobs');
      return NextResponse.json(
        { 
          error: 'Server configuration error: SUPABASE_SERVICE_ROLE_KEY is required for syncing jobs. Please add it to your environment variables.',
          details: 'The service role key is needed to bypass Row Level Security when inserting jobs into the database.'
        },
        { status: 500 }
      );
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
      return NextResponse.json(
        { error: 'Server configuration error: Missing database credentials' },
        { status: 500 }
      );
    }

    // Fetch README from GitHub
    console.log('Fetching README from GitHub...');
    const response = await fetch(REPO_URL, {
      headers: {
        'Accept': 'text/plain',
      },
    });

    if (!response.ok) {
      const errorMsg = `Failed to fetch README: ${response.status} ${response.statusText}`;
      console.error(errorMsg);
      return NextResponse.json(
        { error: errorMsg },
        { status: 502 }
      );
    }

    const readme = await response.text();
    console.log(`Fetched README (${readme.length} bytes)`);
    
    const allJobs = parseReadme(readme);
    console.log(`Parsed ${allJobs.length} jobs from README`);

    // Filter out jobs without application URLs
    const jobs = allJobs.filter(job => job.applicationUrl && job.applicationUrl.trim() !== '');
    console.log(`Filtered to ${jobs.length} jobs with application URLs (removed ${allJobs.length - jobs.length} without URLs)`);

    if (jobs.length === 0) {
      console.warn('No jobs with application URLs found in README');
      return NextResponse.json(
        { error: 'No jobs with application URLs found in README', warning: true },
        { status: 200 }
      );
    }

    // Store jobs in database
    const supabase = getSupabaseClient();

    // Mark all existing jobs as inactive first
    console.log('Marking existing jobs as inactive...');
    const { error: updateError } = await supabase
      .from('jobs')
      .update({ is_active: false })
      .eq('is_active', true);

    if (updateError) {
      console.error('Error marking jobs as inactive:', updateError);
      return NextResponse.json(
        { error: `Database error: ${updateError.message}` },
        { status: 500 }
      );
    }

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

    console.log(`Upserting ${jobsToUpsert.length} jobs...`);
    const { error: upsertError, count } = await supabase
      .from('jobs')
      .upsert(jobsToUpsert, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      });

    if (upsertError) {
      console.error('Error upserting jobs:', upsertError);
      console.error('Error code:', upsertError.code);
      console.error('Error details:', upsertError.details);
      console.error('Error hint:', upsertError.hint);
      
      // Provide helpful error message for RLS issues
      if (upsertError.code === '42501' || upsertError.message.includes('policy')) {
        return NextResponse.json(
          { 
            error: 'Permission denied: SUPABASE_SERVICE_ROLE_KEY is required',
            details: 'The jobs table requires service role permissions to insert/update. Please ensure SUPABASE_SERVICE_ROLE_KEY is set in your environment variables.',
            supabaseError: upsertError.message
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { 
          error: `Failed to sync jobs to database: ${upsertError.message}`,
          code: upsertError.code,
          details: upsertError.details
        },
        { status: 500 }
      );
    }

    console.log(`Successfully synced ${jobs.length} jobs`);
    return NextResponse.json({ 
      success: true,
      count: jobs.length,
      message: `Successfully synced ${jobs.length} jobs`
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('Error syncing jobs:', errorMessage, errorStack);
    return NextResponse.json(
      { error: `Failed to sync jobs: ${errorMessage}` },
      { status: 500 }
    );
  }
}

