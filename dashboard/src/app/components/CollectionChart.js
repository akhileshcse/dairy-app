'use client';

import { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

import { supabase } from '@/lib/supabase';

export default function CollectionChart() {
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                const queryDate = sevenDaysAgo.toISOString();

                // Get milk logs for the last 7 days directly from Supabase
                const { data, error } = await supabase
                    .from('milk_logs')
                    .select('created_at, volume')
                    .eq('user_id', user.id)
                    .gte('created_at', queryDate)
                    .order('created_at', { ascending: true });

                if (error) throw error;

                if (!data || data.length === 0) {
                    setChartData({ labels: [], datasets: [] });
                    return;
                }

                const grouped = {};
                // Group by date
                data.forEach(log => {
                    const dateStr = new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    if (!grouped[dateStr]) grouped[dateStr] = 0;
                    grouped[dateStr] += Number(log.volume);
                });

                const labels = Object.keys(grouped);
                const dataset = labels.map(l => grouped[l]);

                setChartData({
                    labels,
                    datasets: [
                        {
                            label: 'Total Volume (L)',
                            data: dataset,
                            borderColor: 'rgb(59, 130, 246)',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            fill: true,
                            tension: 0.4,
                            pointBackgroundColor: 'rgb(59, 130, 246)',
                        }
                    ]
                });
            } catch (e) {
                console.error("Failed to fetch chart data", e);
                setChartData({ labels: [], datasets: [] });
            }
        }
        fetchData();
    }, []);

    if (!chartData) {
        return <div className="h-full w-full flex items-center justify-center text-surface-500 text-sm">Loading chart...</div>;
    }

    if (chartData.labels.length === 0) {
        return <div className="h-full w-full flex items-center justify-center text-surface-500 text-sm">No recent collection data.</div>;
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0,0,0,0.05)'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };

    return <Line options={options} data={chartData} />;
}
