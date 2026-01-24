'use client';

import { Button } from "@/components/ui/button";
import { Box, ArrowRight } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";

interface UserActionsProps {
    role: string;
}

export default function UserActions({ role }: UserActionsProps) {
    return (
        <div className="space-y-4 relative z-50">
            <Link href={role === 'MANUFACTURER' ? "/manufacturer/dashboard" : "/distributor/scan"}>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-6 cursor-pointer">
                    <Box className="mr-2 h-5 w-5" />
                    {role === 'MANUFACTURER' ? 'Go to Dashboard' : 'Launch Scanner'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </Link>

            <Button
                variant="ghost"
                className="w-full text-neutral-400 hover:text-white mt-2 cursor-pointer z-50 relative"
                onClick={() => signOut({ callbackUrl: '/' })}
            >
                Sign Out
            </Button>
        </div>
    );
}
