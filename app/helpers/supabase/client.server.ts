import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseApiKey = process.env.SUPABASE_KEY!;

const client = createClient(supabaseUrl, supabaseApiKey);

export default client;
