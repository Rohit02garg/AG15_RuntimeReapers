'use client';
import { useState } from "react";
import axios from "axios";
import { Loader2, ShieldQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");

        try {
            await axios.post("/api/auth/forgot-password", { email });
            setMessage("If an account exists with this email, you will receive a reset link.");
        } catch (err: any) {
            setError(err.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
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
                        <ShieldQuestion className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-white neon-text">Account Recovery</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Enter your email to receive a password reset link
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
                            <Input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-black/40 border-white/10 text-white placeholder:text-neutral-600 focus:border-primary focus:ring-primary/50"
                                placeholder="name@company.com"
                            />
                        </div>

                        {message && (
                            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md text-center">
                                <p className="text-green-400 text-sm">{message}</p>
                            </div>
                        )}

                        {error && (
                            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-center">
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 text-white shadow-md py-6 text-lg tracking-wide font-bold transition-all border border-primary/50"
                        >
                            {loading ? <Loader2 className="animate-spin mr-2" /> : "SEND RESET LINK"}
                        </Button>

                        <div className="text-center mt-4">
                            <Link href="/login" className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">
                                Back to Login
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
