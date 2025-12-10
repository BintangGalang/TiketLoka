'use client';

import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { ArrowLeft, Camera, CheckCircle, AlertTriangle, XCircle, Loader2, StopCircle, Play } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminScannerPage() {
    const { token } = useAuth();
    
    // State Kontrol
    const [scanResult, setScanResult] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isScanning, setIsScanning] = useState(false); // <--- STATE BARU UNTUK KONTROL KAMERA
    
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    // Fungsi handle hasil scan
    const onScanSuccess = async (decodedText: string, decodedResult: any) => {
        if (isProcessing) return;

        // Pause scanner saat memproses data
        scannerRef.current?.pause(); 
        setIsProcessing(true);

        try {
            const res = await fetch('http://127.0.0.1:8000/api/admin/tickets/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ticket_code: decodedText })
            });

            const json = await res.json();
            setScanResult({ type: json.status, ...json });

            // Matikan mode scanning setelah dapat hasil
            setIsScanning(false); 

            if (res.ok) {
                toast.success("Tiket Valid!");
                const audio = new Audio('/sounds/success.mp3'); 
                audio.play().catch(() => {});
            } else {
                if (json.status === 'warning') {
                    toast.error("Tiket Sudah Terpakai!");
                } else {
                    toast.error("Tiket Tidak Dikenali");
                }
            }

        } catch (error) {
            console.error(error);
            toast.error("Gagal menghubungi server");
            setIsScanning(false); // Matikan scan jika error koneksi
        } finally {
            setIsProcessing(false);
            // Bersihkan scanner instance agar kamera mati total
            scannerRef.current?.clear().catch(e => console.error(e));
        }
    };

    // Fungsi Mulai Kamera
    const startCamera = () => {
        setScanResult(null);
        setIsScanning(true);
    };

    // Fungsi Stop Kamera Manual
    const stopCamera = () => {
        setIsScanning(false);
        scannerRef.current?.clear().catch(e => console.error(e));
    };

    // Reset untuk scan lagi (dari hasil result)
    const handleReset = () => {
        setScanResult(null);
        setIsScanning(true); // Langsung nyalakan kamera lagi
    };

    useEffect(() => {
        // Hanya inisialisasi jika isScanning == TRUE
        if (isScanning) {
            // Beri jeda sedikit agar div 'reader' ter-render dulu oleh React
            const timeoutId = setTimeout(() => {
                const scanner = new Html5QrcodeScanner(
                    "reader", 
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    false
                );
                
                scanner.render(onScanSuccess, (error) => {
                    // console.warn(error);
                });
    
                scannerRef.current = scanner;
            }, 100);

            return () => clearTimeout(timeoutId);
        } else {
            // Jika isScanning false, pastikan scanner mati
            if (scannerRef.current) {
                scannerRef.current.clear().catch(e => console.error("Clear error", e));
                scannerRef.current = null;
            }
        }
    }, [isScanning]); // Dependency berubah ke isScanning

    return (
        <main className="min-h-screen bg-gray-900 text-white p-4">
            
            {/* Header */}
            <div className="max-w-md mx-auto mb-6 flex items-center justify-between">
                <Link href="/admin/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
                    <ArrowLeft className="w-5 h-5" /> Dashboard
                </Link>
                <h1 className="font-bold text-lg flex items-center gap-2">
                    <Camera className="w-5 h-5 text-[#F57C00]" /> Ticket Scanner
                </h1>
            </div>

            <div className="max-w-md mx-auto">
                
                {/* 1. TAMPILAN AWAL (KAMERA MATI) */}
                {!isScanning && !scanResult && (
                    <div className="bg-gray-800 rounded-3xl p-10 text-center border border-gray-700 shadow-xl flex flex-col items-center justify-center min-h-[400px]">
                        <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <QrCodeIcon />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Siap Memindai</h2>
                        <p className="text-gray-400 mb-8 text-sm">Pastikan pencahayaan cukup untuk hasil terbaik.</p>
                        
                        <button 
                            onClick={startCamera}
                            className="bg-[#F57C00] hover:bg-[#E65100] text-white font-bold py-4 px-8 rounded-full shadow-lg shadow-orange-900/50 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
                        >
                            <Play className="w-5 h-5 fill-current" /> MULAI KAMERA
                        </button>
                    </div>
                )}

                {/* 2. AREA KAMERA (Hanya muncul jika isScanning = true) */}
                {isScanning && !scanResult && (
                    <div className="relative">
                        <div className="bg-black rounded-3xl overflow-hidden border-2 border-[#F57C00] shadow-2xl relative min-h-[350px]">
                            {/* Div ini wajib ada saat isScanning true */}
                            <div id="reader" className="w-full h-full"></div>
                            
                            {isProcessing && (
                                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
                                    <div className="text-center">
                                        <Loader2 className="w-10 h-10 text-[#F57C00] animate-spin mx-auto mb-2"/>
                                        <p className="font-bold">Memverifikasi...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Tombol Stop */}
                        <button 
                            onClick={stopCamera}
                            className="mt-6 w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                        >
                            <StopCircle className="w-5 h-5" /> Matikan Kamera
                        </button>
                        <p className="text-center text-xs text-gray-500 py-4">Arahkan kamera ke QR Code Tiket</p>
                    </div>
                )}

                {/* 3. HASIL SCAN (POPUP RESULT) */}
                {scanResult && (
                    <div className={`rounded-3xl p-8 text-center shadow-2xl animate-in zoom-in duration-300 ${
                        scanResult.type === 'success' ? 'bg-white text-gray-900' : 
                        scanResult.type === 'warning' ? 'bg-yellow-50 text-yellow-900 border-4 border-yellow-400' :
                        'bg-red-50 text-red-900 border-4 border-red-500'
                    }`}>
                        
                        {/* Ikon Status */}
                        <div className="mb-4 flex justify-center">
                            {scanResult.type === 'success' && <CheckCircle className="w-20 h-20 text-green-500" />}
                            {scanResult.type === 'warning' && <AlertTriangle className="w-20 h-20 text-yellow-500" />}
                            {scanResult.type === 'error' && <XCircle className="w-20 h-20 text-red-500" />}
                        </div>

                        {/* Pesan Utama */}
                        <h2 className="text-2xl font-extrabold mb-2 uppercase">{scanResult.type === 'success' ? 'TIKET VALID' : scanResult.type === 'warning' ? 'SUDAH DIPAKAI' : 'TIKET INVALID'}</h2>
                        <p className="text-lg font-medium mb-6">{scanResult.message}</p>

                        {/* Detail Data */}
                        {scanResult.data && (
                            <div className="bg-gray-100 rounded-xl p-4 text-left space-y-2 mb-6 text-gray-800 text-sm border border-gray-200">
                                <div className="flex justify-between border-b border-gray-200 pb-2">
                                    <span className="text-gray-500">Pengunjung:</span>
                                    <span className="font-bold">{scanResult.data.user}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-200 pb-2">
                                    <span className="text-gray-500">Wahana:</span>
                                    <span className="font-bold">{scanResult.data.destination}</span>
                                </div>
                                {scanResult.data.redeemed_at && (
                                    <div className="flex justify-between text-red-600 font-bold">
                                        <span>Dipakai:</span>
                                        <span>{new Date(scanResult.data.redeemed_at).toLocaleTimeString('id-ID')}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={handleReset}
                                className="w-full bg-[#0B2F5E] text-white font-bold py-4 rounded-xl shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                            >
                                <Camera className="w-5 h-5" /> SCAN LAGI
                            </button>
                            <button 
                                onClick={() => setScanResult(null)}
                                className="w-full bg-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-300 transition-colors"
                            >
                                Kembali ke Menu
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </main>
    );
}

// Ikon sederhana untuk placeholder
function QrCodeIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="7" y="7" width="3" height="3"></rect><rect x="14" y="7" width="3" height="3"></rect><rect x="7" y="14" width="3" height="3"></rect><rect x="14" y="14" width="3" height="3"></rect></svg>
    )
}