'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Plus,
    Wallet,
    TrendingUp,
    TrendingDown,
    Download,
    IndianRupee,
    Loader2
} from "lucide-react"

export default function Financials() {
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;
    const [summary, setSummary] = useState({
        totalIncome: 0,
        totalExpense: 0,
        netProfit: 0
    });

    // Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        type: 'Expense',
        category: 'Feed & Fodder',
        amount: '',
        description: ''
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const expenseCategories = [
        "Feed & Fodder",
        "Veterinary & Medicine",
        "Labor & Wages",
        "Equipment Maintenance",
        "Utility Bills",
        "Livestock Purchase",
        "Other Expense"
    ];

    const incomeCategories = [
        "Milk Sales",
        "Livestock Sales",
        "Manure Sales",
        "Other Income"
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            if (formData.id) {
                const { error } = await supabase.from('accounting_transactions').update({
                    type: formData.type,
                    category: formData.category,
                    amount: Number(formData.amount) || 0,
                    description: formData.description || null
                }).eq('id', formData.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('accounting_transactions').insert([{
                    user_id: user.id,
                    type: formData.type,
                    category: formData.category,
                    amount: Number(formData.amount) || 0,
                    description: formData.description || null
                }]);
                if (error) throw error;
            }

            // Refresh data
            const { data, fetchError } = await supabase
                .from('accounting_transactions')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (!fetchError) {
                let income = 0;
                let expense = 0;
                data?.forEach(tx => {
                    const amt = Number(tx.amount);
                    if (tx.type === 'Income') income += amt;
                    if (tx.type === 'Expense') expense += amt;
                });
                setSummary({
                    totalIncome: income,
                    totalExpense: expense,
                    netProfit: income - expense
                });
                setTransactions(data || []);
            }

            setIsModalOpen(false);
            setFormData({ id: null, type: 'Expense', category: 'Feed & Fodder', amount: '', description: '' });
        } catch (err) {
            console.error("Error submitting:", err.message);
            alert("Failed to save entry: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        async function fetchFinancials() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data, error } = await supabase
                    .from('accounting_transactions')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                let income = 0;
                let expense = 0;

                data?.forEach(tx => {
                    const amt = Number(tx.amount);
                    if (tx.type === 'Income') income += amt;
                    if (tx.type === 'Expense') expense += amt;
                });

                setSummary({
                    totalIncome: income,
                    totalExpense: expense,
                    netProfit: income - expense
                });

                setTransactions(data || []);

            } catch (error) {
                console.error("Error fetching financial logs:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchFinancials();
    }, []);

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const filteredData = transactions.filter(row => {
        const matchesSearch = row.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (row.description && row.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesFilter = filterStatus === 'All' || row.type === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE) || 1;
    const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleFilterClick = () => {
        if (filterStatus === 'All') setFilterStatus('Income');
        else if (filterStatus === 'Income') setFilterStatus('Expense');
        else setFilterStatus('All');
        setCurrentPage(1);
    };

    const handleExport = () => {
        const headers = ['ID', 'Date', 'Type', 'Category', 'Amount', 'Description'];
        const csvContent = [
            headers.join(','),
            ...filteredData.map(row => [
                row.id,
                new Date(row.created_at).toLocaleString().replace(/,/g, ''),
                row.type || '',
                `"${(row.category || '').replace(/"/g, '""')}"`,
                row.amount || 0,
                `"${(row.description || '').replace(/"/g, '""')}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `financial_ledger_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const handleEdit = (row) => {
        setFormData({
            id: row.id,
            type: row.type || 'Income',
            category: row.category || 'Milk Sale',
            amount: row.amount ? row.amount.toString() : '',
            description: row.description || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this transaction?")) return;
        try {
            await supabase.from('accounting_transactions').delete().eq('id', id);
            setTransactions(prev => prev.filter(item => item.id !== id));

            // Note: In a robust version, we would also recalculate the summary here.
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">Financial Ledger</h1>
                    <p className="text-sm text-surface-500 mt-1">
                        Track income from milk, expenses on feed/cattle, and calculate ROI.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
                        <Download className="h-4 w-4" /> Export Ledger
                    </button>
                    <button onClick={() => {
                        setFormData({ id: null, type: 'Income', category: 'Milk Sale', amount: '', description: '' });
                        setIsModalOpen(true);
                    }} className="btn-primary flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Add Transaction
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="card p-6 border-t-4 border-t-green-500 bg-gradient-to-br from-white to-green-50/30">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-green-100 p-2.5 rounded-xl"><IndianRupee className="text-green-600 h-6 w-6" /></div>
                        <span className="flex items-center text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md">
                            <TrendingUp className="h-3 w-3 mr-1" /> All Time
                        </span>
                    </div>
                    <p className="text-sm font-medium text-surface-500">Total Income</p>
                    <h3 className="text-3xl font-bold text-surface-900 mt-1">₹ {summary.totalIncome.toLocaleString()}</h3>
                </div>

                <div className="card p-6 border-t-4 border-t-red-500 bg-gradient-to-br from-white to-red-50/30">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-red-100 p-2.5 rounded-xl"><Wallet className="text-red-600 h-6 w-6" /></div>
                        <span className="flex items-center text-sm font-medium text-red-600 bg-red-50 px-2 py-1 rounded-md">
                            <TrendingDown className="h-3 w-3 mr-1" /> All Time
                        </span>
                    </div>
                    <p className="text-sm font-medium text-surface-500">Total Expenses</p>
                    <h3 className="text-3xl font-bold text-surface-900 mt-1">₹ {summary.totalExpense.toLocaleString()}</h3>
                </div>

                <div className="card p-6 border-t-4 border-t-primary-500 bg-primary-600 text-white relative overflow-hidden">
                    <div className="absolute -right-4 -top-8 opacity-10">
                        <IndianRupee className="h-32 w-32" />
                    </div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm"><IndianRupee className="text-white h-6 w-6" /></div>
                    </div>
                    <p className="text-sm font-medium text-primary-100 relative z-10">Net Profit</p>
                    <h3 className="text-3xl font-bold text-white mt-1 relative z-10">₹ {summary.netProfit.toLocaleString()}</h3>
                </div>
            </div>

            {/* Ledger Table */}
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
                            placeholder="Search by ID or Description..."
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
                                <th scope="col" className="px-6 py-4 font-semibold">Transaction ID</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Date</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Category</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Description</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Type</th>
                                <th scope="col" className="px-6 py-4 font-semibold text-right">Amount</th>
                                <th scope="col" className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-surface-500">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary-600" />
                                        Loading ledger...
                                    </td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-surface-500">
                                        No accounting logs yet.
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((row) => (
                                    <tr key={row.id} className="bg-white border-b border-surface-100 hover:bg-surface-50/80 transition-colors">
                                        <td className="px-6 py-4 font-medium text-surface-900 whitespace-nowrap">{row.id.substring(0, 8).toUpperCase()}</td>
                                        <td className="px-6 py-4 text-surface-500 whitespace-nowrap">{formatDateTime(row.created_at)}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-surface-100 text-surface-700">
                                                {row.category || 'General'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-surface-800 truncate max-w-[200px]">{row.description || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${row.type === 'Income'
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : 'bg-red-50 text-red-700 border-red-200'
                                                }`}>
                                                {row.type}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 text-right font-bold whitespace-nowrap ${row.type === 'Income' ? 'text-green-600' : 'text-red-600'}`}>
                                            {row.type === 'Income' ? '+' : '-'}₹ {Number(row.amount).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
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
                            <button type="button" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border border-surface-200 rounded-lg hover:bg-surface-100 disabled:opacity-50">Prev</button>
                            <button type="button" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border border-surface-200 rounded-lg hover:bg-surface-100 disabled:opacity-50">Next</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Entry Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-surface-200 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-surface-900">Log New Transaction</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-surface-400 hover:text-surface-600">
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-surface-700 mb-1">Type</label>
                                    <select name="type" value={formData.type} onChange={(e) => {
                                        const newType = e.target.value;
                                        setFormData({
                                            ...formData,
                                            type: newType,
                                            category: newType === 'Income' ? incomeCategories[0] : expenseCategories[0]
                                        });
                                    }} className="input-field cursor-pointer">
                                        <option value="Expense">Expense (Money Out)</option>
                                        <option value="Income">Income (Money In)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-surface-700 mb-1">Amount (₹) *</label>
                                    <input required type="number" step="0.01" name="amount" value={formData.amount} onChange={handleInputChange} className="input-field border-surface-300" placeholder="0.00" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-surface-700 mb-1">Category</label>
                                <select name="category" value={formData.category} onChange={handleInputChange} className="input-field cursor-pointer">
                                    {(formData.type === 'Income' ? incomeCategories : expenseCategories).map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-surface-700 mb-1">Description (Optional)</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} rows={2} className="input-field border-surface-300" placeholder="What was this for?" />
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-surface-100 mt-6 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-2">
                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Transaction"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
