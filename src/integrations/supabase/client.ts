/**
 * Supabase Client Configuration
 *
 * IMPORTANT: This file uses environment variables from .env file
 * DO NOT hardcode credentials here - they MUST come from import.meta.env
 *
 * If you see errors like "Failed to fetch", verify:
 * 1. .env file exists with VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY
 * 2. Server has been restarted after .env changes
 * 3. Cache has been cleared (node_modules/.vite)
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Load from environment variables - NEVER hardcode these values
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Validation: ensure environment variables are loaded
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error('❌ Supabase configuration error: Missing environment variables');
  console.error('Expected VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env file');
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Validation: ensure we're using real Supabase keys (JWT format), not Lovable proxy keys
if (SUPABASE_PUBLISHABLE_KEY.startsWith('sb_publishable_')) {
  console.error('❌ Invalid Supabase key detected: Using Lovable proxy key instead of real JWT');
  console.error('Please update .env file with the real anon key from Supabase dashboard');
  throw new Error('Invalid Supabase configuration: Proxy key detected. Use real JWT key from .env');
}

// Validation: ensure key is in JWT format
if (!SUPABASE_PUBLISHABLE_KEY.startsWith('eyJ')) {
  console.error('❌ Invalid Supabase key format: Expected JWT starting with "eyJ"');
  throw new Error('Invalid Supabase key format. Please verify your .env file.');
}

console.log('✅ Supabase client initialized successfully');
console.log('📍 URL:', SUPABASE_URL);

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
