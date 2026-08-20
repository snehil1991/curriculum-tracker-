'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Submission {
    id: string;
    coachName: string;
    batch: string;
    state: string;
    center: string;
    trainingWeek: string;
    submissionType: string;
    videoUrl: string;
    status: 'PENDING' | 'ACHIEVED' | 'INTERVENTION';
    createdAt: number;
}

const STATES = [
    'All',
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Gujarat',
    'Madhya Pradesh',
    'Maharashtra',
    'Tamil Nadu',
    'Telangana',
    'West Bengal'
];

export default function SeniorDashboard() {
    const router = useRouter();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [filterState, setFilterState] = useState('All');
    const [loading, setLoading] = useState(true);

    const fetchSubmissions = async () => {
        try {
            const res = await fetch('/api/submissions');
            if (res.ok) {
                const data = await res.json();
                setSubmissions(data || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();

        // Optional: Auto-refresh periodically to simulate live dashboard
        const intv = setInterval(fetchSubmissions, 10000);
        return () => clearInterval(intv);
    }, []);

    const handleStatusUpdate = async (id: string, status: 'ACHIEVED' | 'INTERVENTION', videoUrl: string) => {
        try {
            const res = await fetch(`/api/submissions/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, videoUrl })
            });
            if (res.ok) {
                setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const filtered = filterState === 'All'
        ? submissions
        : submissions.filter(s => s.state === filterState);

    return (
        <div className="min-h-screen bg-neutral-900 text-white p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Senior Dashboard</h1>
                        <p className="text-neutral-400">Review curriculum progressions (Auto-refreshes)</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <button onClick={() => router.push('/')} className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-sm transition-colors text-neutral-200 font-medium shadow-sm">
                            &larr; Home
                        </button>
                        <div className="flex items-center gap-3 bg-neutral-800 p-2.5 px-4 rounded-xl border border-neutral-700 shadow-sm">
                            <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            <select
                                value={filterState}
                                onChange={e => setFilterState(e.target.value)}
                                className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-white appearance-none min-w-[200px]"
                            >
                                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                </header>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-neutral-800/50 border border-neutral-700 rounded-3xl p-12 text-center shadow-inner">
                        <div className="w-20 h-20 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md border border-neutral-700">
                            <svg className="w-10 h-10 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-neutral-300 mb-2">No submissions found</h3>
                        <p className="text-neutral-500">Submissions from coaches in the selected state will appear here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                        {filtered.map(sub => (
                            <div key={sub.id} className="bg-neutral-800 rounded-3xl overflow-hidden border border-neutral-700 shadow-xl flex flex-col hover:border-neutral-600 transition-colors">
                                <div className="bg-black relative aspect-[9/16] md:aspect-video w-full flex-shrink-0">
                                    {sub.videoUrl && sub.videoUrl.includes('drive.google.com') ? (
                                        <iframe
                                            src={sub.videoUrl.replace(/\/view.*/, '/preview')}
                                            className="w-full h-full border-0 absolute inset-0"
                                            allow="autoplay; encrypted-media"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <video
                                            src={sub.videoUrl}
                                            className="w-full h-full object-contain absolute inset-0"
                                            controls
                                            preload="metadata"
                                        />
                                    )}

                                    <div className="absolute top-4 left-4 z-10 pointer-events-none">
                                        {sub.status === 'PENDING' && (
                                            <span className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-lg">Pending Review</span>
                                        )}
                                        {sub.status === 'ACHIEVED' && (
                                            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-lg">Achieved</span>
                                        )}
                                        {sub.status === 'INTERVENTION' && (
                                            <span className="bg-red-500/20 text-red-500 border border-red-500/50 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-lg">Intervention</span>
                                        )}
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-xs text-blue-400 font-black tracking-wider uppercase mb-1">{sub.submissionType}</p>
                                            <h3 className="text-2xl font-bold text-white mb-1">{sub.center}</h3>
                                            <p className="text-sm font-medium text-neutral-300">{sub.coachName} • {sub.batch}</p>
                                            <p className="text-sm text-neutral-400 flex items-center gap-1.5 mt-1">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                {sub.trainingWeek}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-flex items-center gap-1.5 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-sm font-semibold shadow-sm text-neutral-300">
                                                {sub.state}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-neutral-700/50">
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => handleStatusUpdate(sub.id, 'ACHIEVED', sub.videoUrl)}
                                                className={`py-3 px-2 rounded-xl transition-all font-bold tracking-wide flex items-center justify-center gap-2 ${sub.status === 'ACHIEVED'
                                                    ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(5,150,105,0.4)] ring-2 ring-emerald-500 ring-offset-2 ring-offset-neutral-800'
                                                    : 'bg-neutral-900/50 text-neutral-400 hover:bg-emerald-900/40 hover:text-emerald-400 border border-neutral-700 hover:border-emerald-700'
                                                    }`}
                                            >
                                                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Achieved
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(sub.id, 'INTERVENTION', sub.videoUrl)}
                                                className={`py-3 px-2 rounded-xl transition-all font-bold tracking-wide flex items-center justify-center gap-2 ${sub.status === 'INTERVENTION'
                                                    ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] ring-2 ring-red-500 ring-offset-2 ring-offset-neutral-800'
                                                    : 'bg-neutral-900/50 text-neutral-400 hover:bg-red-900/40 hover:text-red-400 border border-neutral-700 hover:border-red-700'
                                                    }`}
                                            >
                                                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                Intervention
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
