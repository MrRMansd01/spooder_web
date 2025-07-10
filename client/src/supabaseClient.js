import { createClient } from '@supabase/supabase-js';


const supabaseUrl = 'SUPABASE_URL'; 
const supabaseAnonKey = 'SUPABASE_KEY_َANON';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
