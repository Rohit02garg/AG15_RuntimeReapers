'use client';

import { useState } from 'react';
import { ShieldCheck, AlertTriangle, XCircle, Search, ArrowRight, ScanLine } from 'lucide-react';
import Link from 'next/link';
import QRScanner from '@/components/QRScanner';

export default function VerifyPage() {
    const [serial, setSerial] = useState('');
    const [code, setCode] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [showScanner, setShowScanner] = useState(false);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        // Simple Location Faking for Demo (or use Browser API)
        const location = "Consumer Browser";

        try {
            const res = await fetch('/api/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ serial, code, location })
            });
            const data = await res.json();
            setResult(data);
        } catch (err) {
            setResult({ status: 'ERROR', message: 'Network failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center p-8 bg-background text-foreground relative overflow-hidden">
            {showScanner && (
                <div className="fixed inset-0 z-50">
                    <QRScanner
                        onScan={(val) => {
                            try {
                                const url = new URL(val);
                                const s = url.searchParams.get('s');
                                const c = url.searchParams.get('c');

                                if (s) setSerial(s);
                                else setSerial(val); // Fallback if no param

                                if (c) setCode(c);
                            } catch (e) {
                                // Not a URL, treat as raw serial
                                setSerial(val);
                            }
                            setShowScanner(false);
                        }}
                        onClose={() => setShowScanner(false)}
                    />
                </div>
            )}

            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/20 blur-[150px] rounded-full pointer-events-none" />

            <header className="w-full max-w-2xl mb-12 flex justify-between items-center z-10">
                <Link href="/" className="font-bold text-2xl neon-text flex items-center gap-2">
                    <ShieldCheck className="text-primary w-8 h-8" /> SmartTrace
                </Link>
                <Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Staff Login
                </Link>
            </header>

            <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-2xl relative border border-white/10 z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-2xl"></div>

                <h1 className="text-2xl font-bold mb-6 text-center text-white">Public Verification</h1>
                <p className="text-sm text-muted-foreground text-center mb-8">
                    Scan or enter the product ID to trace its entire journey through the <span className="text-primary font-semibold">Digital Thread</span> ledger.
                </p>

                <form onSubmit={handleVerify} className="flex flex-col gap-5">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Product Serial</label>
                        <div className="relative flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    className="w-full bg-black/40 border border-white/10 p-4 rounded-lg text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all pl-12 placeholder:text-neutral-600 font-mono"
                                    value={serial}
                                    onChange={e => setSerial(e.target.value)}
                                    placeholder="P-1234567..."
                                    required
                                />
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowScanner(true)}
                                className="bg-white/10 hover:bg-white/20 border border-white/10 text-white p-4 rounded-lg transition-colors"
                                title="Open Camera"
                            >
                                <ScanLine className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Verification Code</label>
                        <input
                            className="w-full bg-black/40 border border-white/10 p-4 rounded-lg text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-neutral-600 font-mono text-center tracking-widest text-lg"
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            placeholder="A1B2 C3D4"
                            maxLength={8}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-white hover:bg-neutral-200 text-black py-4 rounded-lg font-bold mt-2 shadow-md transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                        {loading ? 'Analyzing Ledger...' : 'VERIFY AUTHENTICITY'}
                        {!loading && <ArrowRight className="w-4 h-4" />}
                    </button>
                </form>
            </div>

            {result && (
                <div className={`mt-8 p-8 rounded-2xl w-full max-w-md border shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 ${result.status === 'VALID' ? 'bg-green-950/40 border-green-500/50' :
                    result.status === 'SUSPECT' || result.status === 'RECALLED' ? 'bg-orange-950/40 border-orange-500/50' :
                        'bg-red-950/40 border-red-500/50'
                    }`}>
                    <div className="flex items-center gap-4 mb-4">
                        {result.status === 'VALID' && <ShieldCheck className="w-12 h-12 text-green-400" />}
                        {result.status === 'SUSPECT' && <AlertTriangle className="w-12 h-12 text-orange-400" />}
                        {result.status === 'RECALLED' && <AlertTriangle className="w-12 h-12 text-orange-400" />}
                        {result.status === 'INVALID' || result.status === 'COUNTERFEIT' || result.status === 'ERROR' && <XCircle className="w-12 h-12 text-red-400" />}

                        <div>
                            <h2 className={`text-3xl font-bold tracking-tight ${result.status === 'VALID' ? 'text-green-400' :
                                result.status === 'SUSPECT' || result.status === 'RECALLED' ? 'text-orange-400' :
                                    'text-red-400'
                                }`}>
                                {result.status}
                            </h2>
                            <p className="text-white/80 text-sm leading-tight">{result.message}</p>
                        </div>
                    </div>


                    {result.item && (
                        <div className="mt-6">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-white/10 pb-2 mb-4">Digital Red Thread</h3>
                            <div className="space-y-0 relative border-l border-white/10 ml-3 pl-6">
                                {result.item.history.map((event: any, i: number) => (
                                    <div key={i} className="mb-6 relative last:mb-0">
                                        <div className={`absolute -left-[29px] top-1 w-3 h-3 rounded-full border-2 ${event.status === 'MANUFACTURED' ? 'bg-primary border-primary shadow-[0_0_10px_var(--color-primary)]' :
                                            event.status === 'RECALLED' ? 'bg-red-500 border-red-500' :
                                                'bg-neutral-800 border-neutral-600'
                                            }`}></div>
                                        <div className="text-white font-medium flex justify-between">
                                            <span>{event.status}</span>
                                            <span className="text-xs font-mono text-muted-foreground bg-white/5 px-2 py-0.5 rounded">{new Date(event.timestamp).toLocaleDateString()}</span>
                                        </div>
                                        <div className="text-sm text-muted-foreground mt-1">
                                            {event.location} <span className="text-white/20">•</span> <span className="italic">{event.notes}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
