import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { email, password, role } = await request.json();

        // Must use Service Role Key to bypass RLS and create users safely without logging out the admin
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || ''; // fallback checking if user placed it awkwardly

        if (!supabaseServiceKey) {
            return NextResponse.json({ error: "Server missing SUPABASE_SERVICE_ROLE_KEY in .env.local" }, { status: 500 });
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // 1. Create the user in Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto confirm so they can log in immediately
        });

        if (authError) throw authError;

        // 2. Add their role to the public.user_roles table
        const { error: roleError } = await supabaseAdmin.from('user_roles').insert([
            { user_id: authData.user.id, role: role || 'Data Entry' }
        ]);

        if (roleError) throw roleError;

        return NextResponse.json({ success: true, user: authData.user });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || '';

        if (!supabaseServiceKey) {
            return NextResponse.json({ error: "Server missing SUPABASE_SERVICE_ROLE_KEY in .env.local" }, { status: 500 });
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        });

        // Provide list of all auth users
        const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
        if (authError) throw authError;

        // Fetch their assigned roles from our table
        const { data: rolesData, error: rolesError } = await supabaseAdmin.from('user_roles').select('*');
        if (rolesError) throw rolesError;

        // Merge to present in the dashboard UI
        const mergedUsers = users.map(u => {
            const match = rolesData?.find(r => r.user_id === u.id);
            return {
                id: u.id,
                email: u.email,
                role: match?.role || 'Admin / Owner', // The initial user may lack a row in user_roles
                created_at: u.created_at
            }
        });

        return NextResponse.json({ users: mergedUsers });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}
