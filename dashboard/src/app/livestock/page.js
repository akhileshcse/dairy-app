'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Activity,
    Plus,
    ArrowRight,
    Stethoscope,
    Loader2
} from "lucide-react"

export default function Livestock() {
    const [loading, setLoading] = useState(true);
    const [livestockData, setLivestockData] = useState([]);
    const [summary, setSummary] = useState({
        totalCows: 0,
        totalBufs: 0,
        milking: 0,
        dry: 0
    });

    useEffect(() => {
        async function fetchLivestock() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data, error } = await supabase
                    .from('livestock_logs')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setLivestockData(data || []);

                // Calculate summary stats from the LATEST log only for overview dashboard style
                // but for this roster we show logs as the roster for now.
                if (data && data.length > 0) {
                    const latest = data[0];
                    setSummary({
                        totalCows: (latest.cows_milking || 0) + (latest.cows_dry || 0) + (latest.cows_heifer || 0) + (latest.cows_calves || 0),
                        totalBufs: (latest.buffaloes_milking || 0) + (latest.buffaloes_dry || 0) + (latest.buffaloes_heifer || 0) + (latest.buffaloes_calves || 0),
                        milking: (latest.cows_milking || 0) + (latest.buffaloes_milking || 0),
                        dry: (latest.cows_dry || 0) + (latest.buffaloes_dry || 0)
                    });
                }
            } catch (error) {
                console.error("Error fetching livestock logs:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchLivestock();
    }, []);

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">Livestock Management</h1>
                    <p className="text-sm text-surface-500 mt-1">
                        Track cattle health, milking stages, and veterinary schedules.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="btn-secondary flex items-center gap-2">
                        <Stethoscope className="h-4 w-4" /> Add Health Log
                    </button>
                    <button className="btn-primary flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Register Update
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="card p-4 flex flex-col justify-center items-center text-center">
                    <p className="text-sm text-surface-500 font-medium mb-1">Total Cows</p>
                    <p className="text-3xl font-bold text-blue-600">{summary.totalCows}</p>
                </div>
                <div className="card p-4 flex flex-col justify-center items-center text-center">
                    <p className="text-sm text-surface-500 font-medium mb-1">Total Buffaloes</p>
                    <p className="text-3xl font-bold text-purple-600">{summary.totalBufs}</p>
                </div>
                <div className="card p-4 flex flex-col justify-center items-center text-center border-b-4 border-b-green-500">
                    <p className="text-sm text-surface-500 font-medium mb-1">Milking Active</p>
                    <p className="text-3xl font-bold text-surface-900">{summary.milking}</p>
                </div>
                <div className="card p-4 flex flex-col justify-center items-center text-center border-b-4 border-b-yellow-500">
                    <p className="text-sm text-surface-500 font-medium mb-1">Dry / Pregnant</p>
                    <p className="text-3xl font-bold text-surface-900">{summary.dry}</p>
                </div>
            </div>

            <div className="card">
                <div className="p-4 border-b border-surface-200">
                    <h2 className="text-lg font-semibold text-surface-900 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary-500" /> Animal Event Logs
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-surface-600">
                        <thead className="text-xs text-surface-500 uppercase bg-surface-50 border-b border-surface-200">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-semibold">Update ID</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Date</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Type</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Cow Stats (M/D/H/C)</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Buf Stats (M/D/H/C)</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Health Notes</th>
                                <th scope="col" className="px-6 py-4 font-semibold text-right">Profile</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-surface-500">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary-600" />
                                        Loading records...
                                    </td>
                                </tr>
                            ) : livestockData.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-surface-500">
                                        No livestock updates recorded yet.
                                    </td>
                                </tr>
                            ) : (
                                livestockData.map((row) => (
                                    <tr key={row.id} className="bg-white border-b border-surface-100 hover:bg-surface-50/80 transition-colors">
                                        <td className="px-6 py-4 font-medium text-surface-900 whitespace-nowrap">
                                            {row.id.substring(0, 8).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4">{formatDateTime(row.created_at)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-100 text-surface-800`}>
                                                {row.type || 'Count Update'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs">
                                            {row.cows_milking || 0}/{row.cows_dry || 0}/{row.cows_heifer || 0}/{row.cows_calves || 0}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs">
                                            {row.buffaloes_milking || 0}/{row.buffaloes_dry || 0}/{row.buffaloes_heifer || 0}/{row.buffaloes_calves || 0}
                                        </td>
                                        <td className="px-6 py-4 text-surface-500 max-w-xs truncate">
                                            {row.health_notes || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-surface-50 text-surface-500 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                                                <ArrowRight className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
