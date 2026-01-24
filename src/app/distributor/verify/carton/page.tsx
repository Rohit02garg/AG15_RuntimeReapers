'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyCartonPage() {
    const router = useRouter();
    const [serial, setSerial] = useState('');
    const [location, setLocation] = useState('');
    const [status, setStatus] = useState('RECEIVED');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const gps = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                try {
                    const res = await fetch('/api/distributor/scan', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ serial, location, status, type: 'CARTON', gps })
                    });

                    const data = await res.json();
                    if (res.ok) {
                        setMessage('Success: ' + data.message);
                        setSerial('');
                    } else {
                        setMessage('Error: ' + data.message);
                    }
                } catch (err) {
                    setMessage('Network Error');
                } finally {
                    setLoading(false);
                }
            }, (error) => {
                submitWithoutGps();
            });
        } else {
            submitWithoutGps();
        }
    };

    const submitWithoutGps = async () => {
        try {
            const res = await fetch('/api/distributor/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ serial, location, status, type: 'CARTON' })
            });
            const data = await res.json();
            if (res.ok) setMessage('Success: ' + data.message);
            else setMessage('Error: ' + data.message);
        } catch (err) {
            setMessage('Network Error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-8 bg-gray-900 text-white">
            <div className="w-full max-w-md bg-gray-800 p-8 rounded shadow-lg border border-gray-700">
                <button onClick={() => router.push('/distributor/dashboard')} className="text-gray-400 text-sm mb-4 hover:text-white">
                    &larr; Back to Dashboard
                </button>
                <h1 className="text-2xl font-bold mb-6 text-green-400">Verify Carton</h1>

                <form onSubmit={handleScan} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm mb-1 text-gray-300">Carton Serial (Scan QR)</label>
                        <input
                            className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-green-500 text-white"
                            value={serial}
                            onChange={e => setSerial(e.target.value)}
                            placeholder="Enter Carton Serial..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1 text-gray-300">Current Location Hub</label>
                        <input
                            className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-green-500 text-white"
                            value={location}
                            onChange={e => setLocation(e.target.value)}
                            placeholder="e.g. Local Warehouse"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1 text-gray-300">Action</label>
                        <select
                            className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-green-500 text-white"
                            value={status}
                            onChange={e => setStatus(e.target.value)}
                        >
                            <option value="RECEIVED">Mark as RECEIVED</option>
                            <option value="SHIPPED">Mark as SHIPPED</option>
                            <option value="DELIVERED">Mark as DELIVERED</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-4 bg-green-600 text-white py-3 rounded font-bold hover:bg-green-500 disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : 'Verify & Update Carton'}
                    </button>

                    {message && (
                        <div className={`mt-4 p-3 rounded text-center text-sm ${message.startsWith('Success') ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                            {message}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
