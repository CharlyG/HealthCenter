/**
 * Singleton Supabase Client
 * ALL files must import from here — never call createClient elsewhere.
 * This prevents the "Multiple GoTrueClient instances" warning.
 */
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;
const API_BASE = `${supabaseUrl}/functions/v1/make-server-845bc545`;

export const supabase = createClient(supabaseUrl, publicAnonKey);
export { projectId, publicAnonKey, supabaseUrl, API_BASE };