'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function RedThreadPage() {
    const params = useParams();
    const serial = params.serial as string;
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!serial) return;

        const fetchData = async () => {
            try {
                const res = await fetch(`/api/public/verify/${serial}`);
                const json = await res.json();
                if (json.success) {
                    setData(json.item);
                } else {
                    setError(json.message || 'Verification Failed');
                }
            } catch (err) {
                setError('Network Error. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [serial]);

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-black text-white">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-12 w-12 border-4 border-t-primary border-gray-700 rounded-full animate-spin mb-4 shadow-sm"></div>
                <p className="text-xl font-mono text-primary tracking-widest neon-text">TRACING LINEAGE...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="flex h-screen items-center justify-center bg-black text-white p-8">
            <div className="text-center max-w-lg border border-orange-800 p-8 rounded bg-orange-900/20 backdrop-blur">
                <h1 className="text-4xl font-bold text-orange-500 mb-4">CONNECTION LOST</h1>
                <p className="text-gray-300 mb-6">{error}</p>
                <a href="/verify" className="text-orange-400 underline hover:text-orange-300">Try Another ID</a>
            </div>
        </div>
    );

    const isSuspect = data?.integrity === 'SUSPECT';
    const isRecalled = data?.status === 'RECALLED';

    let primaryColor = 'green';
    if (isSuspect) primaryColor = 'orange';
    if (isRecalled) primaryColor = 'red';

    return (
        <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-primary/30">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur border-b border-gray-800">
                <div className="max-w-3xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full animate-pulse bg-${primaryColor}-500 shadow-[0_0_10px_var(--tw-shadow-color)] shadow-${primaryColor}-500/50`}></div>
                        <h1 className="text-xl font-bold tracking-wider">SMART<span className="text-white">TRACE</span></h1>
                    </div>
                    <div>
                        <span className={`px-3 py-1 rounded text-xs font-bold tracking-widest border 
                            ${isRecalled ? 'border-red-600 text-red-500 bg-red-900/20' :
                                isSuspect ? 'border-orange-600 text-orange-500 bg-orange-900/20' :
                                    'border-green-600 text-green-500 bg-green-900/20'}`}>
                            {isRecalled ? 'RECALLED' : (data?.integrity || 'VERIFIED')}
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-32 pb-20 px-6 max-w-3xl mx-auto relative">

                {/* Product Info */}
                <div className="mb-16 text-center">
                    {isRecalled && (
                        <div className="mb-8 p-6 border-2 border-red-600 bg-red-950/30 rounded-lg animate-pulse">
                            <h1 className="text-3xl font-black text-red-500 tracking-widest mb-2">⚠ PRODUCT RECALLED ⚠</h1>
                            <p className="text-red-200 text-sm font-mono">DO NOT SELL OR CONSUME. RETURN TO MANUFACTURER IMMEDIATELY.</p>
                        </div>
                    )}

                    <h2 className="text-sm text-gray-500 uppercase tracking-[0.2em] mb-2">{data?.type}</h2>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4 glitch-text">
                        {data?.serial}
                    </h1>
                    <div className="flex justify-center gap-4 text-xs text-gray-400 font-mono">
                        <span>HASH: {data?.hash?.substring(0, 8)}...</span>
                        <span>•</span>
                        <span>{new Date(data?.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>

                {/* THE DIGITAL THREAD TIMELINE */}
                <div className="relative">
                    {/* The Center Line */}
                    <div className={`absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 -ml-px bg-gradient-to-b from-transparent ${isRecalled ? 'via-red-600' : isSuspect ? 'via-orange-600' : 'via-green-600'} to-transparent opacity-50`}></div>

                    <div className="space-y-12">
                        {data?.history.map((event: any, index: number) => {
                            const isEventSuspect = event.status === 'SUSPECT';
                            const isEventRecalled = event.status === 'RECALLED';

                            return (
                                <div key={index} className={`relative flex items-center md:justify-between group ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>

                                    {/* Timeline Node */}
                                    <div className="absolute left-4 md:left-1/2 -ml-3 md:-ml-3 w-6 h-6 rounded-full border-4 border-black bg-gray-800 z-10 shadow-[0_0_15px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                                        <div className={`w-2 h-2 rounded-full ${isEventRecalled ? 'bg-red-500 animate-ping' : isEventSuspect ? 'bg-orange-500 animate-ping' : 'bg-gray-400 group-hover:bg-white'}`}></div>
                                    </div>

                                    {/* Empty Space for Grid */}
                                    <div className="w-0 md:w-5/12"></div>

                                    {/* Content Card */}
                                    <div className={`ml-12 md:ml-0 w-full md:w-5/12 bg-gray-900/50 border ${isEventRecalled ? 'border-red-900/50' : 'border-gray-800'} p-6 rounded-lg backdrop-blur-sm hover:border-gray-600 transition-colors shadow-lg`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className={`font-bold text-lg tracking-wide ${isEventRecalled ? 'text-red-500' : isEventSuspect ? 'text-orange-500' : 'text-white'}`}>
                                                {event.status}
                                            </h3>
                                            <span className="text-xs font-mono text-gray-500">
                                                {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                            {event.location}
                                        </p>

                                        {event.scannedBy && (
                                            <p className="text-xs text-gray-600 font-mono mt-2">
                                                VERIFIED BY: {event.scannedBy}
                                            </p>
                                        )}

                                        {event.notes && (
                                            <div className="mt-3 p-2 bg-orange-900/20 border border-orange-900/50 rounded text-xs text-orange-300 font-mono">
                                                ⚠ {event.notes}
                                            </div>
                                        )}
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer / End of Line */}
                <div className="text-center mt-20 pt-10 border-t border-gray-800">
                    <p className="text-gray-600 text-xs tracking-widest uppercase">Secured by SmartTrace Blockchain</p>
                </div>

            </main>
        </div>
    );
}
