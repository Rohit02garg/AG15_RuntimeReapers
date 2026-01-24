"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({ username: "", password: "" });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const res = await signIn("credentials", {
            identifier: form.username,
            password: form.password,
            redirect: false,
        });

        if (res?.error) {
            setError(res.error);
            setLoading(false);
        } else {
            // Check session to determine role
            const sessionRes = await fetch("/api/auth/session");
            const session = await sessionRes.json();

            if (session?.user?.role === 'DISTRIBUTOR') {
                router.push("/distributor/dashboard");
            } else {
                router.push("/manufacturer/dashboard");
            }
            router.refresh();
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-neutral-900 border-neutral-800 text-white">
                <CardHeader>
                    <CardTitle>Staff Login</CardTitle>
                    <CardDescription className="text-neutral-400">
                        SmartTrace Supply Chain Management
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-neutral-300">Username</label>
                            <Input
                                className="bg-neutral-800 border-neutral-700 text-white"
                                value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                                placeholder="admin"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-neutral-300">Password</label>
                            <Input
                                type="password"
                                className="bg-neutral-800 border-neutral-700 text-white"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                placeholder="••••••"
                            />
                        </div>

                        {error && <p className="text-red-400 text-sm">{error}</p>}

                        <Button disabled={loading} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                            {loading ? <Loader2 className="animate-spin" /> : "Sign In"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
