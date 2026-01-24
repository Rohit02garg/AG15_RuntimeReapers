import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { ShieldCheck, Box, Lock, Zap, ArrowRight, User } from "lucide-react";
import UserActions from "@/components/UserActions";


export default async function Home() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden flex flex-col items-center">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-secondary/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Navbar */}
      <nav className="w-full max-w-7xl mx-auto p-6 md:p-10 flex justify-between items-center z-10">
        <h1 className="text-3xl md:text-4xl font-bold neon-text bg-gradient-to-r from-primary to-white bg-clip-text text-transparent flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-primary" /> SmartTrace
        </h1>
        <div className="flex gap-4">
          {!user && (
            <Link href="/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-white hover:bg-white/5 transition-all text-base px-6">
                Staff Portal
              </Button>
            </Link>
          )}
          {user && (
            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10">
              <User className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{user.username}</span>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-6 md:p-12 flex flex-col gap-24 relative z-10">

        {/* HERO SECTION */}
        <div className="text-center space-y-8 py-10 md:py-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-4">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            Live Supply Chain Ledger
          </div>

          <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-white drop-shadow-2xl">
            The <span className="text-primary text-transparent bg-clip-text bg-gradient-to-br from-primary via-cyan-400 to-primary">Digital Thread</span><br />
            of Fate.
          </h2>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Immutable tracking for the pharmaceutical industry. From manufacturing floor to patient hands, ensure authenticity with every scan.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-8">
            <Link href="/verify">
              <Button className="h-16 px-10 text-xl rounded-full bg-primary hover:bg-primary/90 text-black font-bold shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:shadow-[0_0_50px_rgba(34,211,238,0.5)] transition-all transform hover:scale-105">
                <Zap className="mr-2 w-6 h-6 fill-current" /> Verify Product Now
              </Button>
            </Link>
            {!user && (
              <Link href="/login">
                <Button variant="outline" className="h-16 px-10 text-xl rounded-full border-white/10 hover:bg-white/5 hover:border-white/30 text-white transition-all">
                  Manufacturer Login
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* FEATURES / ACCESS SPLIT */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
          {/* Consumer Card */}
          <div className="md:col-span-2 p-10 rounded-3xl glass-panel relative overflow-hidden group border border-white/5 hover:border-primary/30 transition-all duration-500">
            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldCheck className="w-64 h-64 text-white" />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-3xl font-bold text-white">Public Verification</h3>
              <p className="text-neutral-400 text-lg max-w-md">
                Instantly verify the authenticity of any product. Our blockchain-backed ledger ensures that no counterfeit item goes undetected.
              </p>
              <Link href="/verify" className="inline-flex items-center text-primary font-bold hover:text-white transition-colors">
                Launch Scanner <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Staff Card */}
          <div className="md:col-span-1 p-10 rounded-3xl glass-card relative overflow-hidden flex flex-col justify-between h-full bg-neutral-900/50">
            {user ? (
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Staff Access</h3>
                  <p className="text-neutral-400 mb-4">Welcome back, {user.username}.</p>
                  <div className="p-3 bg-black/40 rounded border border-white/5 mb-6">
                    <span className="text-xs font-mono text-primary uppercase tracking-widest">{user.role} PERMISSIONS ACTIVE</span>
                  </div>
                  <UserActions role={user.role || 'GUEST'} />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Restricted Access</h3>
                <p className="text-neutral-500">
                  Secure gateway for Manufacturers and Distributors.
                </p>
                <Link href="/login">
                  <Button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white">
                    Secure Login
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-8 text-center text-neutral-600 text-sm">
        <p>© 2026 SmartTrace Blockchain. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
