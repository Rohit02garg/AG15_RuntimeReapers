'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DistributorReport() {
    const [content, setContent] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;
    const isOverLimit = wordCount > 300;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);

        try {
            const res = await fetch('/api/distributor/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            });

            const data = await res.json();
            if (res.ok) {
                setMessage('Report submitted successfully!');
                setContent('');
            } else {
                setMessage(data.message || 'Submission failed');
            }
        } catch (err) {
            setMessage('Failed to submit report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col p-8 bg-black text-white relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/20 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-4xl mx-auto w-full space-y-8 z-10">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Submit Report</h1>
                        <p className="text-neutral-400">Send updates or feedback directly to the manufacturer.</p>
                    </div>
                    <Link href="/distributor/dashboard" className="text-sm hover:text-blue-400 transition-colors">
                        &larr; Back to Dashboard
                    </Link>
                </div>

                <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-neutral-300 mb-2 uppercase tracking-wider">
                                Report Content
                            </label>
                            <textarea
                                className={`w-full h-64 bg-black/50 border ${isOverLimit ? 'border-red-500' : 'border-white/10'} rounded-lg p-4 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none`}
                                placeholder="Type your report here (max 300 words)..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                            ></textarea>
                            <div className={`text-right text-xs mt-2 ${isOverLimit ? 'text-red-500' : 'text-neutral-500'}`}>
                                Word Count: {wordCount} / 300
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            {message && (
                                <p className={`text-sm ${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
                                    {message}
                                </p>
                            )}
                            <button
                                type="submit"
                                disabled={loading || isOverLimit || wordCount === 0}
                                className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? 'Sending...' : 'Submit Report'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
