'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterDistributor() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState('');
    const [pincode, setPincode] = useState('');
    const [gps, setGps] = useState('');
    const [message, setMessage] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        try {
            const res = await fetch('/api/manufacturer/register-distributor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, email, phone, city, pincode, gps })
            });

            const data = await res.json();
            if (res.ok) {
                setMessage('Distributor created successfully!');
                setTimeout(() => {
                    router.push('/manufacturer/distributors'); // Redirect to LIST page
                }, 1500);
            } else {
                setMessage(data.message || 'Something went wrong');
            }
        } catch (err) {
            setMessage('Failed to register');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-24 bg-gray-100 text-black">
            <div className="z-10 w-full max-w-md items-center justify-between font-mono text-sm bg-white p-8 rounded shadow-lg">
                <button onClick={() => router.back()} className="text-blue-600 underline block mb-4">&larr; Back to List</button>
                <h1 className="text-3xl font-bold mb-8 text-center text-blue-600">Add New Distributor</h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Distributor Username"
                        className="p-3 border rounded focus:border-blue-500 outline-none"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="p-3 border rounded focus:border-blue-500 outline-none"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="email"
                            placeholder="Email (Optional)"
                            className="p-3 border rounded focus:border-blue-500 outline-none"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Phone (Optional)"
                            className="p-3 border rounded focus:border-blue-500 outline-none"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="City"
                            className="p-3 border rounded focus:border-blue-500 outline-none"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Pincode"
                            className="p-3 border rounded focus:border-blue-500 outline-none"
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value)}
                            required
                        />
                    </div>

                    <input
                        type="text"
                        placeholder="GPS Coordinates (e.g., 28.7041, 77.1025)"
                        className="p-3 border rounded focus:border-blue-500 outline-none"
                        value={gps}
                        onChange={(e) => setGps(e.target.value)}
                        required
                    />

                    <button type="submit" className="bg-blue-600 text-white py-3 rounded hover:bg-blue-700 font-bold mt-2">
                        Register Distributor
                    </button>
                    {message && <p className={`text-center mt-4 ${message.includes('success') ? 'text-green-600' : 'text-red-500'}`}>{message}</p>}
                </form>
            </div>
        </div>
    );
}
