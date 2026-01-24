'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ManufacturerReports() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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
                    <Link href="/manufacturer/dashboard" className="text-sm hover:text-white transition-colors flex items-center gap-1">
                        &larr; Back to Dashboard
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-20 animate-pulse text-muted-foreground">
                        Loading reports...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {reports.map((report) => (
                            <div key={report._id} className="glass-panel p-6 rounded-xl border border-white/10 hover:border-primary/50 transition-colors">
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
                                    <span className="text-xs text-neutral-500 font-mono">
                                        {new Date(report.createdAt).toLocaleString()}
                                    </span>
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
