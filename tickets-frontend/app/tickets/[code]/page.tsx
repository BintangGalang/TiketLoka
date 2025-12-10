'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react'; 
import { Booking } from '@/types';
import Link from 'next/link';
import { ArrowLeft, MapPin, Calendar, Download, Printer, Info, CheckCircle } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation'; // Tambahkan useSearchParams
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  // --- BAGIAN INI YANG HILANG SEBELUMNYA ---
  const searchParams = useSearchParams();
  // Ambil parameter '?index=0' dari URL, default ke 0 jika tidak ada
  const ticketIndex = parseInt(searchParams.get('index') || '0'); 
  // ------------------------------------------

  const { token, isLoading: authLoading } = useAuth();
  const bookingCode = params.code as string;
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper URL Gambar
  const getImageUrl = (url: string | null) => {
    if (!url) return 'https://images.unsplash.com/photo-1596423348633-8472df3b006c?auto=format&fit=crop&w=800';
    if (url.startsWith('http')) return url;
    return `http://127.0.0.1:8000/storage/${url}`;
  };

  // Helper Format Tanggal
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  useEffect(() => {
    if (authLoading) return;

    if (!token) {
        router.push('/login');
        return;
    }

    if(!bookingCode) return;

    const fetchDetail = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/bookings/${bookingCode}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const json = await res.json();
        
        if (res.ok) {
            setBooking(json.data);
        } else {
            console.error(json.message);
            if(res.status === 401 || res.status === 403) {
                router.push('/login');
            }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [bookingCode, token, authLoading, router]);

  if (loading || authLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#F57C00] rounded-full animate-spin"></div>
    </div>
  );

  if (!booking) return null;

  // PILIH DETAIL TIKET BERDASARKAN INDEX
  // Jika index dari URL valid, pakai itu. Jika tidak, pakai yang pertama.
  const detail = booking.details[ticketIndex] || booking.details[0]; 

  return (
    <main className="min-h-screen bg-[#F5F6F8] pb-20 font-sans text-gray-800">
      
      {/* Navbar Simple */}
      <div className="bg-white px-4 py-3 shadow-sm sticky top-0 z-20 border-b border-gray-200">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Link href="/tickets" className="hover:bg-gray-100 p-2 rounded-full transition text-gray-600">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex flex-col">
                    <h1 className="font-bold text-lg text-[#0B2F5E]">Kembali</h1>
                </div>
            </div>
            <button 
                onClick={() => window.print()}
                className="hidden md:flex items-center gap-2 text-[#0B2F5E] hover:bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-medium transition"
            >
                <Printer className="w-4 h-4" /> Cetak
            </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 print:shadow-none print:border-none">
            
            {/* 1. HEADER INFO */}
            <div className="p-6 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Image 
                            src="/images/navbar.png" 
                            alt="Logo" 
                            width={140} 
                            height={40} 
                            className="object-contain h-8 w-auto" 
                        />
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2 text-right">
                    <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold border border-green-200">
                        <CheckCircle className="w-4 h-4" />
                        <span>LUNAS</span>
                    </div>
                </div>
            </div>

            {/* Info Penting */}
            <div className="bg-green-50 px-6 py-2.5 text-xs text-green-700 flex items-center gap-2 border-b border-green-100">
                <Info className="w-4 h-4 text-green-600" />
                <span className="font-medium">Tunjukkan E-Tiket dan Identitas valid saat masuk ke lokasi wisata.</span>
            </div>

            {/* 2. BLUE BAR */}
            <div className="bg-[#0B2F5E] text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[#F57C00]" />
                    <span className="font-bold text-lg tracking-wide">BOOKING CODE: {booking.booking_code}</span>
                </div>
            </div>

            {/* 3. BODY CONTENT */}
            <div className="grid grid-cols-1 md:grid-cols-3">
                
                {/* KOLOM KIRI */}
                <div className="md:col-span-2 p-8 border-r border-dashed border-gray-200 relative">
                    <div className="flex gap-5 items-start">
                        <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200 shadow-sm">
                            <img 
                                src={getImageUrl(detail.destination.image_url)} 
                                alt={detail.destination.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-800 mb-2 leading-tight">{detail.destination.name}</h3>
                            <div className="flex items-start gap-2 text-gray-500 text-sm mb-4">
                                <MapPin className="w-4 h-4 mt-0.5 text-[#F57C00] flex-shrink-0" />
                                <span>{detail.destination.location}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-orange-50 text-[#F57C00] px-3 py-1 rounded-md font-bold text-xs border border-orange-100">
                                    General Admission
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#F5F6F8] rounded-full border-l border-gray-200 hidden md:block"></div>
                </div>

                {/* KOLOM KANAN: QR */}
                <div className="p-8 flex flex-col items-center justify-center bg-gray-50/30 relative">
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#F5F6F8] rounded-full border-r border-gray-200 hidden md:block"></div>
                    <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm mb-3">
                         <QRCodeSVG value={booking.qr_string} size={130} level={"H"} />
                    </div>
                    <p className="text-[10px] text-gray-400 text-center font-mono mt-1 break-all max-w-[150px]">
                        {booking.qr_string}
                    </p>
                </div>
            </div>
            
            {/* 4. TABEL RINCIAN */}
            <div className="p-8 pt-2 border-t border-gray-100">
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200 text-xs uppercase tracking-wide">
                            <tr>
                                <th className="px-5 py-3">Nama Pemesan</th>
                                <th className="px-5 py-3">Tanggal</th>
                                <th className="px-5 py-3 text-right">Jumlah Pax</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            <tr>
                                <td className="px-5 py-4 font-medium text-gray-800">{booking.user.name}</td>
                                <td className="px-5 py-4 text-gray-600">{formatDate(detail.visit_date)}</td>
                                <td className="px-5 py-4 text-gray-800 font-bold text-right">{detail.quantity} Orang</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-8 py-5 flex flex-col md:flex-row justify-between items-center border-t border-gray-200 gap-4">
                <div className="text-xs text-gray-400 text-center md:text-left">
                    * Tiket ini valid untuk satu kali masuk.<br/>
                    * Harap datang sebelum jam operasional tutup.
                </div>
                <button className="flex items-center gap-2 bg-[#F57C00] hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-md transition active:scale-95">
                    <Download className="w-4 h-4" /> Download E-Tiket
                </button>
            </div>

        </div>
      </div>
    </main>
  );
}