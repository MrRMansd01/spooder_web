const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lholzspyazziknxqopmi.supabase.co';

const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxob2x6c3B5YXp6aWtueHFvcG1pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjAyNzQxMCwiZXhwIjoyMDU3NjAzNDEwfQ.14HkUztZeFreB3fA3WVxdOOzcN8V1mROkZE6bJ0UOkk';


const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

console.log('Supabase client initialized for server-side operations.');

module.exports = supabase;
