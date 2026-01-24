'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function EditDistributor({ params }: { params: Promise<{ id: string }> }) {
    // Deserialize params using React.use() as per Next.js 15
    const { id } = use(params);
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [businessId, setBusinessId] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState('');
    const [pincode, setPincode] = useState('');
    const [gps, setGps] = useState('');
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState<any>({});

    useEffect(() => {
        const fetchDistributor = async () => {
            try {
                const res = await fetch(`/api/manufacturer/distributors/${id}`);
                const data = await res.json();
                if (data.success) {
                    const d = data.distributor;
                    setUsername(d.username);
                    setBusinessId(d.businessId || '');
                    setEmail(d.email || '');
                    setPhone(d.phone || '');
                    if (d.location) {
                        setCity(d.location.city || '');
                        setPincode(d.location.pincode || '');
                        if (d.location.geo && d.location.geo.coordinates) {
                            // [Long, Lat] -> "Lat, Long"
                            const [lng, lat] = d.location.geo.coordinates;
                            setGps(`${lat}, ${lng}`);
                        }
                    }
                } else {
                    setMessage("Failed to load distributor details");
                }
            } catch (err) {
                setMessage("Error loading data");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchDistributor();
        }
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setErrors({});

        try {
            const res = await fetch(`/api/manufacturer/distributors/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ businessId, email, phone, city, pincode, gps })
            });

            const data = await res.json();
            if (res.ok) {
                setMessage('Distributor updated and notified successfully!');
                setTimeout(() => {
                    router.push('/manufacturer/distributors');
                }, 2000);
            } else {
                setMessage(data.message || 'Update failed');
            }
        } catch (err) {
            setMessage('Failed to update node');
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Data...</div>;
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-8 bg-background text-foreground relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />

            <div className="z-10 w-full max-w-lg font-mono text-sm glass-panel p-10 rounded-2xl shadow-2xl relative border border-white/10">
                <button onClick={() => router.back()} className="text-muted-foreground hover:text-white transition-colors block mb-6 flex items-center gap-1">
                    &larr; Abort & Return
                </button>

                <h1 className="text-3xl font-bold mb-8 text-center neon-text text-white">Update Node</h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Credentials</label>
                        <div className="space-y-2">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Business ID (GSTIN / EIN)"
                                    className="w-full bg-black/40 border border-white/10 p-3 rounded text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-neutral-600 uppercase"
                                    value={businessId}
                                    onChange={(e) => setBusinessId(e.target.value)}
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Distributor Username"
                                    className="w-full bg-neutral-900 border border-white/5 p-3 rounded text-white/50 cursor-not-allowed"
                                    value={username}
                                    disabled
                                    title="Username cannot be changed"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Contact Info</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <input
                                    type="email"
                                    placeholder="Secure Email"
                                    className="w-full bg-black/40 border border-white/10 p-3 rounded text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-neutral-600"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Comm Link (Phone)"
                                    className="w-full bg-black/40 border border-white/10 p-3 rounded text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-neutral-600"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Physical Location</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Sector (City)"
                                    className="w-full bg-black/40 border border-white/10 p-3 rounded text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-neutral-600"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Zone Code (Pin)"
                                    className="w-full bg-black/40 border border-white/10 p-3 rounded text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-neutral-600"
                                    value={pincode}
                                    onChange={(e) => setPincode(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Geo-Tagging</label>
                        <div>
                            <input
                                type="text"
                                placeholder="GPS Coordinates (e.g., 28.7041, 77.1025)"
                                className="w-full bg-black/40 border border-white/10 p-3 rounded text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-neutral-600"
                                value={gps}
                                onChange={(e) => setGps(e.target.value)}
                            />
                        </div>
                    </div>

                    <button type="submit" className="bg-primary hover:bg-primary/90 text-white py-4 rounded-lg font-bold mt-4 shadow-md transition-all transform hover:scale-[1.02] border border-primary/50">
                        UPDATE NODE
                    </button>
                    {message && <p className={`text-center mt-4 font-mono text-sm ${message.includes('successfully') ? 'text-green-400' : 'text-orange-400'}`}>{message}</p>}
                </form>
            </div>
        </div>
    );
}
