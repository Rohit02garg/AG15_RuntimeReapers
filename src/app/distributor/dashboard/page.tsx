'use client';

import Link from 'next/link';

export default function DistributorDashboard() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-black text-white relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 right-1/2 translate-x-1/2 w-[800px] h-[400px] bg-blue-900/20 blur-[120px] rounded-full pointer-events-none" />

            <div className="z-10 w-full max-w-6xl space-y-12">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4 neon-text text-white">Distributor Terminal</h1>
                    <p className="text-neutral-400">Manage intake, verification, and reporting.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Pallet Verification */}
                    <Link href="/distributor/verify/pallet" className="group">
                        <div className="glass-panel p-8 rounded-2xl border border-white/10 hover:border-blue-500/50 hover:bg-white/5 transition-all text-center h-full flex flex-col items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform">
                                🏗️
                            </div>
                            <h2 className="text-xl font-bold mb-2 text-white">Verify Pallet</h2>
                            <p className="text-sm text-neutral-400">Scan SSCC labels for bulk intake verification.</p>
                        </div>
                    </Link>

                    {/* Carton Verification */}
                    <Link href="/distributor/verify/carton" className="group">
                        <div className="glass-panel p-8 rounded-2xl border border-white/10 hover:border-green-500/50 hover:bg-white/5 transition-all text-center h-full flex flex-col items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform">
                                📦
                            </div>
                            <h2 className="text-xl font-bold mb-2 text-white">Verify Carton</h2>
                            <p className="text-sm text-neutral-400">Scan individual Carton Serials for checking.</p>
                        </div>
                    </Link>

                    {/* Submit Report */}
                    <Link href="/distributor/report" className="group">
                        <div className="glass-panel p-8 rounded-2xl border border-white/10 hover:border-orange-500/50 hover:bg-white/5 transition-all text-center h-full flex flex-col items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform">
                                📝
                            </div>
                            <h2 className="text-xl font-bold mb-2 text-white">Submit Report</h2>
                            <p className="text-sm text-neutral-400">Send text reports or feedback to manufacturer.</p>
                        </div>
                    </Link>
                </div>

                <div className="text-center mt-12">
                    <Link href="/" className="text-sm text-neutral-500 hover:text-white transition-colors">
                        Logout / Return Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
