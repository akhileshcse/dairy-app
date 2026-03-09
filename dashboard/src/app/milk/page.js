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
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        type: 'Cow',
        source_destination: 'Collection',
        shift: 'Morning',
        volume: '',
        rate_per_litre: '',
        fat: '',
        snf: ''
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            if (formData.id) {
                const { error } = await supabase.from('milk_logs').update({
                    type: formData.type,
                    source_destination: formData.source_destination,
                    shift: formData.shift,
                    volume: Number(formData.volume),
                    rate_per_litre: formData.rate_per_litre ? Number(formData.rate_per_litre) : null,
                    fat: formData.fat ? Number(formData.fat) : null,
                    snf: formData.snf ? Number(formData.snf) : null
                }).eq('id', formData.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('milk_logs').insert([{
                    user_id: user.id,
                    type: formData.type,
                    source_destination: formData.source_destination,
                    shift: formData.shift,
                    volume: Number(formData.volume),
                    rate_per_litre: formData.rate_per_litre ? Number(formData.rate_per_litre) : null,
                    fat: formData.fat ? Number(formData.fat) : null,
                    snf: formData.snf ? Number(formData.snf) : null
                }]);
                if (error) throw error;
            }

            // Refresh data
            const { data, fetchError } = await supabase
                .from('milk_logs')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            if (!fetchError) setCollectionData(data || []);

            setIsModalOpen(false);
            setFormData({ type: 'Cow', source_destination: 'Collection', shift: 'Morning', volume: '', rate_per_litre: '', fat: '', snf: '' });
        } catch (err) {
            console.error("Error submitting:", err.message);
            alert("Failed to save entry: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

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

    const filteredData = collectionData.filter(row => {
        const matchesSearch = row.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (row.type && row.type.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesFilter = filterStatus === 'All' || row.source_destination === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE) || 1;
    const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleFilterClick = () => {
        if (filterStatus === 'All') setFilterStatus('Collection');
        else if (filterStatus === 'Collection') setFilterStatus('Dispatch');
        else setFilterStatus('All');
        setCurrentPage(1);
    };

    const handleExport = () => {
        const headers = ['ID', 'Date', 'Shift', 'Livestock Type', 'Volume', 'Rate/Litre', 'Fat %', 'SNF %', 'Status'];
        const csvContent = [
            headers.join(','),
            ...filteredData.map(row => [
                row.id,
                new Date(row.created_at).toLocaleString().replace(/,/g, ''),
                row.shift || '',
                row.type || '',
                row.volume || 0,
                row.rate_per_litre || '',
                row.fat || '',
                row.snf || '',
                row.source_destination || ''
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `milk_logs_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const handleEdit = (row) => {
        setFormData({
            id: row.id,
            type: row.type || 'Cow',
            source_destination: row.source_destination || 'Collection',
            shift: row.shift || 'Morning',
            volume: row.volume ? row.volume.toString() : '',
            rate_per_litre: row.rate_per_litre ? row.rate_per_litre.toString() : '',
            fat: row.fat ? row.fat.toString() : '',
            snf: row.snf ? row.snf.toString() : ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this record?")) return;
        try {
            await supabase.from('milk_logs').delete().eq('id', id);
            setCollectionData(prev => prev.filter(item => item.id !== id));
        } catch (err) {
            console.error(err);
        }
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
                    <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
                        <Download className="h-4 w-4" /> Export
                    </button>
                    <button onClick={() => {
                        setFormData({ type: 'Cow', source_destination: 'Collection', shift: 'Morning', volume: '', rate_per_litre: '', fat: '', snf: '' });
                        setIsModalOpen(true);
                    }} className="btn-primary flex items-center gap-2">
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
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="input-field pl-10"
                            placeholder="Search by ID or Type..."
                        />
                    </div>
                    <button onClick={handleFilterClick} className="btn-secondary flex items-center gap-2 text-surface-600 bg-white shadow-sm border-surface-200">
                        <Filter className="h-4 w-4" /> Filter: {filterStatus}
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-surface-600">
                        <thead className="text-xs text-surface-500 uppercase bg-surface-50 border-b border-surface-200">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-semibold">ID</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Date & Time</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Shift</th>
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
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-8 text-center text-surface-500">
                                        No milk collection records found.
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((row) => (
                                    <tr key={row.id} className="bg-white border-b border-surface-100 hover:bg-surface-50/80 transition-colors">
                                        <td className="px-6 py-4 font-medium text-surface-900 whitespace-nowrap">
                                            {row.id.substring(0, 8).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4">{formatDateTime(row.created_at)}</td>
                                        <td className="px-6 py-4 font-medium text-surface-600">{row.shift || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.type?.toLowerCase() === 'cow' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                                }`}>
                                                {row.type || 'Cow'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-surface-900">
                                            {row.volume || '0'} L
                                            {row.rate_per_litre && <span className="block text-xs font-normal text-surface-500 mt-0.5">₹{row.rate_per_litre}/L</span>}
                                        </td>
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
                                            <button onClick={() => handleEdit(row)} className="font-medium text-primary-600 hover:text-primary-800 transition-colors mr-3">
                                                Edit
                                            </button>
                                            <button onClick={() => handleDelete(row.id)} className="font-medium text-red-600 hover:text-red-800 transition-colors">
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && filteredData.length > 0 && (
                    <div className="p-4 border-t border-surface-200 flex items-center justify-between text-sm text-surface-500 bg-surface-50/50">
                        <span>Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} of {filteredData.length} entries</span>
                        <div className="flex gap-1">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border border-surface-200 rounded-lg hover:bg-surface-100 disabled:opacity-50">Prev</button>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border border-surface-200 rounded-lg hover:bg-surface-100 disabled:opacity-50">Next</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Entry Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-surface-200 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-surface-900">Log Milk Activity</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-surface-400 hover:text-surface-600">
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-surface-700 mb-1">Livestock Type</label>
                                    <select name="type" value={formData.type} onChange={handleInputChange} className="input-field cursor-pointer">
                                        <option value="Cow">Cow</option>
                                        <option value="Buffalo">Buffalo</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-surface-700 mb-1">Activity</label>
                                    <select name="source_destination" value={formData.source_destination} onChange={handleInputChange} className="input-field cursor-pointer">
                                        <option value="Collection">Collection</option>
                                        <option value="Dispatch">Dispatch</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-surface-700 mb-1">Shift</label>
                                    <select name="shift" value={formData.shift} onChange={handleInputChange} className="input-field cursor-pointer">
                                        <option value="Morning">Morning</option>
                                        <option value="Evening">Evening</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-surface-700 mb-1">Rate per Litre (₹)</label>
                                    <input type="number" step="0.5" name="rate_per_litre" value={formData.rate_per_litre} onChange={handleInputChange} className="input-field border-surface-300" placeholder="e.g. 52.5" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-surface-700 mb-1">Volume (Liters) *</label>
                                <input required type="number" step="0.1" name="volume" value={formData.volume} onChange={handleInputChange} className="input-field border-surface-300" placeholder="e.g. 150" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-surface-700 mb-1">Fat % (Optional)</label>
                                    <input type="number" step="0.1" name="fat" value={formData.fat} onChange={handleInputChange} className="input-field border-surface-300" placeholder="e.g. 4.5" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-surface-700 mb-1">SNF % (Optional)</label>
                                    <input type="number" step="0.1" name="snf" value={formData.snf} onChange={handleInputChange} className="input-field border-surface-300" placeholder="e.g. 8.5" />
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-2">
                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Entry"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
