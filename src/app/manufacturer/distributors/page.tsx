'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

export default function DistributorsList() {
    const [distributors, setDistributors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchDistributors = async () => {
            try {
                const res = await fetch('/api/manufacturer/distributors');
                const data = await res.json();
                if (data.success) {
                    setDistributors(data.distributors);
                }
            } catch (err) {
                console.error("Failed to load distributors");
            } finally {
                setLoading(false);
            }
        };
        fetchDistributors();
    }, []);

    const handleDelete = async (id: string, username: string) => {
        if (!confirm(`Are you sure you want to DELETE distributor "${username}"? This action cannot be undone.`)) return;

        setDeleting(id);
        try {
            const res = await fetch(`/api/manufacturer/distributors/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setDistributors(prev => prev.filter(d => d._id !== id));
            } else {
                alert('Failed: ' + data.message);
            }
        } catch (err) {
            alert('Network error');
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className="flex min-h-screen flex-col p-8 bg-background text-foreground relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 right-1/2 translate-x-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="z-10 max-w-6xl mx-auto w-full space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold neon-text text-white">Distributors</h1>
                        <button onClick={() => router.back()} className="text-muted-foreground hover:text-white transition-colors text-sm flex items-center gap-1 mt-2">
                            &larr; Go Back
                        </button>
                    </div>
                    <Link href="/manufacturer/distributors/add">
                        <button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-full font-bold shadow-md transition-all transform hover:scale-105 flex items-center gap-2 border border-primary/50">
                            <span>+</span> Register New Node
                        </button>
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-20 animate-pulse text-muted-foreground">
                        Loading network nodes...
                    </div>
                ) : (
                    <div className="glass-panel rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-white/10">
                                <thead className="bg-white/5">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider">Business ID</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider">Username</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider">Location</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider">Phone</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider">Registered On</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider">Coordinates</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-primary uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10 bg-transparent">
                                    {distributors.map((d) => (
                                        <tr key={d._id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-orange-400">{d.businessId || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-white group-hover:text-primary transition-colors">{d.username}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-neutral-300">
                                                {d.location?.city}, {d.location?.pincode}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                {d.email || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                {d.phone || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                                                {new Date(d.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-neutral-500">
                                                {d.location?.geo?.coordinates ?
                                                    `${d.location.geo.coordinates[1].toFixed(4)}, ${d.location.geo.coordinates[0].toFixed(4)}` :
                                                    'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-3">
                                                    <Link href={`/manufacturer/distributors/${d._id}`} className="text-primary hover:text-primary/80 transition-colors">
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(d._id, d.username)}
                                                        disabled={deleting === d._id}
                                                        className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 p-1 rounded hover:bg-red-500/10"
                                                        title="Delete Distributor"
                                                    >
                                                        {deleting === d._id ? (
                                                            <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {distributors.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-20 text-center text-muted-foreground">
                                                No active nodes found in the network. <br />
                                                <span className="text-sm opacity-50">Click "Register New Node" to begin expansion.</span>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
