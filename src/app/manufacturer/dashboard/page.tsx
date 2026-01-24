'use client';

import { useState } from 'react';

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

        setMessage(`Generating ${totalItems.toLocaleString()} labels... (Target < 5s)`);
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
        <div className="flex min-h-screen flex-col p-8 bg-gray-100 text-black">
            <h1 className="text-3xl font-bold mb-8">Manufacturer Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Generation Card */}
                <div className="bg-white p-6 rounded shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Generate New Batch</h2>

                    <div className="grid grid-cols-3 gap-2 mb-6">
                        <div>
                            <label className="text-xs font-bold text-gray-500">Units/Carton</label>
                            <input
                                type="number"
                                className="w-full border p-2 rounded bg-gray-50"
                                value={config.unitsPerCarton}
                                onChange={e => setConfig({ ...config, unitsPerCarton: Number(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500">Cartons/Pallet</label>
                            <input
                                type="number"
                                className="w-full border p-2 rounded bg-gray-50"
                                value={config.cartonsPerPallet}
                                onChange={e => setConfig({ ...config, cartonsPerPallet: Number(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500">Total Pallets</label>
                            <input
                                type="number"
                                className="w-full border p-2 rounded bg-gray-50"
                                value={config.totalPallets}
                                onChange={e => setConfig({ ...config, totalPallets: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="mb-4 text-sm text-gray-600 bg-blue-50 p-3 rounded">
                        Total Items to Generate: <strong>{(config.totalPallets * (1 + config.cartonsPerPallet * (1 + config.unitsPerCarton))).toLocaleString()}</strong>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 font-bold"
                    >
                        {loading ? 'Generating...' : '⚡ Generate Batch'}
                    </button>

                    {message && <p className="mt-4 font-semibold text-center">{message}</p>}

                    {stats && (
                        <div className="mt-4 p-4 bg-green-50 rounded border border-green-200">
                            <h3 className="font-bold mb-2">Success! Generated:</h3>
                            <ul className="list-disc ml-5">
                                <li>Pallets: {stats.pallets}</li>
                                <li>Cartons: {stats.cartons}</li>
                                <li>Units: {stats.units}</li>
                            </ul>
                        </div>
                    )}
                </div>

                {/* Quick Links Card */}
                <div className="bg-white p-6 rounded shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
                    <ul className="space-y-2 text-blue-600 underline">
                        <li><a href="/manufacturer/inventory">View Generated Labels</a></li>
                        <li><a href="/manufacturer/distributors">Manage Distributors</a></li>
                        <li><a href="/verify">Public Verification Page</a></li>
                        <li><a href="/manufacturer/recall" className="font-bold text-orange-600">Recall / Decommission Tool ⚠️</a></li>
                        <li><a href="/manufacturer/anomalies" className="text-red-600 font-bold">View Location Anomalies ⚠️</a></li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
