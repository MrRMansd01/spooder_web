const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'SUPABASE_URL';

const supabaseKey = 'SUPABASE_KEY';


const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

console.log('Supabase client initialized for server-side operations.');

module.exports = supabase;
