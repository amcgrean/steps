"use client";

import { useState, useEffect } from 'react';
import { ChevronLeft, Save, Loader2, History } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function InputForm({ userEmail }: { userEmail: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryDate = searchParams.get('date');

    const person = userEmail.includes('aaron') ? 'Aaron' : 'Andrew';

    const [date, setDate] = useState(queryDate || new Date().toISOString().split('T')[0]);
    const [steps, setSteps] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [isEdit, setIsEdit] = useState(false);

    useEffect(() => {
        if (date) {
            fetchExistingSteps(date);
        }
    }, [date]);

    async function fetchExistingSteps(targetDate: string) {
        setFetching(true);
        try {
            const res = await fetch(`/api/steps?date=${targetDate}`);
            if (res.ok) {
                const data = await res.json();
                const existingSteps = data[`${person}Steps`];
                if (existingSteps !== undefined && existingSteps !== 0) {
                    setSteps(existingSteps.toString());
                    setIsEdit(true);
                } else {
                    setSteps('');
                    setIsEdit(false);
                }
            }
        } catch (err) {
            console.error('Failed to fetch existing steps:', err);
        } finally {
            setFetching(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setStatus('idle');

        try {
            const res = await fetch('/api/steps ', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date, person, steps: parseInt(steps) }),
            });

            if (res.ok) {
                setStatus('success');
                setSteps('');
                router.refresh(); // Update dashboard data
            } else {
                setStatus('error');
            }
        } catch (err) {
            setStatus('error');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-md mx-auto p-4 pt-12">
            <Link href="/" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-800 mb-8 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100 text-xs font-bold uppercase tracking-widest active:scale-95 transition-all">
                <ChevronLeft className="w-4 h-4" />
                Dashboard
            </Link>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 ring-1 ring-slate-900/5">
                <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
                    {isEdit ? 'Update Steps' : 'Log Steps'}
                </h1>
                <p className="text-sm text-slate-500 mb-8 flex flex-wrap items-center gap-2">
                    Hey <span className="text-primary-600 font-bold">{person}</span>, keep up the pace!
                    {isEdit && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-full uppercase tracking-tighter ring-1 ring-indigo-200">
                            <History className="w-3 h-3" />
                            Correction
                        </span>
                    )}
                </p>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="relative group">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-1">Date of Activity</label>
                        <input
                            type="date"
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-3xl transition-all font-bold text-slate-700 text-lg shadow-inner"
                        />
                        {fetching && (
                            <div className="absolute right-5 bottom-5">
                                <Loader2 className="w-5 h-5 animate-spin text-primary-400" />
                            </div>
                        )}
                    </div>

                    <div className="group">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-1">Total Daily Steps</label>
                        <input
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            required
                            placeholder="0"
                            value={steps}
                            onChange={(e) => setSteps(e.target.value)}
                            className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-3xl transition-all font-black text-slate-900 text-3xl shadow-inner placeholder:text-slate-200"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || fetching}
                        className="w-full flex items-center justify-center gap-3 p-5 bg-primary-600 text-white rounded-3xl font-black text-lg shadow-xl shadow-primary-200 hover:bg-primary-700 active:scale-[0.96] transition-all disabled:opacity-50 disabled:active:scale-100"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                        {loading ? 'Saving...' : isEdit ? 'Update Entry' : 'Log Daily Steps'}
                    </button>

                    {status === 'success' && (
                        <div className="text-center text-sm font-bold text-green-600 bg-green-50 p-4 rounded-2xl border border-green-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            Steps saved successfully! 🎉
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="text-center text-sm font-bold text-red-600 bg-red-50 p-4 rounded-2xl border border-red-100">
                            Failed to save steps. Try again.
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
