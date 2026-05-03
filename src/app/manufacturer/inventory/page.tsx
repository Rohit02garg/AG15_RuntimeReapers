'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Box, CheckCircle, Package, Layers, Download, Trash2, Edit2, Search, Copy, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function InventoryPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const router = useRouter();

    // Drill-down state
    const [view, setView] = useState<'PALLET' | 'CARTON' | 'UNIT'>('PALLET');
    const [history, setHistory] = useState<{ id: string, type: string }[]>([]); // To support "Back"

    const fetchItems = async (type: string, parentId: string | null = null, search: string = '') => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('type', type);
            if (parentId) params.append('parentId', parentId);
            if (search) params.append('search', search);

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
        // Debounce search
        const timeout = setTimeout(() => {
            const currentParentId = view === 'PALLET' ? null : history[history.length - 1]?.id === 'root' ? null : history[history.length - 1]?.id;
            fetchItems(view, currentParentId, searchQuery);
        }, 300);
        return () => clearTimeout(timeout);
    }, [searchQuery]);

    const handleItemClick = (item: any) => {
        setSearchQuery(''); // clear search on drill-down
        if (view === 'PALLET') {
            setHistory([...history, { id: 'root', type: 'PALLET' }]); // Push current state
            fetchItems('CARTON', item._id);
        } else if (view === 'CARTON') {
            setHistory([...history, { id: item.parentId, type: 'CARTON' }]);
            fetchItems('UNIT', item._id);
        }
    };

    const handleBack = () => {
        setSearchQuery(''); // clear search on go back
        if (view === 'PALLET') {
            router.back();
            return;
        }
        fetchItems('PALLET');
    };

    const handleDelete = async (e: React.MouseEvent, item: any) => {
        e.stopPropagation(); // Prevent drill-down click

        const typeName = view === 'PALLET' ? 'Pallet' : view === 'CARTON' ? 'Carton' : 'Unit';
        const cascadeWarning = view === 'PALLET'
            ? ' This will also delete ALL its Cartons and Units.'
            : view === 'CARTON'
            ? ' This will also delete ALL its Units.'
            : '';

        if (!confirm(`Delete this ${typeName} (${item.serial})?${cascadeWarning}\n\nThis action cannot be undone.`)) return;

        setDeleting(item._id);
        try {
            const res = await fetch(`/api/manufacturer/items?id=${item._id}&type=${view}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setItems(prev => prev.filter(i => i._id !== item._id));
            } else {
                alert('Failed: ' + data.message);
            }
        } catch (err) {
            alert('Network error');
        } finally {
            setDeleting(null);
        }
    };

    const handleRename = async (e: React.MouseEvent, item: any) => {
        e.stopPropagation();
        
        const typeName = view === 'PALLET' ? 'Pallet' : view === 'CARTON' ? 'Carton' : 'Unit';
        const newName = prompt(`Enter a new name/alias for this ${typeName}:`, item.name || '');
        
        if (newName === null) return; // Cancelled
        
        try {
            const res = await fetch(`/api/manufacturer/items`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: item._id, type: view, name: newName })
            });
            const data = await res.json();
            if (data.success) {
                setItems(prev => prev.map(i => i._id === item._id ? { ...i, name: newName } : i));
            } else {
                alert('Failed to rename: ' + data.message);
            }
        } catch (err) {
            alert('Network error');
        }
    };

    const downloadCSV = () => {
        if (items.length === 0) return;
        const headers = ['Serial', 'Status', 'Short Hash', 'Created At'];
        const rows = items.map((item: any) => [
            item.serial,
            item.status,
            item.shortHash || item.hash?.substring(0, 8) || 'N/A',
            new Date(item.createdAt).toISOString()
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `smarttrace_${view.toLowerCase()}_export_${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleCopy = (e: React.MouseEvent, text: string, key: string) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    return (
        <div className="flex min-h-screen flex-col p-8 bg-background text-foreground selection:bg-primary/30">
            <header className="flex justify-between items-center mb-12">
                <div>
                    <button onClick={handleBack} className="text-muted-foreground hover:text-white flex items-center gap-2 mb-2 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> {view === 'PALLET' ? 'Go Back' : 'Back to Pallets'}
                    </button>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        {view === 'PALLET' && <><Layers className="text-primary w-8 h-8" /> Digital Inventory <span className="text-muted-foreground text-lg font-normal ml-2"> (Pallets)</span></>}
                        {view === 'CARTON' && <><Package className="text-primary w-8 h-8" /> Pallet Contents <span className="text-muted-foreground text-lg font-normal ml-2"> (Cartons)</span></>}
                        {view === 'UNIT' && <><Box className="text-primary w-8 h-8" /> Carton Contents <span className="text-muted-foreground text-lg font-normal ml-2"> (Units)</span></>}
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by name or serial..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors w-64 placeholder:text-neutral-600"
                        />
                    </div>
                    {items.length > 0 && (
                        <button
                            onClick={downloadCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg text-primary text-sm font-bold transition-all hover:scale-105"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                    )}
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
                            {/* Delete Button */}
                            <button
                                onClick={(e) => handleDelete(e, item)}
                                disabled={deleting === item._id}
                                className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-500/0 hover:bg-red-500/10 text-transparent group-hover:text-red-400/70 hover:!text-red-400 transition-all z-10"
                                title={`Delete ${view === 'PALLET' ? 'Pallet & all contents' : view === 'CARTON' ? 'Carton & units' : 'Unit'}`}
                            >
                                {deleting === item._id ? (
                                    <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4" />
                                )}
                            </button>

                            <div className="flex justify-between items-start mb-4 pr-6">
                                <div>
                                    <h2 className="text-sm font-bold text-white tracking-wider uppercase mb-1 flex items-center gap-2">
                                        {item.name || (view === 'PALLET' ? 'Pallet SSCC' : view === 'CARTON' ? 'Carton Serial' : 'Unit Serial')}
                                        <button 
                                            onClick={(e) => handleRename(e, item)}
                                            className="text-muted-foreground hover:text-white transition-colors"
                                            title="Edit Name"
                                        >
                                            <Edit2 className="w-3 h-3" />
                                        </button>
                                    </h2>
                                    <div className="flex items-center gap-2 group/serial">
                                        <p className="font-mono text-xs text-muted-foreground truncate w-32" title={item.serial}>{item.serial}</p>
                                        <button 
                                            onClick={(e) => handleCopy(e, item.serial, item._id + '-serial')}
                                            className="text-muted-foreground hover:text-white transition-all opacity-0 group-hover/serial:opacity-100"
                                            title="Copy Serial"
                                        >
                                            {copiedKey === item._id + '-serial' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                        </button>
                                    </div>
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
                                <div className="flex justify-between items-center group/hash">
                                    <span className="text-muted-foreground">Short Hash</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-primary">{item.shortHash || item.hash?.substring(0, 8) || 'N/A'}</span>
                                        <button 
                                            onClick={(e) => handleCopy(e, item.shortHash || item.hash?.substring(0, 8) || '', item._id + '-hash')}
                                            className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-white transition-all opacity-0 group-hover/hash:opacity-100"
                                            title="Copy Hash"
                                        >
                                            {copiedKey === item._id + '-hash' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                        </button>
                                    </div>
                                </div>
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
