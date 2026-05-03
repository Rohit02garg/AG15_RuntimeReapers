'use client';
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        setMessage("");
        setError("");

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword })
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Invalid or expired token.');
            }
            setMessage("Password reset successfully. Redirecting to login...");
            setTimeout(() => router.push("/login"), 2000);
        } catch (err: any) {
            setError(err.message || "Invalid or expired token.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md space-y-8 rounded-2xl border border-white/10 bg-neutral-900/50 p-8 backdrop-blur-xl">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight">Reset Password</h2>
                <p className="mt-2 text-sm text-neutral-400">Enter your new password below</p>
            </div>

            {!token ? (
                <div className="rounded-md bg-red-500/10 p-4 text-sm text-red-500 text-center">
                    Invalid Request. Token is missing.
                </div>
            ) : (
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="new-password" className="block text-sm font-medium text-neutral-300">
                            New Password
                        </label>
                        <div className="mt-2 relative">
                            <input
                                id="new-password"
                                name="new-password"
                                type={showPassword ? "text" : "password"}
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="block w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-neutral-500 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-neutral-300">
                            Confirm Password
                        </label>
                        <div className="mt-2">
                            <input
                                id="confirm-password"
                                name="confirm-password"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="block w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-neutral-500 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {message && (
                        <div className="rounded-md bg-green-500/10 p-4 text-sm text-green-500">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="rounded-md bg-red-500/10 p-4 text-sm text-red-500">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center rounded-lg bg-white px-4 py-3 text-sm font-bold text-black transition-colors hover:bg-neutral-200 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : "Reset Password"}
                    </button>
                </form>
            )}
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4 text-white">
            <Suspense fallback={<Loader2 className="animate-spin text-white" />}>
                <ResetPasswordContent />
            </Suspense>
        </div>
    );
}
