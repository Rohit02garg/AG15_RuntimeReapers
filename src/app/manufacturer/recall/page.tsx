'use client';

import { useState } from 'react';
import { TriangleAlert, AlertOctagon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function RecallPage() {
    const [serial, setSerial] = useState('');
    const [reason, setReason] = useState('Safety Concern');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRecall = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirm(`Are you sure you want to RECALL item ${serial}? This action cannot be undone.`)) return;

        setLoading(true);
        setMessage('');

        try {
            const res = await fetch('/api/manufacturer/recall', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ serial, reason })
            });

            const data = await res.json();
            if (res.ok) {
                setMessage(data.message);
                setSerial('');
            } else {
                setMessage('Error: ' + data.message);
            }
        } catch (err) {
            setMessage('Network Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-8 bg-background text-foreground relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-500/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="w-full max-w-lg glass-panel p-8 rounded-2xl shadow-2xl border border-white/10 relative z-10">
                <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                    <h1 className="text-xl font-bold text-orange-500 flex items-center gap-2 tracking-wide">
                        <AlertOctagon className="w-6 h-6" /> Decommission Protocol
                    </h1>
                    <Link href="/manufacturer/dashboard" className="text-muted-foreground hover:text-white text-sm flex items-center gap-1 transition-colors">
                        <ArrowLeft className="w-3 h-3" /> Cancel
                    </Link>
                </div>

                <p className="mb-8 text-muted-foreground text-sm leading-relaxed">
                    Enter the Serial Number of the Pallet, Carton, or Unit you wish to recall.
                    This will flag the item and all its contents as <strong className="text-orange-400">RECALLED</strong> globally on the Digital Thread.
                </p>

                <form onSubmit={handleRecall} className="flex flex-col gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Target Serial Number</label>
                        <input
                            type="text"
                            placeholder="e.g. P-12345678..."
                            className="w-full bg-black/50 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-all font-mono placeholder:text-gray-700"
                            value={serial}
                            onChange={e => setSerial(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Reason for Recall</label>
                        <div className="relative">
                            <select
                                className="w-full bg-black/50 border border-white/10 rounded-lg p-4 text-white appearance-none focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-all cursor-pointer"
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                            >
                                <option>Safety Concern</option>
                                <option>Expired Batch</option>
                                <option>Stolen / Lost</option>
                                <option>Regulatory Compliance</option>
                                <option>Other</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                ▼
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 rounded-lg transition-all shadow-md transform active:scale-95 disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                    >
                        {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><TriangleAlert className="w-4 h-4" /> INITIATE RECALL</>}
                    </button>

                    {message && (
                        <div className={`mt-2 p-4 rounded-lg text-center text-sm font-bold border ${message.includes('Error') ? 'bg-red-950/30 border-red-500/30 text-red-400' : 'bg-green-950/30 border-green-500/30 text-green-400'}`}>
                            {message}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
