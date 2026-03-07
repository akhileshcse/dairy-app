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

    const { data: inventoryLogs, error } = await supabase
        .from('inventory_logs')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formattedData = inventoryLogs.map(log => ({
        id: log.id,
        date: log.created_at,
        type: log.type,
        feedType: log.feed_type,
        amount: log.amount,
        notes: log.notes
    }));

    return NextResponse.json(formattedData);
}

export async function POST(req) {
    try {
        const supabase = getAuthClient(req);
        if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();

        const insertData = {
            user_id: user.id,
            type: body.type,
            feed_type: body.feedType,
            amount: body.amount,
            notes: body.notes
        };

        const { data, error } = await supabase
            .from('inventory_logs')
            .insert([insertData])
            .select();

        if (error) throw error;

        return NextResponse.json({ success: true, log: data[0] }, { status: 201 });
    } catch (error) {
        console.error("Supabase Inventory Insert Error:", error);
        return NextResponse.json({ error: 'Failed to process inventory log' }, { status: 500 });
    }
}
