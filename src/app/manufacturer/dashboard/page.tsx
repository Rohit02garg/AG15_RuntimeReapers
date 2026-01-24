'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ManufacturerDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const [config, setConfig] = useState({
        unitsPerCarton: 10,
        cartonsPerPallet: 50,
        totalPallets: 1
    });

    const handleGenerate = async () => {
        setLoading(true);
        const totalItems = config.totalPallets * config.cartonsPerPallet * config.unitsPerCarton +
            config.totalPallets * config.cartonsPerPallet +
            config.totalPallets;

        setMessage(`Initializing Quantum Ledger for ${totalItems.toLocaleString()} items...`);
        setStats(null);

        try {
            const start = performance.now();
            const res = await fetch('/api/manufacturer/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });

            const data = await res.json();
            const end = performance.now();
            const duration = ((end - start) / 1000).toFixed(2);

            if (res.ok) {
                setStats(data.stats);
                setMessage(`${data.message} in ${duration}s`);
            } else {
                setMessage('Error: ' + data.message);
            }
        } catch (err) {
            setMessage('Network Error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col p-8 bg-background text-foreground relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="z-10 max-w-6xl mx-auto w-full">
                <header className="mb-12 border-b border-white/10 pb-6">
                    <h1 className="text-4xl font-bold neon-text text-white">Manufacturer Command Center</h1>
                    <p className="text-muted-foreground mt-2">Manage production, distributors, and supply chain integrity.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Generation Card */}
                    <div className="glass-panel p-8 rounded-2xl relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl pointer-events-none"></div>
                        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-white">
                            <span className="text-primary">⚡</span> Generate Batch
                        </h2>

                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Units/Carton</label>
                                <input
                                    type="number"
                                    className="w-full bg-black/40 border border-white/10 p-3 rounded text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    value={config.unitsPerCarton}
                                    onChange={e => setConfig({ ...config, unitsPerCarton: Number(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Cartons/Pallet</label>
                                <input
                                    type="number"
                                    className="w-full bg-black/40 border border-white/10 p-3 rounded text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    value={config.cartonsPerPallet}
                                    onChange={e => setConfig({ ...config, cartonsPerPallet: Number(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Pallets</label>
                                <input
                                    type="number"
                                    className="w-full bg-black/40 border border-white/10 p-3 rounded text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    value={config.totalPallets}
                                    onChange={e => setConfig({ ...config, totalPallets: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="mb-6 text-sm text-primary/80 bg-primary/10 border border-primary/20 p-4 rounded-lg flex justify-between items-center">
                            <span>Target Output:</span>
                            <strong className="text-xl text-white">{(config.totalPallets * (1 + config.cartonsPerPallet * (1 + config.unitsPerCarton))).toLocaleString()} Items</strong>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/80 text-white px-4 py-4 rounded-lg font-bold shadow-[0_0_15px_var(--color-primary)] transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Initializing Core...' : 'EXECUTE GENERATION PROTOCOL'}
                        </button>

                        {message && (
                            <div className={`mt-6 p-4 rounded-lg text-center border ${message.includes('Error') ? 'bg-destructive/20 border-destructive/50 text-destructive-foreground' : 'bg-green-500/10 border-green-500/30 text-green-400'}`}>
                                <p className="font-mono text-sm">{message}</p>
                            </div>
                        )}

                        {stats && (
                            <div className="mt-6 grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4">
                                <div className="bg-black/40 p-3 rounded border border-white/5 text-center">
                                    <div className="text-xs text-muted-foreground uppercase">Pallets</div>
                                    <div className="text-xl font-bold text-white">{stats.pallets}</div>
                                </div>
                                <div className="bg-black/40 p-3 rounded border border-white/5 text-center">
                                    <div className="text-xs text-muted-foreground uppercase">Cartons</div>
                                    <div className="text-xl font-bold text-white">{stats.cartons}</div>
                                </div>
                                <div className="bg-black/40 p-3 rounded border border-white/5 text-center">
                                    <div className="text-xs text-muted-foreground uppercase">Units</div>
                                    <div className="text-xl font-bold text-white">{stats.units}</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Links Grid */}
                    <div className="grid grid-cols-1 gap-4 content-start">
                        <Link href="/manufacturer/inventory" className="glass-card p-6 rounded-xl flex items-center justify-between group">
                            <div>
                                <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">Digital Inventory</h3>
                                <p className="text-sm text-muted-foreground">View generated labels and hierarchy.</p>
                            </div>
                            <span className="text-2xl group-hover:translate-x-1 transition-transform">📦</span>
                        </Link>

                        <Link href="/manufacturer/distributors" className="glass-card p-6 rounded-xl flex items-center justify-between group">
                            <div>
                                <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">Distributor Network</h3>
                                <p className="text-sm text-muted-foreground">Manage authorized partners.</p>
                            </div>
                            <span className="text-2xl group-hover:translate-x-1 transition-transform">🌐</span>
                        </Link>

                        <Link href="/manufacturer/reports" className="glass-card p-6 rounded-xl flex items-center justify-between group border-l-4 border-l-blue-500 hover:border-l-blue-400">
                            <div>
                                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">Distributor Reports</h3>
                                <p className="text-sm text-muted-foreground">View incoming network feedback.</p>
                            </div>
                            <span className="text-2xl group-hover:translate-x-1 transition-transform">📥</span>
                        </Link>

                        <Link href="/manufacturer/recall" className="glass-card p-6 rounded-xl flex items-center justify-between group border-l-4 border-l-orange-500 hover:border-l-orange-400">
                            <div>
                                <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors">Recall Protocol ⚠️</h3>
                                <p className="text-sm text-muted-foreground">Emergency batch decommissioning.</p>
                            </div>
                            <span className="text-2xl group-hover:translate-x-1 transition-transform">🚨</span>
                        </Link>

                        <Link href="/manufacturer/anomalies" className="glass-card p-6 rounded-xl flex items-center justify-between group border-l-4 border-l-red-600 hover:border-l-red-500">
                            <div>
                                <h3 className="text-lg font-bold text-white group-hover:text-red-500 transition-colors">Anomaly Detection ⚠️</h3>
                                <p className="text-sm text-muted-foreground">View security alerts and breaches.</p>
                            </div>
                            <span className="text-2xl group-hover:translate-x-1 transition-transform">🛡️</span>
                        </Link>

                        <Link href="/verify" className="glass-card p-6 rounded-xl flex items-center justify-between group">
                            <div>
                                <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">Public Verification</h3>
                                <p className="text-sm text-muted-foreground">Test the consumer scanning interface.</p>
                            </div>
                            <span className="text-2xl group-hover:translate-x-1 transition-transform">🔍</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
