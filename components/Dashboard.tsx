"use client";

import { useState, useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, Award, Calendar, Zap, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface StepData {
    Date: string;
    AaronSteps: number;
    AndrewSteps: number;
}

export default function Dashboard({ data }: { data: StepData[] }) {
    const [view, setView] = useState<'7d' | 'month' | 'year' | 'all'>('7d');

    const filteredData = useMemo(() => {
        const now = new Date();
        // In a real app, we'd use the current date, but since data is historical, 
        // we'll simulate the "current" view based on the last entry if needed.
        // For now, let's just slice for demo/dev.
        if (view === '7d') return data.slice(-7);
        if (view === 'month') return data.slice(-30);
        if (view === 'year') return data.slice(-365);
        return data;
    }, [data, view]);

    const missingDays = useMemo(() => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const startOfYear = new Date(currentYear, 0, 1);

        const missing: { date: string, users: string[] }[] = [];

        // Generate all days from Jan 1st to today
        const daysToCheck = [];
        const iter = new Date(startOfYear);
        while (iter <= today) {
            daysToCheck.push(iter.toISOString().split('T')[0]);
            iter.setDate(iter.getDate() + 1);
        }

        const dataMap = new Map(data.map(d => [d.Date, d]));

        daysToCheck.forEach(dateStr => {
            const entry = dataMap.get(dateStr);
            const missingUsers = [];
            if (!entry || entry.AaronSteps === 0) missingUsers.push('Aaron');
            if (!entry || entry.AndrewSteps === 0) missingUsers.push('Andrew');

            if (missingUsers.length > 0) {
                missing.push({ date: dateStr, users: missingUsers });
            }
        });

        return missing.reverse(); // Show newest missing first
    }, [data]);

    const stats = useMemo(() => {
        const aaronTotal = filteredData.reduce((acc, curr) => acc + curr.AaronSteps, 0);
        const andrewTotal = filteredData.reduce((acc, curr) => acc + curr.AndrewSteps, 0);
        const aaronAvg = Math.round(aaronTotal / (filteredData.length || 1));
        const andrewAvg = Math.round(andrewTotal / (filteredData.length || 1));

        let aaronWins = 0;
        let andrewWins = 0;
        let aaronRecord = 0;
        let andrewRecord = 0;

        filteredData.forEach(day => {
            if (day.AaronSteps > day.AndrewSteps) aaronWins++;
            else if (day.AndrewSteps > day.AaronSteps) andrewWins++;

            if (day.AaronSteps > aaronRecord) aaronRecord = day.AaronSteps;
            if (day.AndrewSteps > andrewRecord) andrewRecord = day.AndrewSteps;
        });

        return {
            aaron: { total: aaronTotal, avg: aaronAvg, wins: aaronWins, record: aaronRecord },
            andrew: { total: andrewTotal, avg: andrewAvg, wins: andrewWins, record: andrewRecord }
        };
    }, [filteredData]);

    return (
        <div className="w-full max-w-5xl mx-auto p-4 space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Step Tracker</h1>
                    <p className="text-slate-500 text-sm">Aaron vs Andrew</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    {(['7d', 'month', 'year', 'all'] as const).map((v) => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${view === v ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {v === '7d' ? '7 Days' : v === 'month' ? 'Month' : v === 'year' ? 'Year' : 'All Time'}
                        </button>
                    ))}
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UserStatsCard name="Aaron" stats={stats.aaron} color="text-blue-600" bgColor="bg-blue-50" />
                <UserStatsCard name="Andrew" stats={stats.andrew} color="text-indigo-600" bgColor="bg-indigo-50" />
            </div>

            {/* Missing Inputs Alert */}
            {missingDays.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 text-amber-800 mb-4">
                        <AlertCircle className="w-5 h-5 animate-pulse" />
                        <h3 className="font-bold">Missing Inputs (Current Year)</h3>
                        <span className="bg-amber-200 text-amber-900 text-[10px] px-2 py-0.5 rounded-full font-black uppercase">
                            {missingDays.length} days
                        </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {missingDays.slice(0, 12).map((day) => (
                            <Link
                                key={day.date}
                                href={`/add?date=${day.date}`}
                                className="flex items-center justify-between p-4 bg-white border border-amber-100 rounded-2xl hover:border-amber-300 active:scale-[0.98] transition-all group shadow-sm"
                            >
                                <div className="space-y-0.5">
                                    <div className="text-sm font-black text-slate-900">
                                        {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                                    </div>
                                    <div className="text-[10px] font-bold text-amber-600 uppercase tracking-tight">
                                        Needs: {day.users.join(' & ')}
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        ))}
                        {missingDays.length > 12 && (
                            <div className="col-span-full text-center py-2 text-xs text-amber-600 font-bold uppercase tracking-widest bg-amber-100/50 rounded-xl mt-2">
                                + {missingDays.length - 12} more days
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[400px]">
                <h3 className="text-sm font-semibold text-slate-900 mb-6">Step Trends</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="Date"
                            fontSize={10}
                            tickFormatter={(str) => {
                                const parts = str.split('-'); // YYYY-MM-DD
                                if (view === 'all' || view === 'year') {
                                    return `${parts[1]}/${parts[0].slice(2)}`; // MM/YY
                                }
                                return `${parts[1]}/${parts[2]}`; // MM/DD
                            }}
                            stroke="#94a3b8"
                        />
                        <YAxis fontSize={10} stroke="#94a3b8" />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend verticalAlign="top" height={36} />
                        <Line
                            type="monotone"
                            dataKey="AaronSteps"
                            name="Aaron"
                            stroke="#2563eb"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="AndrewSteps"
                            name="Andrew"
                            stroke="#4f46e5"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

function UserStatsCard({ name, stats, color, bgColor }: any) {
    return (
        <div className={`p-6 rounded-2xl ${bgColor} border border-opacity-10 space-y-4`}>
            <div className="flex items-center justify-between">
                <h3 className={`font-bold text-lg ${color}`}>{name}</h3>
                {stats.wins > 0 && <Award className={`w-5 h-5 ${color}`} />}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <StatItem label="Total Steps" value={stats.total.toLocaleString()} icon={<TrendingUp className="w-4 h-4" />} color={color} />
                <StatItem label="Daily Avg" value={stats.avg.toLocaleString()} icon={<Calendar className="w-4 h-4" />} color={color} />
                <StatItem label="Days Won" value={stats.wins} icon={<Zap className="w-4 h-4" />} color={color} />
                <StatItem label="Record High" value={stats.record.toLocaleString()} icon={<TrendingUp className="w-4 h-4" />} color={color} />
            </div>
        </div>
    );
}

function StatItem({ label, value, icon, color }: any) {
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                {icon}
                {label}
            </div>
            <div className={`text-xl font-black ${color}`}>
                {value}
            </div>
        </div>
    );
}
