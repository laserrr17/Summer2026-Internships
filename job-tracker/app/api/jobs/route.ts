import { NextResponse } from 'next/server';

const REPO_URL = 'https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/dev/README.md';

export async function GET() {
  try {
    const response = await fetch(REPO_URL, {
      headers: {
        'Accept': 'text/plain',
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const text = await response.text();
    
    return NextResponse.json({ 
      content: text,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching README:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job listings' },
      { status: 500 }
    );
  }
}

