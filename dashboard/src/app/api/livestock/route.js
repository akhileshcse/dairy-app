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

    const { data: latestCount, error: countErr } = await supabase
        .from('livestock_logs')
        .select('*')
        .eq('type', 'count')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    const { data: healthLogs, error: healthErr } = await supabase
        .from('livestock_logs')
        .select('*')
        .eq('type', 'health')
        .order('created_at', { ascending: false });

    if (healthErr) {
        return NextResponse.json({ error: healthErr.message }, { status: 500 });
    }

    const counts = latestCount ? {
        cows: {
            milking: latestCount.cows_milking || 0,
            dry: latestCount.cows_dry || 0,
            heifer: latestCount.cows_heifer || 0,
            calves: latestCount.cows_calves || 0
        },
        buffaloes: {
            milking: latestCount.buffaloes_milking || 0,
            dry: latestCount.buffaloes_dry || 0,
            heifer: latestCount.buffaloes_heifer || 0,
            calves: latestCount.buffaloes_calves || 0
        }
    } : {
        cows: { milking: 0, dry: 0, heifer: 0, calves: 0 },
        buffaloes: { milking: 0, dry: 0, heifer: 0, calves: 0 },
    };

    return NextResponse.json({
        counts,
        healthLogs: healthLogs.map(l => ({
            id: l.id,
            date: l.created_at,
            animalId: l.animal_id,
            healthNotes: l.health_notes
        }))
    });
}

export async function POST(req) {
    try {
        const supabase = getAuthClient(req);
        if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();

        let insertData = { user_id: user.id, type: body.type };

        if (body.type === 'count' && body.counts) {
            insertData = {
                ...insertData,
                cows_milking: body.counts.cowMilking || 0,
                cows_dry: body.counts.cowDry || 0,
                cows_heifer: body.counts.cowHeifer || 0,
                cows_calves: body.counts.cowCalves || 0,
                buffaloes_milking: body.counts.buffaloMilking || 0,
                buffaloes_dry: body.counts.buffaloDry || 0,
                buffaloes_heifer: body.counts.buffaloHeifer || 0,
                buffaloes_calves: body.counts.buffaloCalves || 0,
            };
        } else if (body.type === 'health') {
            insertData = {
                ...insertData,
                animal_id: body.animalId,
                health_notes: body.healthNotes
            };
        }

        const { error } = await supabase
            .from('livestock_logs')
            .insert([insertData]);

        if (error) throw error;

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
        console.error("Supabase Livestock Insert Error:", error);
        return NextResponse.json({ error: 'Failed to process livestock update' }, { status: 500 });
    }
}
