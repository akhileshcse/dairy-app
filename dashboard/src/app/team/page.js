'use client';

import { useEffect, useState } from 'react';
import {
    Users,
    UserPlus,
    Shield,
    Database,
    LineChart,
    Loader2,
    Mail,
    Lock
} from "lucide-react"

export default function TeamManagement() {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'Data Entry'
    });

    const fetchTeam = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const res = await fetch('/api/users');
            const result = await res.json();

            if (!res.ok) {
                if (result.error && result.error.includes("SUPABASE_SERVICE_ROLE_KEY")) {
                    setErrorMsg("Server missing SUPABASE_SERVICE_ROLE_KEY in .env.local! To view and manage users, you must add your Supabase Service Key to the .env.local file.");
                } else {
                    setErrorMsg(result.error || "Failed to load team");
                }
            } else {
                setUsers(result.users || []);
            }
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeam();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMsg('');

        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await res.json();

            if (!res.ok) throw new Error(result.error || "Failed to create user");

            setIsModalOpen(false);
            setFormData({ email: '', password: '', role: 'Data Entry' });

            // Reload table
            fetchTeam();
            alert("Team member added successfully!");
        } catch (err) {
            setErrorMsg(err.message);
            alert("Error: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getRoleIcon = (role) => {
        if (role?.includes('Admin')) return <Shield className="h-4 w-4 text-purple-600" />;
        if (role === 'Accounting') return <LineChart className="h-4 w-4 text-green-600" />;
        return <Database className="h-4 w-4 text-blue-600" />; // General Data Entry
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">Team & Roles</h1>
                    <p className="text-sm text-surface-500 mt-1">
                        Securely manage access for accounting and specialized data entry workers.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
                        <UserPlus className="h-4 w-4" /> Add Member
                    </button>
                </div>
            </div>

            {errorMsg && errorMsg.includes(".env.local") && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl shadow-sm text-sm font-medium flex items-start gap-3">
                    <Shield className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
                    <p>{errorMsg}</p>
                </div>
            )}

            <div className="card">
                <div className="p-4 border-b border-surface-200">
                    <h2 className="text-lg font-semibold text-surface-900 flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary-500" /> Active Personnel
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-surface-600">
                        <thead className="text-xs text-surface-500 uppercase bg-surface-50 border-b border-surface-200">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-semibold">User Email / Login ID</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Access Level</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Date Joined</th>
                                <th scope="col" className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-surface-500">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary-600" />
                                        Fetching system users...
                                    </td>
                                </tr>
                            ) : users.length === 0 && !errorMsg ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-surface-500">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="bg-white border-b border-surface-100 hover:bg-surface-50/80 transition-colors">
                                        <td className="px-6 py-4 font-medium text-surface-900 border-l-4 border-l-transparent hover:border-l-primary-500">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                                                ${user.role?.includes('Admin') ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                                                    user.role === 'Accounting' ? 'bg-green-50 text-green-700 border border-green-200' :
                                                        'bg-blue-50 text-blue-700 border border-blue-200'
                                                }`}>
                                                {getRoleIcon(user.role)} {user.role || 'Data Entry'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-surface-500">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="font-medium text-surface-400 hover:text-primary-600 transition-colors">Manage</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 hover:cursor-pointer" onClick={(e) => {
                    if (e.target === e.currentTarget) setIsModalOpen(false);
                }}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden cursor-auto transform transition-all">
                        <div className="px-6 py-5 border-b border-surface-200 flex justify-between items-center bg-gradient-to-r from-surface-50 to-white">
                            <div>
                                <h2 className="text-lg font-bold text-surface-900">Register Team Member</h2>
                                <p className="text-xs text-surface-500 mt-1">Provide login credentials for your farm staff.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-surface-400 hover:bg-surface-100 hover:text-surface-600 h-8 w-8 rounded-full flex items-center justify-center transition-colors">
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleInvite} className="p-6 space-y-5 bg-white">
                            <div>
                                <label className="block text-sm font-semibold text-surface-700 mb-1">Email / Username ID</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-4 w-4 text-surface-400" />
                                    </div>
                                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="input-field pl-10 border-surface-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500/20" placeholder="e.g. account@dairy.com" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-surface-700 mb-1">Temporary Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4 text-surface-400" />
                                    </div>
                                    <input required type="password" minLength={6} name="password" value={formData.password} onChange={handleInputChange} className="input-field pl-10 border-surface-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500/20" placeholder="••••••••" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-surface-700 mb-2">Assign Role Permission</label>
                                <div className="space-y-2">
                                    <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${formData.role === 'Admin / Owner' ? 'bg-purple-50 border-purple-200' : 'border-surface-200 hover:bg-surface-50'}`}>
                                        <input type="radio" name="role" value="Admin / Owner" checked={formData.role === 'Admin / Owner'} onChange={handleInputChange} className="mt-1 flex-shrink-0 text-purple-600 focus:ring-purple-500" />
                                        <div>
                                            <p className={`text-sm font-bold ${formData.role === 'Admin / Owner' ? 'text-purple-900' : 'text-surface-900'}`}>Admin / Owner</p>
                                            <p className="text-xs text-surface-500">Unrestricted access to view, edit, and delete all logs.</p>
                                        </div>
                                    </label>

                                    <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${formData.role === 'Accounting' ? 'bg-green-50 border-green-200' : 'border-surface-200 hover:bg-surface-50'}`}>
                                        <input type="radio" name="role" value="Accounting" checked={formData.role === 'Accounting'} onChange={handleInputChange} className="mt-1 flex-shrink-0 text-green-600 focus:ring-green-500" />
                                        <div>
                                            <p className={`text-sm font-bold ${formData.role === 'Accounting' ? 'text-green-900' : 'text-surface-900'}`}>Accounting</p>
                                            <p className="text-xs text-surface-500">Dedicated access to update Financials and Transactions.</p>
                                        </div>
                                    </label>

                                    <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${formData.role === 'Data Entry' ? 'bg-blue-50 border-blue-200' : 'border-surface-200 hover:bg-surface-50'}`}>
                                        <input type="radio" name="role" value="Data Entry" checked={formData.role === 'Data Entry'} onChange={handleInputChange} className="mt-1 flex-shrink-0 text-blue-600 focus:ring-blue-500" />
                                        <div>
                                            <p className={`text-sm font-bold ${formData.role === 'Data Entry' ? 'text-blue-900' : 'text-surface-900'}`}>Data Entry (Milk/Livestock/Inventory)</p>
                                            <p className="text-xs text-surface-500">General worker adding daily volume or dispatch counts.</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-surface-600 bg-white border border-surface-300 rounded-lg hover:bg-surface-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting} className="btn-primary flex justify-center items-center gap-2 min-w-[120px]">
                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
