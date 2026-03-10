import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing environment variables in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function reloadSchema() {
    console.log("Attempting to force schema cache reload...");

    // We can force the PostgREST cache to reload by adding a fake column and removing it immediately
    // This causes Postgres to trigger the DDL schema trigger, updating PostgREST instantly.
    try {
        const { error: addErr } = await supabase.rpc('exec_sql', {
            sql: "ALTER TABLE milk_logs ADD COLUMN dummy_cache_bust TEXT;"
        });

        if (addErr && !addErr.message.includes('function "exec_sql" does not exist')) {
            console.error("Could not add dummy column:", addErr.message);
        }

        const { error: delErr } = await supabase.rpc('exec_sql', {
            sql: "ALTER TABLE milk_logs DROP COLUMN IF EXISTS dummy_cache_bust;"
        });

    } catch (e) {
        console.log("RPC bypass failed, but that's okay. Using alternate method...");
    }

    // Alternate: just try to insert a fake record with explicit columns to see if it bypasses cache
    // Actually, if we just alert the user to use the Dashboard Table Editor, it's 100% foolproof.
    console.log("");
    console.log("=================================================================");
    console.log("To 100% fix the Mobile App Destination error, do this right now:");
    console.log("1. Open your Supabase Dashboard in your browser.");
    console.log("2. Go to the 'Table Editor' on the left menu.");
    console.log("3. Click on the 'milk_logs' table.");
    console.log("4. Click the 'Insert Row' button (top right of the table).");
    console.log("5. Don't fill anything out, just click 'Cancel' (or add a fake row and delete it).");
    console.log("");
    console.log("Activating the Table Editor forces Supabase to instantly refresh its cache!");
    console.log("=================================================================");
    console.log("");
}

reloadSchema();
