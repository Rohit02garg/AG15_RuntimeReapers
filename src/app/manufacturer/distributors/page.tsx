'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterDistributor() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        try {
            const res = await fetch('/api/manufacturer/register-distributor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();
            if (res.ok) {
                setMessage('Distributor created successfully!');
                setUsername('');
                setPassword('');
            } else {
                setMessage(data.message || 'Something went wrong');
            }
        } catch (err) {
            setMessage('Failed to register');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-24">
            <div className="z-10 w-full max-w-md items-center justify-between font-mono text-sm">
                <h1 className="text-4xl font-bold mb-8 text-center">Add Distributor</h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Distributor Username"
                        className="p-2 text-black rounded"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="p-2 text-black rounded"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                        Register Distributor
                    </button>
                    {message && <p className="text-center mt-4">{message}</p>}
                </form>
            </div>
        </div>
    );
}
