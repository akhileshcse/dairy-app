import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getAuthClient(req) {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return null;
    return createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false }
    });
}

export async function GET(req) {
    const supabase = getAuthClient(req);
    if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: milkLogs, error } = await supabase
        .from('milk_logs')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formattedData = milkLogs.map(log => ({
        id: log.id,
        date: log.created_at,
        type: log.type,
        volume: log.volume,
        source: log.source_destination,
        destination: log.source_destination,
        fat: log.fat,
        snf: log.snf
    }));

    return NextResponse.json(formattedData);
}

export async function POST(req) {
    try {
        const supabase = getAuthClient(req);
        if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Get user session to attach user_id explicitly
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();

        const insertData = {
            user_id: user.id,
            type: body.type,
            volume: body.volume,
            source_destination: body.source || body.destination,
            fat: body.fat,
            snf: body.snf
        };

        const { data, error } = await supabase
            .from('milk_logs')
            .insert([insertData])
            .select();

        if (error) throw error;

        return NextResponse.json({ success: true, log: data[0] }, { status: 201 });
    } catch (error) {
        console.error("Supabase Insert Error:", error);
        return NextResponse.json({ error: 'Failed to process milk log' }, { status: 500 });
    }
}
