'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Droplets,
    Plus,
    Filter,
    Download,
    Search,
    Loader2
} from "lucide-react"

export default function MilkOperations() {
    const [loading, setLoading] = useState(true);
    const [collectionData, setCollectionData] = useState([]);

    useEffect(() => {
        async function fetchMilkLogs() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data, error } = await supabase
                    .from('milk_logs')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setCollectionData(data || []);
            } catch (error) {
                console.error("Error fetching milk logs:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchMilkLogs();
    }, []);

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">Milk Operations</h1>
                    <p className="text-sm text-surface-500 mt-1">
                        Manage daily collections, dispatches, and quality metrics.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="btn-secondary flex items-center gap-2">
                        <Download className="h-4 w-4" /> Export
                    </button>
                    <button className="btn-primary flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Log Collection
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="p-4 border-b border-surface-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-50/50">
                    <div className="relative w-full sm:max-w-xs">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-surface-400" />
                        </div>
                        <input
                            type="text"
                            className="input-field pl-10"
                            placeholder="Search by ID or Type..."
                        />
                    </div>
                    <button className="btn-secondary flex items-center gap-2 text-surface-600 bg-white shadow-sm border-surface-200">
                        <Filter className="h-4 w-4" /> Filter Records
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-surface-600">
                        <thead className="text-xs text-surface-500 uppercase bg-surface-50 border-b border-surface-200">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-semibold">ID</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Date & Time</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Livestock Type</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Volume</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Fat / SNF</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Status</th>
                                <th scope="col" className="px-6 py-4 font-semibold text-right">Actions</th>
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
                            ) : collectionData.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-surface-500">
                                        No milk collection records found.
                                    </td>
                                </tr>
                            ) : (
                                collectionData.map((row) => (
                                    <tr key={row.id} className="bg-white border-b border-surface-100 hover:bg-surface-50/80 transition-colors">
                                        <td className="px-6 py-4 font-medium text-surface-900 whitespace-nowrap">
                                            {row.id.substring(0, 8).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4">{formatDateTime(row.created_at)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.type?.toLowerCase() === 'cow' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                                }`}>
                                                {row.type || 'Cow'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-surface-900">{row.volume || '0'} L</td>
                                        <td className="px-6 py-4 text-surface-500">
                                            {row.fat || '-'}% <span className="mx-1 text-surface-300">|</span> {row.snf || '-'}%
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${row.source_destination === 'Dispatch'
                                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                : 'bg-green-50 text-green-700 border-green-200'
                                                }`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${row.source_destination === 'Dispatch' ? 'bg-blue-500' : 'bg-green-500'
                                                    }`}></span>
                                                {row.source_destination || 'Collection'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="font-medium text-primary-600 hover:text-primary-800 transition-colors">
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && collectionData.length > 0 && (
                    <div className="p-4 border-t border-surface-200 flex items-center justify-between text-sm text-surface-500 bg-surface-50/50">
                        <span>Showing 1 to {collectionData.length} entries</span>
                        <div className="flex gap-1">
                            <button className="px-3 py-1 border border-surface-200 rounded-lg hover:bg-surface-100 disabled:opacity-50">Prev</button>
                            <button className="px-3 py-1 border border-surface-200 rounded-lg hover:bg-surface-100 disabled:opacity-50">Next</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
