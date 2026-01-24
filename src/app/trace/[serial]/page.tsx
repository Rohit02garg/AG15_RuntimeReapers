"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TreeNode } from "@/components/TreeNode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, GitGraph } from "lucide-react";
import Link from "next/link";

export default function TracePage() {
    const params = useParams();
    const serial = params.serial as string;

    const [tree, setTree] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!serial) return;

        fetch(`/api/hierarchy/${serial}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) throw new Error(data.error);
                setTree(data.tree);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [serial]);

    return (
        <div className="min-h-screen bg-neutral-950 text-white p-8">
            <div className="max-w-5xl mx-auto space-y-6">

                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <GitGraph className="text-purple-500" /> The Red Thread
                        </h1>
                        <p className="text-neutral-400 text-sm mt-1">Traceability Visualization for {serial}</p>
                    </div>
                    <Link href="/">
                        <Button variant="outline">Back to Dashboard</Button>
                    </Link>
                </header>

                {loading && (
                    <div className="flex justify-center p-20">
                        <Loader2 className="animate-spin h-8 w-8 text-neutral-500" />
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-900/20 text-red-400 border border-red-900 rounded-md">
                        Error: {error}
                    </div>
                )}

                {tree && (
                    <Card className="bg-neutral-900/50 border-neutral-800">
                        <CardHeader>
                            <CardTitle className="text-neutral-300">Supply Chain Hierarchy</CardTitle>
                        </CardHeader>
                        <CardContent className="overflow-auto max-h-[800px] p-6">
                            <TreeNode node={tree} />
                        </CardContent>
                    </Card>
                )}

            </div>
        </div>
    );
}
