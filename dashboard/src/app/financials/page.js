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
    const [summary, setSummary] = useState({
        totalIncome: 0,
        totalExpense: 0,
        netProfit: 0
    });

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
                    <button className="btn-secondary flex items-center gap-2">
                        <Download className="h-4 w-4" /> Export Ledger
                    </button>
                    <button className="btn-primary flex items-center gap-2">
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
                <div className="p-4 border-b border-surface-200">
                    <h2 className="text-lg font-semibold text-surface-900">Transaction Ledger</h2>
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
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-surface-500">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary-600" />
                                        Loading ledger...
                                    </td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-surface-500">
                                        No accounting logs yet.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((row) => (
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
