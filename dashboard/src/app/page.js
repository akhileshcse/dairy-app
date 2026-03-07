'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  ArrowUpRight,
  ArrowDownRight,
  Droplets,
  Activity,
  Wheat,
  IndianRupee,
  Loader2
} from "lucide-react"

import CollectionChart from './components/CollectionChart'

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCollection: 0,
    activeLivestock: 0,
    revenueToday: 0,
    feedStock: 'Normal'
  });
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
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

        setStats({
          totalCollection: totalVolume,
          activeLivestock: activeLivestock,
          revenueToday: totalRevenue,
          feedStock: feedStockStatus
        });

        // Fetch recent transactions (Using recent milk logs for the "Recent Collections" UI)
        const { data: recentLogs } = await supabase
          .from('milk_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentTransactions(recentLogs || []);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const displayStats = [
    {
      name: "Total Collection Today",
      value: `${stats.totalCollection} L`,
      change: "Live",
      trend: "up",
      icon: Droplets,
    },
    {
      name: "Active Livestock",
      value: stats.activeLivestock.toString(),
      change: "Live",
      trend: "neutral",
      icon: Activity,
    },
    {
      name: "Revenue Today",
      value: `₹ ${stats.revenueToday}`,
      change: "Live",
      trend: "up",
      icon: IndianRupee,
    },
    {
      name: "Feed Stock Level",
      value: stats.feedStock,
      change: "Live",
      trend: stats.feedStock === 'Normal' ? "up" : "down",
      icon: Wheat,
    },
  ];

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>;
  }

  const handleExport = () => {
    // 1. Build CSV Content
    let csvContent = "data:text/csv;charset=utf-8,";

    // Add Summary Stats Section
    csvContent += "=== JAMINDAR DAIRY - DAILY REPORT ===\n\n";
    csvContent += "Metric,Value\n";
    csvContent += `Total Collection Today,${stats.totalCollection} L\n`;
    csvContent += `Active Livestock,${stats.activeLivestock}\n`;
    csvContent += `Revenue Today,Rs. ${stats.revenueToday}\n`;
    csvContent += `Feed Stock Level,${stats.feedStock}\n\n`;

    // Add Recent Collections Section
    csvContent += "=== RECENT COLLECTIONS ===\n\n";
    csvContent += "Date & Time,Type,Volume (L),Status\n";

    recentTransactions.forEach(tx => {
      const dateStr = new Date(tx.created_at).toLocaleString();
      csvContent += `"${dateStr}",${tx.type || 'Milk'},${tx.volume},Collected\n`;
    });

    // 2. Trigger Download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const filename = `Jamindar_Dairy_Report_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Dashboard Overview</h1>
          <p className="text-sm text-surface-500 mt-1">
            Welcome back, Admin. Here's what's happening today.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="btn-secondary">Export Report</button>
          <button className="btn-primary">New Entry</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {displayStats.map((stat) => (
          <div key={stat.name} className="card p-6">
            <div className="flex items-center justify-between">
              <div className="flex bg-primary-50 p-3 rounded-xl">
                <stat.icon className="h-6 w-6 text-primary-600" />
              </div>
              <div
                className={`flex items-center gap-1 text-sm font-medium ${stat.trend === "up"
                  ? "text-green-600"
                  : stat.trend === "down"
                    ? "text-red-600"
                    : "text-surface-600"
                  }`}
              >
                {stat.change}
                {stat.trend === "up" ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : stat.trend === "down" ? (
                  <ArrowDownRight className="h-4 w-4" />
                ) : null}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-surface-500">{stat.name}</p>
              <h3 className="text-3xl font-bold text-surface-900 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">Collection Trend</h2>
          <div className="h-72 w-full p-2 border border-surface-200 rounded-xl bg-surface-50/30">
            <CollectionChart />
          </div>
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">Recent Collections</h2>
          <div className="space-y-4">
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-surface-500">No collections recorded yet.</p>
            ) : (
              recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between border-b border-surface-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-surface-100 flex items-center justify-center text-surface-600">
                      <Droplets className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-surface-900">{tx.type || 'Milk'} Collection</p>
                      <p className="text-xs text-surface-500">{new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary-600">+{tx.volume} L</p>
                    <p className="text-xs text-surface-500">Collected</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
