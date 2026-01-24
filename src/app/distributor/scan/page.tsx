'use client';

import { useState } from 'react';

export default function DistributorScanner() {
    const [serial, setSerial] = useState('');
    const [location, setLocation] = useState('');
    const [status, setStatus] = useState('RECEIVED');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const res = await fetch('/api/distributor/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ serial, location, status })
            });

            const data = await res.json();
            if (res.ok) {
                setMessage('Success: ' + data.message);
                setSerial(''); // Clear for next scan
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
        <div className="flex min-h-screen items-center justify-center p-8 bg-gray-800 text-white">
            <div className="w-full max-w-md bg-gray-900 p-8 rounded shadow-lg border border-gray-700">
                <h1 className="text-2xl font-bold mb-6 text-blue-400">Distributor Scanner</h1>

                <form onSubmit={handleScan} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm mb-1">Serial Number (Scan QR)</label>
                        <input
                            className="w-full p-3 rounded bg-gray-800 border border-gray-600 focus:border-blue-500 text-white"
                            value={serial}
                            onChange={e => setSerial(e.target.value)}
                            placeholder="Scan or type serial..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Current Location</label>
                        <input
                            className="w-full p-3 rounded bg-gray-800 border border-gray-600 focus:border-blue-500 text-white"
                            value={location}
                            onChange={e => setLocation(e.target.value)}
                            placeholder="e.g. Warehouse A"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Update Status</label>
                        <select
                            className="w-full p-3 rounded bg-gray-800 border border-gray-600 focus:border-blue-500 text-white"
                            value={status}
                            onChange={e => setStatus(e.target.value)}
                        >
                            <option value="RECEIVED">RECEIVED</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-4 bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-500 disabled:opacity-50"
                    >
                        {loading ? 'Updating...' : 'Update Tracking'}
                    </button>

                    {message && (
                        <div className={`mt-4 p-3 rounded text-center ${message.startsWith('Success') ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                            {message}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
