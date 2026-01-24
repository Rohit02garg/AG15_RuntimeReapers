'use client';

import { useState, useEffect } from 'react';

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
        <div className="flex min-h-screen flex-col p-8 bg-gray-100 text-black">
            <h1 className="text-3xl font-bold mb-8 text-red-600">Location Anomalies</h1>
            <a href="/manufacturer/dashboard" className="text-blue-600 underline mb-6 block">&larr; Back to Dashboard</a>

            {loading ? (
                <p>Loading anomalies...</p>
            ) : (
                <div className="w-full">
                    <div className="bg-white shadow-md rounded my-6 overflow-x-auto">
                        <table className="min-w-full table-auto">
                            <thead>
                                <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                                    <th className="py-3 px-6 text-left">Timestamp</th>
                                    <th className="py-3 px-6 text-left">Distributor</th>
                                    <th className="py-3 px-6 text-left">Serial</th>
                                    <th className="py-3 px-6 text-left">Deviation (KM)</th>
                                    <th className="py-3 px-6 text-left">Registered Loc</th>
                                    <th className="py-3 px-6 text-left">Actual Loc</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 text-sm font-light">
                                {anomalies.map((anomaly) => (
                                    <tr key={anomaly._id} className="border-b border-gray-200 hover:bg-gray-100">
                                        <td className="py-3 px-6 text-left whitespace-nowrap">
                                            {new Date(anomaly.timestamp).toLocaleString()}
                                        </td>
                                        <td className="py-3 px-6 text-left">
                                            <div className="flex items-center">
                                                <span className="font-medium">{anomaly.distributorId?.username || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-6 text-left">
                                            {anomaly.serial} <span className="text-xs bg-gray-200 px-1 rounded">{anomaly.itemType}</span>
                                        </td>
                                        <td className="py-3 px-6 text-left font-bold text-red-500">
                                            {anomaly.distanceKm.toFixed(2)} km
                                        </td>
                                        <td className="py-3 px-6 text-left">
                                            {anomaly.expectedLocation.lat.toFixed(4)}, {anomaly.expectedLocation.lng.toFixed(4)}
                                        </td>
                                        <td className="py-3 px-6 text-left">
                                            {anomaly.actualLocation.lat.toFixed(4)}, {anomaly.actualLocation.lng.toFixed(4)}
                                        </td>
                                    </tr>
                                ))}
                                {anomalies.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-6 text-center text-gray-500">
                                            No anomalies detected. System is secure.
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
