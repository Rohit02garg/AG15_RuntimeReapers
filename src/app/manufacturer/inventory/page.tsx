'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function InventoryPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const res = await fetch('/api/manufacturer/items');
                const data = await res.json();
                if (data.success) {
                    setItems(data.items);
                }
            } catch (err) {
                console.error("Failed to load inventory");
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, []);

    return (
        <div className="flex min-h-screen flex-col p-8 bg-gray-100 text-black">
            <h1 className="text-3xl font-bold mb-8">Generated Labels (Units)</h1>
            <a href="/manufacturer/dashboard" className="text-blue-600 underline mb-6 block">&larr; Back to Dashboard</a>

            {loading ? (
                <p>Loading labels...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {items.map((item) => (
                        <div key={item._id} className="bg-white p-4 rounded shadow border border-gray-200 flex flex-col items-center text-center">
                            <h2 className="text-md font-bold mb-1">Unit Serial</h2>
                            <p className="font-mono text-xs bg-gray-100 p-1 rounded mb-2">{item.serial}</p>

                            <div className="border-4 border-white shadow-lg mb-4">
                                <QRCodeSVG
                                    value={`http://localhost:3000/verify?s=${item.serial}&c=${item.shortHash || item.hash?.substring(0, 8)}`}
                                    size={120}
                                    fgColor="#000000"
                                    bgColor="#ffffff"
                                    level="M"
                                />
                            </div>

                            <div className="text-left w-full text-xs space-y-1">
                                <p><strong>Short Hash:</strong> <span className="font-mono bg-yellow-100 px-1">{item.shortHash || item.hash?.substring(0, 8) || 'N/A'}</span></p>
                                <p><strong>Status:</strong> <span className="text-blue-600">{item.status}</span></p>
                                <p><strong>Generated:</strong> {new Date(item.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}

                    {items.length === 0 && (
                        <p className="col-span-3 text-center text-gray-500">No units generated yet. Go to Dashboard to generate.</p>
                    )}
                </div>
            )}
        </div>
    );
}
