
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Manually parse .env.local because dotenv CLI usage on Windows can be tricky
const envPath = path.resolve(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        envVars[key.trim()] = value.trim();
    }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing environment variables in .env.local');
    // console.log('Parsed:', envVars); // Debug if needed
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('Checking database connection...');
    const { data, error } = await supabase.from('bookings').select('count', { count: 'exact', head: true });

    if (error) {
        console.error('Error connecting to table "bookings":', error.message);
        console.log('Please ensure you have run the "schema.sql" in your Supabase SQL Editor.');
    } else {
        console.log('Success! Connected to "bookings" table.');
    }
}

checkSchema();
