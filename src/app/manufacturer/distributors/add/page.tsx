'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterDistributor() {
    const [username, setUsername] = useState('');
    const [businessId, setBusinessId] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState('');
    const [pincode, setPincode] = useState('');
    const [gps, setGps] = useState('');
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState<any>({});
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setErrors({});

        try {
            const res = await fetch('/api/manufacturer/register-distributor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, businessId, password, email, phone, city, pincode, gps })
            });

            const data = await res.json();
            if (res.ok) {
                setMessage('Distributor node registered successfully!');
                setTimeout(() => {
                    router.push('/manufacturer/distributors'); // Redirect to LIST page
                }, 1500);
            } else {
                if (data.errors) {
                    setErrors(data.errors);
                    setMessage('Validation Failed');
                } else {
                    setMessage(data.message || 'Something went wrong');
                }
            }
        } catch (err) {
            setMessage('Failed to register node');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-8 bg-background text-foreground relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />

            <div className="z-10 w-full max-w-lg font-mono text-sm glass-panel p-10 rounded-2xl shadow-2xl relative border border-white/10">
                <button onClick={() => router.back()} className="text-muted-foreground hover:text-white transition-colors block mb-6 flex items-center gap-1">
                    &larr; Abort & Return
                </button>

                <h1 className="text-3xl font-bold mb-8 text-center neon-text text-white">Register Node</h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Credentials</label>
                        <div className="space-y-2">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Business ID (GSTIN / EIN)"
                                    className={`w-full bg-black/40 border ${errors.businessId ? 'border-red-500' : 'border-white/10'} p-3 rounded text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-neutral-600 uppercase`}
                                    value={businessId}
                                    onChange={(e) => setBusinessId(e.target.value)}
                                    required
                                />
                                {errors.businessId && <p className="text-red-400 text-xs mt-1">{errors.businessId}</p>}
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Distributor Username"
                                    className={`w-full bg-black/40 border ${errors.username ? 'border-red-500' : 'border-white/10'} p-3 rounded text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-neutral-600`}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                                {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
                            </div>
                            <div>
                                <input
                                    type="password"
                                    placeholder="Access Key (Password)"
                                    className={`w-full bg-black/40 border ${errors.password ? 'border-red-500' : 'border-white/10'} p-3 rounded text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-neutral-600`}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
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
                                    className={`w-full bg-black/40 border ${errors.email ? 'border-red-500' : 'border-white/10'} p-3 rounded text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-neutral-600`}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Comm Link (Phone)"
                                    className={`w-full bg-black/40 border ${errors.phone ? 'border-red-500' : 'border-white/10'} p-3 rounded text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-neutral-600`}
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                />
                                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
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
                                    className={`w-full bg-black/40 border ${errors.city ? 'border-red-500' : 'border-white/10'} p-3 rounded text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-neutral-600`}
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    required
                                />
                                {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city}</p>}
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Zone Code (Pin)"
                                    className={`w-full bg-black/40 border ${errors.pincode ? 'border-red-500' : 'border-white/10'} p-3 rounded text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-neutral-600`}
                                    value={pincode}
                                    onChange={(e) => setPincode(e.target.value)}
                                    required
                                />
                                {errors.pincode && <p className="text-red-400 text-xs mt-1">{errors.pincode}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Geo-Tagging</label>
                        <div>
                            <input
                                type="text"
                                placeholder="GPS Coordinates (e.g., 28.7041, 77.1025)"
                                className={`w-full bg-black/40 border ${errors.gps ? 'border-red-500' : 'border-white/10'} p-3 rounded text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-neutral-600`}
                                value={gps}
                                onChange={(e) => setGps(e.target.value)}
                                required
                            />
                            {errors.gps && <p className="text-red-400 text-xs mt-1">{errors.gps}</p>}
                        </div>
                    </div>

                    <button type="submit" className="bg-primary hover:bg-primary/90 text-white py-4 rounded-lg font-bold mt-4 shadow-md transition-all transform hover:scale-[1.02] border border-primary/50">
                        INITIALIZE NODE
                    </button>
                    {message && <p className={`text-center mt-4 font-mono text-sm ${message.includes('successfully') ? 'text-green-400' : 'text-orange-400'}`}>{message}</p>}
                </form>
            </div>
        </div>
    );
}
