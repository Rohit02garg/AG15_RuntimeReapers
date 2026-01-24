"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ShieldCheck } from "lucide-react";

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
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

            <Card className="w-full max-w-md glass-card z-10 shadow-2xl border-white/10 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none rounded-xl"></div>
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/20 p-3 rounded-full w-fit mb-4 border border-primary/50">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-white neon-text">Secure Terminal Access</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Authenticate to SmartTrace Protocol
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Identity</label>
                            <Input
                                className="bg-black/40 border-white/10 text-white placeholder:text-neutral-600 focus:border-primary focus:ring-primary/50"
                                value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                                placeholder="Username"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Access Key</label>
                            <Input
                                type="password"
                                className="bg-black/40 border-white/10 text-white placeholder:text-neutral-600 focus:border-primary focus:ring-primary/50"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                placeholder="••••••"
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-center">
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        )}

                        <Button disabled={loading} type="submit" className="w-full bg-primary hover:bg-primary/90 text-white shadow-md py-6 text-lg tracking-wide font-bold transition-all border border-primary/50">
                            {loading ? <Loader2 className="animate-spin mr-2" /> : "ESTABLISH CONNECTION"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
