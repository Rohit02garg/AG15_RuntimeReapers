"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function GeneratorPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        type: "UNIT",
        count: 1000,
        parentId: ""
    });

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: formData.type,
                    count: Number(formData.count),
                    parentId: formData.parentId || undefined
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error?.message || JSON.stringify(data.error) || "Generation Failed");
            }

            setResult(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-50 p-6 flex flex-col items-center justify-center">
            <Card className="w-full max-w-lg bg-neutral-900 border-neutral-800">
                <CardHeader>
                    <CardTitle className="text-white">Batch Label Generator</CardTitle>
                    <CardDescription>Create massive batches of unique identities instantly.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    <div className="space-y-2">
                        <Label className="text-neutral-300">Item Type</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(val) => setFormData({ ...formData, type: val })}
                        >
                            <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                                <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                            <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                                <SelectItem value="UNIT">Unit (Primary Product)</SelectItem>
                                <SelectItem value="CASE">Case (Secondary Box)</SelectItem>
                                <SelectItem value="PALLET">Pallet (Tertiary Load)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-neutral-300">Quantity</Label>
                        <Input
                            type="number"
                            className="bg-neutral-800 border-neutral-700 text-white"
                            value={formData.count}
                            onChange={(e) => setFormData({ ...formData, count: Number(e.target.value) })}
                            max={10000}
                        />
                        <p className="text-xs text-neutral-500">Max 10,000 per batch execution.</p>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-neutral-300">Parent Serial (Optional)</Label>
                        <Input
                            placeholder="e.g. CASE-12345"
                            className="bg-neutral-800 border-neutral-700 text-white"
                            value={formData.parentId}
                            onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                        />
                        <p className="text-xs text-neutral-500">Links these new items to a parent container.</p>
                    </div>

                    <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                        onClick={handleGenerate}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="animate-spin h-4 w-4" /> Generating...
                            </span>
                        ) : (
                            "Start Production Engine"
                        )}
                    </Button>

                    {error && (
                        <Alert variant="destructive" className="bg-red-900/20 border-red-900">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {result && (
                        <div className="p-4 bg-emerald-900/20 border border-emerald-900 rounded-md space-y-2">
                            <div className="flex items-center gap-2 text-emerald-400 font-bold">
                                <CheckCircle className="h-5 w-5" />
                                Generation Complete
                            </div>
                            <div className="text-sm text-neutral-300 space-y-1">
                                <p>Items Created: <span className="text-white font-mono">{result.message.match(/\d+/)?.[0]}</span></p>
                                <p>Time Taken: <span className="text-white font-mono">{result.duration}ms</span></p>
                            </div>
                            <div className="mt-2 text-xs text-neutral-500">
                                Sample ID: {result.sample[0].serial}
                            </div>
                        </div>
                    )}

                </CardContent>
            </Card>
        </div>
    );
}
