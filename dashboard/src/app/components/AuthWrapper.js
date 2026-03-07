'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

export default function AuthWrapper({ children }) {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
            if (!session && pathname !== '/login') {
                router.push('/login');
            } else if (session && pathname === '/login') {
                router.push('/');
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (!session && pathname !== '/login') {
                router.push('/login');
            } else if (session && pathname === '/login') {
                router.push('/');
            }
        });

        return () => subscription.unsubscribe();
    }, [pathname, router]);

    if (loading) {
        return <div className="h-screen w-screen flex items-center justify-center bg-surface-50 text-surface-500">Loading Jamindar Dairy...</div>;
    }

    // Handle login page rendering
    if (pathname === '/login') {
        if (session) {
            return <div className="h-screen w-screen flex items-center justify-center bg-surface-50 text-surface-500">Redirecting to Jamindar Dairy...</div>;
        }
        return children;
    }

    // Render fully authenticated layout
    return (
        <div className="flex h-screen overflow-hidden bg-surface-50">
            <Sidebar />
            <main className="flex-1 overflow-y-auto px-8 py-8">
                <div className="mx-auto max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
