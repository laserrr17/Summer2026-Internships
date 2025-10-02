import { supabase } from './supabase';
import type { User, AuthError } from '@supabase/supabase-js';

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

/**
 * Sign up a new user with email and password
 */
export async function signUp(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('Sign up error:', error);
      
      // Provide user-friendly error messages
      if (error.message.includes('already registered')) {
        return { success: false, error: 'This email is already registered. Please sign in instead.' };
      }
      if (error.message.includes('Password should be')) {
        return { success: false, error: 'Password must be at least 6 characters long.' };
      }
      
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'Failed to create user' };
    }

    return { success: true, user: data.user };
  } catch (error) {
    console.error('Unexpected sign up error:', error);
    return { success: false, error: 'An unexpected error occurred. Please check your internet connection and try again.' };
  }
}

/**
 * Sign in an existing user
 */
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Sign in error:', error);
      
      // Provide user-friendly error messages
      if (error.message.includes('Invalid login credentials')) {
        return { success: false, error: 'Invalid email or password. Please check your credentials and try again.' };
      }
      if (error.message.includes('Email not confirmed')) {
        return { success: false, error: 'Please confirm your email address before signing in.' };
      }
      
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'Failed to sign in' };
    }

    return { success: true, user: data.user };
  } catch (error) {
    console.error('Unexpected sign in error:', error);
    return { success: false, error: 'An unexpected error occurred. Please check your internet connection and try again.' };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get the current user session
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}

/**
 * Get the current session
 */
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });

  return subscription;
}

