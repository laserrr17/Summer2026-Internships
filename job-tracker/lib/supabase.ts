import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables not set. Database features will not work.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
      };
      applied_jobs: {
        Row: {
          id: number;
          user_id: string;
          job_id: string;
          company: string;
          role: string;
          location: string;
          category: string;
          age: string;
          application_url: string | null;
          applied_at: string;
          notes: string | null;
        };
        Insert: {
          user_id: string;
          job_id: string;
          company: string;
          role: string;
          location: string;
          category: string;
          age: string;
          application_url?: string | null;
          notes?: string | null;
        };
      };
    };
  };
}

