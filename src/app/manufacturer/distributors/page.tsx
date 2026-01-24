'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DistributorsList() {
    const [distributors, setDistributors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDistributors = async () => {
            try {
                const res = await fetch('/api/manufacturer/distributors');
                const data = await res.json();
                if (data.success) {
                    setDistributors(data.distributors);
                }
            } catch (err) {
                console.error("Failed to load distributors");
            } finally {
                setLoading(false);
            }
        };
        fetchDistributors();
    }, []);

    return (
        <div className="flex min-h-screen flex-col p-8 bg-gray-100 text-black">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Distributors</h1>
                    <a href="/manufacturer/dashboard" className="text-blue-600 underline text-sm">&larr; Back to Dashboard</a>
                </div>
                <Link href="/manufacturer/distributors/add">
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2">
                        <span>+</span> Add Distributor
                    </button>
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading distributors...</div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered On</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coordinates</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {distributors.map((d) => (
                                <tr key={d._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">{d.username}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {d.location?.city}, {d.location?.pincode}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(d.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                                        {d.location?.geo?.coordinates ?
                                            `${d.location.geo.coordinates[1].toFixed(4)}, ${d.location.geo.coordinates[0].toFixed(4)}` :
                                            'N/A'}
                                    </td>
                                </tr>
                            ))}
                            {distributors.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                                        No distributors registered yet. Click "Add Distributor" to start.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
