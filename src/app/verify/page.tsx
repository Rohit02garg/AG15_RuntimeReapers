'use client';

import { useState } from 'react';

export default function VerifyPage() {
    const [serial, setSerial] = useState('');
    const [code, setCode] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

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
        <div className="flex min-h-screen flex-col items-center p-8 bg-gray-50 text-black">
            <h1 className="text-3xl font-bold mb-8 text-blue-700">SmartTrace Verification</h1>

            <div className="w-full max-w-md bg-white p-6 rounded shadow-md">
                <form onSubmit={handleVerify} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1">Serial Number</label>
                        <input
                            className="w-full border p-2 rounded"
                            value={serial}
                            onChange={e => setSerial(e.target.value)}
                            placeholder="e.g. 1234567..."
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Verification Code (8 chars)</label>
                        <input
                            className="w-full border p-2 rounded"
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            placeholder="e.g. a1b2c3d4"
                            required
                            maxLength={8}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : 'Verify Authenticity'}
                    </button>
                </form>
            </div>

            {result && (
                <div className={`mt-8 p-6 rounded w-full max-w-md border-2 ${result.status === 'VALID' ? 'border-green-500 bg-green-50' :
                        result.status === 'SUSPECT' ? 'border-orange-500 bg-orange-50' :
                            'border-red-500 bg-red-50'
                    }`}>
                    <h2 className={`text-2xl font-bold mb-2 ${result.status === 'VALID' ? 'text-green-700' :
                            result.status === 'SUSPECT' ? 'text-orange-700' :
                                'text-red-700'
                        }`}>
                        {result.status}
                    </h2>
                    <p className="mb-4">{result.message}</p>

                    {result.item && (
                        <div className="text-sm">
                            <h3 className="font-bold border-b pb-1 mb-2">Product Journey (Red Thread)</h3>
                            <ul className="space-y-2">
                                {result.item.history.map((event: any, i: number) => (
                                    <li key={i} className="flex justify-between text-gray-700">
                                        <span>{event.status} @ {event.location}</span>
                                        <span className="text-gray-500 text-xs">{new Date(event.timestamp).toLocaleString()}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
