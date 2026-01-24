'use client';

import { Scanner } from '@yudiel/react-qr-scanner';
import { X } from 'lucide-react';

interface QRScannerProps {
    onScan: (data: string) => void;
    onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md bg-black border border-white/20 rounded-2xl overflow-hidden shadow-2xl">

                {/* Header */}
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
                    <span className="text-white font-bold tracking-widest text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        LIVE SCANNER
                    </span>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scanner Interface */}
                <div className="relative aspect-square bg-black">
                    <Scanner
                        onScan={(result) => {
                            if (result && result.length > 0) {
                                onScan(result[0].rawValue);
                            }
                        }}
                        onError={(error) => console.log(error?.message)}
                        components={{
                            audio: false,
                            onOff: false,
                            torch: true,
                            zoom: true,
                            finder: true
                        }}
                        styles={{
                            container: { width: '100%', height: '100%' },
                            video: { width: '100%', height: '100%', objectFit: 'cover' }
                        }}
                    />

                    {/* Scanner Overlay UI */}
                    <div className="absolute inset-0 border-2 border-primary/50 pointer-events-none rounded-2xl"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-primary/80 rounded-lg box-shadow-[0_0_20px_rgba(0,255,255,0.2)] pointer-events-none">
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary"></div>
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary"></div>
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary"></div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 text-center bg-neutral-900 border-t border-white/10">
                    <p className="text-xs text-neutral-400">Position the QR code within the frame</p>
                </div>
            </div>
        </div>
    );
}
