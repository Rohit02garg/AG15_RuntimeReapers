'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Box, CheckCircle, Package, Layers } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function InventoryPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

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
            router.push('/manufacturer/dashboard');
            return;
        }
        fetchItems('PALLET');
    };

    return (
        <div className="flex min-h-screen flex-col p-8 bg-background text-foreground selection:bg-primary/30">
            <header className="flex justify-between items-center mb-12">
                <div>
                    <button onClick={handleBack} className="text-muted-foreground hover:text-white flex items-center gap-2 mb-2 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> {view === 'PALLET' ? 'Dashboard' : 'Back to Pallets'}
                    </button>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        {view === 'PALLET' && <><Layers className="text-primary w-8 h-8" /> Digital Inventory <span className="text-muted-foreground text-lg font-normal ml-2"> (Pallets)</span></>}
                        {view === 'CARTON' && <><Package className="text-primary w-8 h-8" /> Pallet Contents <span className="text-muted-foreground text-lg font-normal ml-2"> (Cartons)</span></>}
                        {view === 'UNIT' && <><Box className="text-primary w-8 h-8" /> Carton Contents <span className="text-muted-foreground text-lg font-normal ml-2"> (Units)</span></>}
                    </h1>
                </div>
            </header>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="h-12 w-12 border-4 border-t-primary border-gray-700 rounded-full animate-spin shadow-sm"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {items.map((item) => (
                        <div
                            key={item._id}
                            onClick={() => handleItemClick(item)}
                            className={`glass-panel p-6 rounded-xl relative group transition-all duration-300 hover:bg-white/5 cursor-pointer border border-white/5 hover:border-primary/30`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-sm font-bold text-white tracking-wider uppercase mb-1">
                                        {view === 'PALLET' ? 'Pallet SSCC' : view === 'CARTON' ? 'Carton Serial' : 'Unit Serial'}
                                    </h2>
                                    <p className="font-mono text-xs text-muted-foreground truncate w-32">{item.serial}</p>
                                </div>
                                <div className={`px-2 py-0.5 rounded text-[10px] font-bold border ${item.status === 'CREATED' ? 'border-green-800 text-green-500 bg-green-950/30' : 'border-blue-800 text-blue-500 bg-blue-950/30'}`}>
                                    {item.status}
                                </div>
                            </div>

                            <div className="bg-white p-2 rounded-lg w-fit mx-auto shadow-sm mb-4">
                                <QRCodeSVG
                                    value={
                                        view === 'UNIT'
                                            ? `http://localhost:3000/verify?s=${item.serial}&c=${item.shortHash || item.hash?.substring(0, 8)}`
                                            : item.serial
                                    }
                                    size={100}
                                    fgColor="#000000"
                                    bgColor="#ffffff"
                                    level="L"
                                />
                            </div>

                            <div className="text-left w-full text-xs space-y-2 border-t border-white/5 pt-4">
                                {view !== 'PALLET' && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Short Hash</span>
                                        <span className="font-mono text-primary">{item.shortHash || item.hash?.substring(0, 8) || 'N/A'}</span>
                                    </div>
                                )}
                                <p className="text-muted-foreground text-[10px] uppercase text-center mt-2 group-hover:text-white transition-colors">
                                    {view === 'UNIT' ? 'Leaf Item' : 'Click to View Contents →'}
                                </p>
                            </div>
                        </div>
                    ))}

                    {items.length === 0 && (
                        <div className="col-span-full py-20 text-center glass-panel rounded-xl border-dashed border-2 border-white/10">
                            <Box className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <p className="text-muted-foreground">No items found in this container.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
