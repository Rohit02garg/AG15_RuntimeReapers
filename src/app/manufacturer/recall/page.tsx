'use client';

import { useState } from 'react';

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
        <div className="flex min-h-screen items-center justify-center p-8 bg-red-50 text-black">
            <div className="w-full max-w-lg bg-white p-8 rounded shadow-xl border-t-4 border-red-600">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-red-700">⚠️ Product Decommissioning</h1>
                    <a href="/manufacturer/dashboard" className="text-gray-500 hover:underline text-sm">Cancel</a>
                </div>

                <p className="mb-6 text-gray-600 text-sm">
                    Enter the Serial Number of the Pallet, Carton, or Unit you wish to recall.
                    This will flag the item and all its contents as <strong>RECALLED</strong> globally.
                </p>

                <form onSubmit={handleRecall} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-bold mb-1">Serial Number</label>
                        <input
                            type="text"
                            placeholder="e.g. P-12345678..."
                            className="w-full border p-3 rounded focus:ring-2 focus:ring-red-500 outline-none"
                            value={serial}
                            onChange={e => setSerial(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1">Reason for Recall</label>
                        <select
                            className="w-full border p-3 rounded focus:ring-2 focus:ring-red-500 outline-none bg-white"
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                        >
                            <option>Safety Concern</option>
                            <option>Expired Batch</option>
                            <option>Stolen / Lost</option>
                            <option>Regulatory Compliance</option>
                            <option>Other</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-red-600 text-white font-bold py-3 rounded hover:bg-red-700 transition-colors disabled:opacity-50 mt-2"
                    >
                        {loading ? 'Processing...' : 'DECOMMISSION ITEM'}
                    </button>

                    {message && (
                        <div className={`mt-4 p-3 rounded text-center text-sm font-bold ${message.includes('Error') ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                            {message}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
