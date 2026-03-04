
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Basic .env.local parser
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const match = line.match(/^([^#=]+)=(.*)$/);
            if (match) {
                process.env[match[1].trim()] = match[2].trim().replace(/^"(.*)"$/, '$1'); // Clear quotes
            }
        });
    } catch (err) {
        console.error('Error loading .env.local:', err.message);
    }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findAndSetAdmin(email) {
    console.log(`Searching for user with email: ${email}...`);

    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
        console.error('Error listing users:', authError.message);
        return;
    }

    const targetUser = users.find(u => u.email === email);

    if (!targetUser) {
        console.error(`User with email ${email} not found in auth.users.`);
        console.log('Emails in DB:', users.map(u => u.email).join(', '));
        return;
    }

    console.log(`Found user: ${targetUser.id}. Updating profile role...`);

    const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'switchmycare_admin' })
        .eq('id', targetUser.id);

    if (profileError) {
        console.error('Error updating profile role:', profileError.message);
        return;
    }

    console.log('Successfully updated user role to switchmycare_admin.');
}

const email = process.argv[2];
if (!email) {
    console.error('Please provide an email address.');
    process.exit(1);
}

findAndSetAdmin(email);
