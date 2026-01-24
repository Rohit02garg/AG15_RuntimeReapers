'use client';

import Link from 'next/link';

export default function DistributorDashboard() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-900 text-white">
            <h1 className="text-3xl font-bold mb-12 text-blue-400">Distributor Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                {/* Pallet Verification */}
                <Link href="/distributor/verify/pallet" className="group">
                    <div className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500 transition-all hover:bg-gray-750 flex flex-col items-center text-center h-full">
                        <div className="bg-blue-900/50 p-4 rounded-full mb-6 group-hover:bg-blue-600 transition-colors">
                            <span className="text-4xl">📦</span>
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-white">Verify Pallet</h2>
                        <p className="text-gray-400">Scan SSCC labels to verify intake of Pallets.</p>
                    </div>
                </Link>

                {/* Carton Verification */}
                <Link href="/distributor/verify/carton" className="group">
                    <div className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700 hover:border-green-500 transition-all hover:bg-gray-750 flex flex-col items-center text-center h-full">
                        <div className="bg-green-900/50 p-4 rounded-full mb-6 group-hover:bg-green-600 transition-colors">
                            <span className="text-4xl">📦</span>
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-white">Verify Carton</h2>
                        <p className="text-gray-400">Scan Carton Serials to verify individual boxes.</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
