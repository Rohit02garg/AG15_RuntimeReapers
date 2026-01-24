'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, AlertTriangle, MapPin, Navigation } from 'lucide-react';
import Link from 'next/link';

export default function AnomaliesPage() {
    const [anomalies, setAnomalies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnomalies = async () => {
            try {
                const res = await fetch('/api/manufacturer/anomalies');
                const data = await res.json();
                if (data.success) {
                    setAnomalies(data.anomalies);
                }
            } catch (err) {
                console.error("Failed to load anomalies");
            } finally {
                setLoading(false);
            }
        };

        fetchAnomalies();
    }, []);

    return (
        <div className="flex min-h-screen flex-col p-8 bg-background text-foreground selection:bg-orange-500/30">
            <header className="flex justify-between items-center mb-12">
                <div>
                    <Link href="/manufacturer/dashboard" className="text-muted-foreground hover:text-white flex items-center gap-2 mb-2 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <AlertTriangle className="text-orange-500 w-8 h-8" />
                        Location Anomalies
                    </h1>
                </div>
            </header>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="h-12 w-12 border-4 border-t-orange-500 border-gray-700 rounded-full animate-spin shadow-sm"></div>
                </div>
            ) : (
                <div className="w-full">
                    <div className="glass-panel overflow-hidden rounded-xl">
                        <table className="min-w-full text-left">
                            <thead>
                                <tr className="border-b border-white/10 text-muted-foreground uppercase text-xs tracking-wider">
                                    <th className="py-4 px-6 font-medium">Timestamp</th>
                                    <th className="py-4 px-6 font-medium">Distributor</th>
                                    <th className="py-4 px-6 font-medium">Item Serial</th>
                                    <th className="py-4 px-6 font-medium">Deviation</th>
                                    <th className="py-4 px-6 font-medium">Expected</th>
                                    <th className="py-4 px-6 font-medium">Actual</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                                {anomalies.map((anomaly) => (
                                    <tr key={anomaly._id} className="hover:bg-white/5 transition-colors">
                                        <td className="py-4 px-6 whitespace-nowrap text-white font-mono">
                                            {new Date(anomaly.timestamp).toLocaleString()}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                                    {(anomaly.distributorId?.username || 'U')[0].toUpperCase()}
                                                </div>
                                                <span className="font-medium text-white">{anomaly.distributorId?.username || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 font-mono text-muted-foreground">
                                            {anomaly.serial} <span className="ml-2 text-[10px] border border-white/10 px-1 rounded uppercase tracking-wider">{anomaly.itemType}</span>
                                        </td>
                                        <td className="py-4 px-6 font-bold text-orange-400">
                                            +{anomaly.distanceKm.toFixed(2)} km
                                        </td>
                                        <td className="py-4 px-6 text-xs text-muted-foreground font-mono">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {anomaly.expectedLocation.lat.toFixed(4)}, {anomaly.expectedLocation.lng.toFixed(4)}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-xs text-orange-300 font-mono">
                                            <div className="flex items-center gap-1">
                                                <Navigation className="w-3 h-3" />
                                                {anomaly.actualLocation.lat.toFixed(4)}, {anomaly.actualLocation.lng.toFixed(4)}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {anomalies.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center gap-4">
                                                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-2">
                                                    <AlertTriangle className="w-8 h-8 text-green-500 opacity-50" />
                                                </div>
                                                <p>No anomalies detected. Supply chain integrity is 100%.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
