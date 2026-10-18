/**
 * Supabase client — server-only.
 * Uses the anon key (same as the Python backend did).
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_KEY;

export const supabase = url && key ? createClient(url, key) : null;
