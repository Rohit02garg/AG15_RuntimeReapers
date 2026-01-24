'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function InventoryPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Drill-down state
    const [view, setView] = useState<'PALLET' | 'CARTON' | 'UNIT'>('PALLET');
    const [history, setHistory] = useState<{ id: string, type: string }[]>([]); // To support "Back"

    const fetchItems = async (type: string, parentId: string | null = null) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('type', type);
            if (parentId) params.append('parentId', parentId);

            const res = await fetch(`/api/manufacturer/items?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setItems(data.items);
                setView(type as any);
            }
        } catch (err) {
            console.error("Failed to load inventory");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems('PALLET');
    }, []);

    const handleItemClick = (item: any) => {
        if (view === 'PALLET') {
            setHistory([...history, { id: 'root', type: 'PALLET' }]); // Push current state
            fetchItems('CARTON', item._id);
        } else if (view === 'CARTON') {
            setHistory([...history, { id: item.parentId, type: 'CARTON' }]);
            fetchItems('UNIT', item._id);
        }
    };

    const handleBack = () => {
        if (view === 'PALLET') {
            window.location.href = '/manufacturer/dashboard';
            return;
        }

        // Simple back logic: Reset to Pallet if deep, or just reload Pallets.
        // For MVP, just going back to Pallet level is safest if history stack is complex.
        // Let's go back one step properly.
        if (view === 'UNIT') {
            // We need the Pallet ID to verify Cartons, but we might not have it easily stored without complex state.
            // Let's just go back to TOP (Pallets) for simplicity or store better history.
            // Actually, querying Cartons requires Pallet ID.
            fetchItems('PALLET');
        } else {
            fetchItems('PALLET');
        }
    };

    return (
        <div className="flex min-h-screen flex-col p-8 bg-gray-100 text-black">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">
                    {view === 'PALLET' && 'Inventory (Pallets)'}
                    {view === 'CARTON' && 'Pallet Contents (Cartons)'}
                    {view === 'UNIT' && 'Carton Contents (Units)'}
                </h1>
                <button onClick={handleBack} className="text-blue-600 underline">
                    {view === 'PALLET' ? '← Back to Dashboard' : '← Back to Pallets'}
                </button>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {items.map((item) => (
                        <div
                            key={item._id}
                            onClick={() => handleItemClick(item)}
                            className={`bg-white p-4 rounded shadow border border-gray-200 flex flex-col items-center text-center transition-transform hover:scale-105 cursor-pointer hover:border-blue-400`}
                        >
                            <h2 className="text-md font-bold mb-1">
                                {view === 'PALLET' ? 'Pallet SSCC' : view === 'CARTON' ? 'Carton Serial' : 'Unit Serial'}
                            </h2>
                            <p className="font-mono text-xs bg-gray-100 p-1 rounded mb-2 w-full truncate">{item.serial}</p>

                            <div className="border-4 border-white shadow-lg mb-4">
                                <QRCodeSVG
                                    value={
                                        view === 'UNIT'
                                            ? `http://localhost:3000/verify?s=${item.serial}&c=${item.shortHash || item.hash?.substring(0, 8)}`
                                            : item.serial
                                    }
                                    size={120}
                                    fgColor="#000000"
                                    bgColor="#ffffff"
                                    level="M"
                                />
                            </div>

                            <div className="text-left w-full text-xs space-y-1">
                                {view !== 'PALLET' && (
                                    <p><strong>Short Hash:</strong> <span className="font-mono bg-yellow-100 px-1">{item.shortHash || item.hash?.substring(0, 8) || 'N/A'}</span></p>
                                )}
                                <p><strong>Status:</strong> <span className={`font-bold ${item.status === 'CREATED' ? 'text-green-600' : 'text-blue-600'}`}>{item.status}</span></p>
                                <p className="text-gray-400 text-[10px] uppercase mt-2">
                                    {view === 'UNIT' ? 'Leaf Node' : 'Click to View Contents'}
                                </p>
                            </div>
                        </div>
                    ))}

                    {items.length === 0 && (
                        <p className="col-span-3 text-center text-gray-500">No items found in this container.</p>
                    )}
                </div>
            )}
        </div>
    );
}
