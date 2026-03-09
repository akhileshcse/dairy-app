import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Users, Droplets, Wheat, TrendingUp, LogOut } from 'lucide-react-native';
import { supabase } from '../utils/supabase';

export default function HomeScreen({ navigation }) {
    const [stats, setStats] = useState({
        totalCollection: 0,
        activeLivestock: 0,
        revenueToday: 0,
        feedStock: 'Normal'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        async function fetchDashboardData() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const todayStr = today.toISOString();

                // 1. Total Collection Today
                const { data: milkData } = await supabase
                    .from('milk_logs')
                    .select('volume')
                    .eq('user_id', user.id)
                    .eq('type', 'Collection')
                    .gte('created_at', todayStr);

                const totalVolume = milkData?.reduce((sum, log) => sum + Number(log.volume), 0) || 0;

                // 2. Active Livestock
                const { data: livestockData } = await supabase
                    .from('livestock_logs')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(1);

                let activeLivestock = 0;
                if (livestockData && livestockData.length > 0) {
                    const latest = livestockData[0];
                    activeLivestock = (latest.cows_milking || 0) + (latest.cows_dry || 0) + (latest.cows_heifer || 0) + (latest.cows_calves || 0) +
                        (latest.buffaloes_milking || 0) + (latest.buffaloes_dry || 0) + (latest.buffaloes_heifer || 0) + (latest.buffaloes_calves || 0);
                }

                // 3. Revenue Today
                const { data: revData } = await supabase
                    .from('accounting_transactions')
                    .select('amount')
                    .eq('user_id', user.id)
                    .eq('type', 'Income')
                    .gte('created_at', todayStr);

                const totalRevenue = revData?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;

                // 4. Feed Stock Level
                const { data: invData } = await supabase
                    .from('inventory_logs')
                    .select('type, amount')
                    .eq('user_id', user.id);

                let currentStock = 0;
                invData?.forEach(log => {
                    if (log.type === 'Add_Stock') currentStock += Number(log.amount);
                    if (log.type === 'Consume_Stock') currentStock -= Number(log.amount);
                });

                let feedStockStatus = 'Normal';
                if (currentStock <= 0) feedStockStatus = 'Empty';
                else if (currentStock < 100) feedStockStatus = 'Low';

                if (isMounted) {
                    setStats({
                        totalCollection: totalVolume,
                        activeLivestock: activeLivestock,
                        revenueToday: totalRevenue,
                        feedStock: feedStockStatus
                    });
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchDashboardData();

        const unsubscribe = navigation.addListener('focus', () => {
            fetchDashboardData();
        });

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, [navigation]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Daily Overview</Text>
                    <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <LogOut color="#fff" size={20} />
                </TouchableOpacity>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <View style={styles.statIconContainer}>
                        <Droplets color="#2563eb" size={24} />
                    </View>
                    {loading ? <ActivityIndicator size="small" color="#2563eb" /> : <Text style={styles.statValue}>{stats.totalCollection} L</Text>}
                    <Text style={styles.statLabel}>Total Milk Today</Text>
                </View>
                <View style={styles.statCard}>
                    <View style={styles.statIconContainer}>
                        <Users color="#2563eb" size={24} />
                    </View>
                    {loading ? <ActivityIndicator size="small" color="#2563eb" /> : <Text style={styles.statValue}>{stats.activeLivestock}</Text>}
                    <Text style={styles.statLabel}>Active Livestock</Text>
                </View>
                <View style={styles.statCard}>
                    <View style={styles.statIconContainer}>
                        <TrendingUp color="#2563eb" size={24} />
                    </View>
                    {loading ? <ActivityIndicator size="small" color="#2563eb" /> : <Text style={styles.statValue}>₹ {stats.revenueToday.toLocaleString()}</Text>}
                    <Text style={styles.statLabel}>Revenue Est.</Text>
                </View>
                <View style={styles.statCard}>
                    <View style={styles.statIconContainer}>
                        <Wheat color="#2563eb" size={24} />
                    </View>
                    {loading ? <ActivityIndicator size="small" color="#2563eb" /> : <Text style={styles.statValue}>{stats.feedStock}</Text>}
                    <Text style={styles.statLabel}>Feed Stock Left</Text>
                </View>
            </View>

            <View style={styles.quickActionsContainer}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionGrid}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Milk')}>
                        <Droplets color="#1f2937" size={24} />
                        <Text style={styles.actionText}>Log Milk</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Livestock')}>
                        <Users color="#1f2937" size={24} />
                        <Text style={styles.actionText}>Update Animals</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Inventory')}>
                        <Wheat color="#1f2937" size={24} />
                        <Text style={styles.actionText}>Add Feed</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#2563eb', // blue-600
        paddingBottom: 40,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    date: {
        fontSize: 14,
        color: '#bfdbfe', // blue-200
        marginTop: 4,
    },
    logoutButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 8,
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginTop: -20,
    },
    statCard: {
        width: '48%',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    statIconContainer: {
        backgroundColor: '#eff6ff', // blue-50
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827', // gray-900
    },
    statLabel: {
        fontSize: 12,
        color: '#6b7280', // gray-500
        marginTop: 4,
    },
    quickActionsContainer: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16,
    },
    actionGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        alignItems: 'center',
        backgroundColor: '#ffffff',
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 16,
        width: '30%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    actionText: {
        marginTop: 8,
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
    },
});
