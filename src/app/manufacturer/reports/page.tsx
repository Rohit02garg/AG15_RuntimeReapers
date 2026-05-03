'use client';

import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ManufacturerReports() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await fetch('/api/manufacturer/reports');
                const data = await res.json();
                if (data.success) {
                    setReports(data.reports);
                }
            } catch (err) {
                console.error("Failed to load reports");
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this report? This cannot be undone.')) return;

        setDeleting(id);
        try {
            const res = await fetch(`/api/manufacturer/reports?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setReports(prev => prev.filter(r => r._id !== id));
            }
        } catch (err) {
            alert('Network error');
        } finally {
            setDeleting(null);
        }
    };

    const handleClearAll = async () => {
        if (!confirm(`Delete ALL ${reports.length} reports? This cannot be undone.`)) return;

        setLoading(true);
        try {
            const res = await fetch('/api/manufacturer/reports', { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setReports([]);
            }
        } catch (err) {
            alert('Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col p-8 bg-background text-foreground relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 right-1/2 translate-x-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-6xl mx-auto w-full space-y-8 z-10">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 neon-text text-white">Distributor Reports</h1>
                        <p className="text-muted-foreground">Incoming intelligence from distribution network.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {reports.length > 0 && (
                            <button
                                onClick={handleClearAll}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm font-bold transition-all hover:scale-105"
                            >
                                <Trash2 className="w-4 h-4" />
                                Clear All
                            </button>
                        )}
                        <button onClick={() => router.back()} className="text-sm text-muted-foreground hover:text-white transition-colors flex items-center gap-1">
                            &larr; Go Back
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 animate-pulse text-muted-foreground">
                        Loading reports...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {reports.map((report) => (
                            <div key={report._id} className="glass-panel p-6 rounded-xl border border-white/10 hover:border-primary/50 transition-colors group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                            {report.distributor?.username?.[0]?.toUpperCase() || 'D'}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">{report.distributor?.username || 'Unknown Distributor'}</h3>
                                            <p className="text-xs text-muted-foreground font-mono">ID: {report.distributor?.businessId || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-neutral-500 font-mono">
                                            {new Date(report.createdAt).toLocaleString()}
                                        </span>
                                        <button
                                            onClick={() => handleDelete(report._id)}
                                            disabled={deleting === report._id}
                                            className="text-red-400/50 hover:text-red-400 transition-colors disabled:opacity-50 p-1.5 rounded hover:bg-red-500/10 opacity-0 group-hover:opacity-100"
                                            title="Delete Report"
                                        >
                                            {deleting === report._id ? (
                                                <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-black/30 p-4 rounded-lg text-neutral-300 text-sm leading-relaxed border-l-2 border-primary">
                                    {report.content}
                                </div>
                            </div>
                        ))}

                        {reports.length === 0 && (
                            <div className="text-center py-20 text-muted-foreground glass-panel rounded-xl border border-white/5">
                                No reports received.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
