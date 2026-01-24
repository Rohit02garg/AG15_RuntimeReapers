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

  // Fetch Real Stats from DB


  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* Hero Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-neutral-800 pb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              SmartTrace
            </h1>
            <p className="text-neutral-400 mt-2 text-lg">
              Next-Gen Pharmaceutical Supply Chain & Anti-Counterfeit System
            </p>
          </div>
          <div className="flex gap-4">
            {!user && (
              <Link href="/login">
                <Button variant="ghost" className="text-neutral-400 hover:text-white hover:bg-neutral-800">
                  Staff Login
                </Button>
              </Link>
            )}
            <Link href="/verify">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:scale-105">
                <ShieldCheck className="mr-2 h-6 w-6" /> Verify Product
              </Button>
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* LEFT: Public Consumer Zone */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
              <Zap className="text-yellow-400" /> Live Public Tracking
            </h2>



            <div className="p-6 rounded-xl border border-dashed border-neutral-800 bg-neutral-900/50">
              <p className="text-neutral-400 text-sm mb-4">
                Consumers can scan any SmartTrace QR code without logging in. Our public ledger guarantees transparency.
              </p>
              <Link href="/verify">
                <Button variant="outline" className="w-full text-emerald-400 border-emerald-900 hover:bg-emerald-950">
                  Launch Web Scanner
                </Button>
              </Link>
            </div>
          </div>

          {/* RIGHT: Restricted Staff Zone */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
              <Lock className="text-indigo-400" /> Manufacturer Access
            </h2>

            {user ? (
              // LOGGED IN VIEW
              <Card className="bg-indigo-950/20 border-indigo-900 shadow-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                <CardHeader>
                  <CardTitle className="text-xl text-white flex items-center justify-between">
                    <span>{user.role === 'MANUFACTURER' ? 'Manufacturer Portal' : 'Distributor Portal'}</span>
                    <span className="text-xs bg-indigo-600/50 px-2 py-1 rounded text-indigo-200">
                      {user.role}
                    </span>
                  </CardTitle>
                  <CardDescription className="text-indigo-300">
                    Welcome back, {user.username || 'Staff'}.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-neutral-300 text-sm">
                    {user.role === 'MANUFACTURER'
                      ? 'Manage production, distributors, and label generation.'
                      : 'Access the scanner to update product status.'}
                  </p>

                  <UserActions role={user.role || 'GUEST'} />
                </CardContent>
              </Card>
            ) : (
              // GUEST VIEW
              <Card className="bg-neutral-900 border-neutral-800 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Staff Login</CardTitle>
                  <CardDescription>
                    Authorized Manufacturers & Distributors only.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-neutral-950 rounded border border-neutral-800 mb-4">
                    <p className="text-xs text-neutral-500">
                      <span className="font-bold text-neutral-300">Security Notice:</span> Access to the Generation Engine requires a secure 2FA session.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Link href="/login">
                      <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                        Manufacturer
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button className="w-full bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700">
                        Distributor
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
