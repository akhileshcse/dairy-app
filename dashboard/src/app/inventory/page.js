'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Wheat,
    Plus,
    AlertOctagon,
    CheckCircle2,
    PackageOpen,
    Loader2
} from "lucide-react"

export default function Inventory() {
    const [loading, setLoading] = useState(true);
    const [inventoryData, setInventoryData] = useState([]);
    const [summary, setSummary] = useState({
        totalItems: 0,
        lowStock: 0,
        healthy: 0
    });

    // Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        feed_type: 'Cotton Seed Cake',
        type: 'Add_Stock',
        amount: ''
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const feedOptions = [
        "Cotton Seed Cake",
        "Mustard Cake",
        "Wheat Bran",
        "Maize",
        "Mineral Mixture",
        "Green Fodder",
        "Dry Fodder (Bhusa)"
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { error } = await supabase.from('inventory_logs').insert([{
                user_id: user.id,
                feed_type: formData.feed_type,
                type: formData.type,
                amount: Number(formData.amount) || 0
            }]);

            if (error) throw error;

            // Refresh data
            const { data, fetchError } = await supabase
                .from('inventory_logs')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (!fetchError) {
                // Recalculate stock
                const stockMap = {};
                data?.forEach(log => {
                    if (!log.feed_type) return;
                    if (!stockMap[log.feed_type]) stockMap[log.feed_type] = { name: log.feed_type, currentStock: 0, category: log.type === 'Add_Stock' || log.type === 'Consume_Stock' ? 'Feed' : 'Other' };

                    if (log.type === 'Add_Stock') stockMap[log.feed_type].currentStock += Number(log.amount);
                    if (log.type === 'Consume_Stock') stockMap[log.feed_type].currentStock -= Number(log.amount);
                });

                const processedInventory = Object.values(stockMap).map(item => ({
                    ...item,
                    id: `INV-${item.name.substring(0, 3).toUpperCase()}`,
                    status: item.currentStock < 100 ? 'Low Stock' : 'Healthy',
                    threshold: '100 kg'
                }));

                setSummary({
                    totalItems: processedInventory.length,
                    lowStock: processedInventory.filter(i => i.status === 'Low Stock').length,
                    healthy: processedInventory.filter(i => i.status === 'Healthy').length,
                });
                setInventoryData(processedInventory);
            }

            setIsModalOpen(false);
            setFormData({ feed_type: 'Cotton Seed Cake', type: 'Add_Stock', amount: '' });
        } catch (err) {
            console.error("Error submitting:", err.message);
            alert("Failed to save entry: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        async function fetchInventory() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data, error } = await supabase
                    .from('inventory_logs')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                // Calculate current stock levels per feed type
                const stockMap = {};
                data?.forEach(log => {
                    if (!log.feed_type) return;
                    if (!stockMap[log.feed_type]) stockMap[log.feed_type] = { name: log.feed_type, currentStock: 0, category: log.type === 'Add_Stock' || log.type === 'Consume_Stock' ? 'Feed' : 'Other' };

                    if (log.type === 'Add_Stock') stockMap[log.feed_type].currentStock += Number(log.amount);
                    if (log.type === 'Consume_Stock') stockMap[log.feed_type].currentStock -= Number(log.amount);
                });

                const processedInventory = Object.values(stockMap).map(item => ({
                    ...item,
                    id: `INV-${item.name.substring(0, 3).toUpperCase()}`,
                    status: item.currentStock < 100 ? 'Low Stock' : 'Healthy',
                    threshold: '100 kg' // Static for now, can be dynamic later
                }));

                const low = processedInventory.filter(i => i.status === 'Low Stock').length;
                const healthy = processedInventory.filter(i => i.status === 'Healthy').length;

                setSummary({
                    totalItems: processedInventory.length,
                    lowStock: low,
                    healthy: healthy,
                });

                setInventoryData(processedInventory);

            } catch (error) {
                console.error("Error fetching inventory logs:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchInventory();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">Inventory Management</h1>
                    <p className="text-sm text-surface-500 mt-1">
                        Track feed stock, medical supplies, and farm equipment.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Add Item Log
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="card p-5 border-l-4 border-l-primary-500 flex items-center gap-4">
                    <div className="bg-primary-50 p-3 rounded-xl"><PackageOpen className="text-primary-600 h-6 w-6" /></div>
                    <div>
                        <p className="text-sm text-surface-500 font-medium">Unique Items</p>
                        <p className="text-2xl font-bold text-surface-900">{summary.totalItems}</p>
                    </div>
                </div>
                <div className="card p-5 border-l-4 border-l-yellow-500 flex items-center gap-4">
                    <div className="bg-yellow-50 p-3 rounded-xl"><AlertOctagon className="text-yellow-600 h-6 w-6" /></div>
                    <div>
                        <p className="text-sm text-surface-500 font-medium">Low Stock Alerts</p>
                        <p className="text-2xl font-bold text-surface-900">{summary.lowStock}</p>
                    </div>
                </div>
                <div className="card p-5 border-l-4 border-l-green-500 flex items-center gap-4">
                    <div className="bg-green-50 p-3 rounded-xl"><CheckCircle2 className="text-green-600 h-6 w-6" /></div>
                    <div>
                        <p className="text-sm text-surface-500 font-medium">Healthy Stock</p>
                        <p className="text-2xl font-bold text-surface-900">{summary.healthy}</p>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-surface-600">
                        <thead className="text-xs text-surface-500 uppercase bg-surface-50 border-b border-surface-200">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-semibold">Item Name</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Category</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Current Stock</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Alert Threshold</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Status</th>
                                <th scope="col" className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-surface-500">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary-600" />
                                        Loading inventory state...
                                    </td>
                                </tr>
                            ) : inventoryData.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-surface-500">
                                        No inventory stock items tracked yet.
                                    </td>
                                </tr>
                            ) : (
                                inventoryData.map((row) => (
                                    <tr key={row.name} className="bg-white border-b border-surface-100 hover:bg-surface-50/80 transition-colors">
                                        <td className="px-6 py-4 font-medium text-surface-900">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-surface-100 flex items-center justify-center">
                                                    <Wheat className="h-4 w-4 text-surface-500" />
                                                </div>
                                                {row.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-surface-100 text-surface-700">
                                                {row.category}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 font-semibold ${row.status === 'Low Stock' ? 'text-yellow-600' : 'text-surface-900'}`}>{row.currentStock} Units</td>
                                        <td className="px-6 py-4 text-surface-500">{row.threshold}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${row.status === 'Healthy'
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : 'bg-yellow-50 text-yellow-700 border-yellow-200 animate-pulse'
                                                }`}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-3">
                                            <button className="font-medium text-surface-500 hover:text-primary-600 transition-colors">Log Update</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Entry Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-surface-200 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-surface-900">Log Inventory Update</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-surface-400 hover:text-surface-600">
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-surface-700 mb-1">Item Category</label>
                                <select name="feed_type" value={formData.feed_type} onChange={handleInputChange} className="input-field cursor-pointer">
                                    {feedOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-surface-700 mb-1">Update Type</label>
                                    <select name="type" value={formData.type} onChange={handleInputChange} className="input-field cursor-pointer">
                                        <option value="Add_Stock">Add Stock (Receive)</option>
                                        <option value="Consume_Stock">Consume Stock (Use)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-surface-700 mb-1">Amount (kg) *</label>
                                    <input required type="number" step="1" name="amount" value={formData.amount} onChange={handleInputChange} className="input-field border-surface-300" placeholder="e.g. 50" />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-surface-100 mt-6 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-2">
                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Register"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
