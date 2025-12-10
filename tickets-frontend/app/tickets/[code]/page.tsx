'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react'; 
import { Booking } from '@/types';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, MapPin, Calendar, Download, Loader2, Ticket, AlertCircle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// Helper Gambar
const getImageUrl = (url: string | null) => {
    if (!url) return 'https://images.unsplash.com/photo-1596423348633-8472df3b006c?auto=format&fit=crop&w=800';
    if (url.startsWith('http')) return url;
    return `http://127.0.0.1:8000/storage/${url}`;
};

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();
  const bookingCode = params.code as string;
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!token) { router.push('/login'); return; }
    if(!bookingCode) return;

    const fetchDetail = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/bookings/${bookingCode}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        
        if (res.ok) {
            setBooking(json.data);
            // Debugging: Cek di console browser apakah ticket_code ada
            console.log("Data Booking:", json.data); 
        } else {
            console.error("Gagal ambil tiket");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [bookingCode, token, authLoading, router]);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="animate-spin text-[#F57C00]"/></div>;
  if (!booking) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Tiket tidak ditemukan</div>;

  return (
    <main className="min-h-screen bg-gray-100 pb-20">
      
      {/* --- HEADER BIRU --- */}
      <div className="bg-[#0B2F5E] pb-24 pt-6 px-4">
        <div className="max-w-md mx-auto">
            <Link href="/tickets" className="flex items-center gap-2 text-white/80 hover:text-white mb-6 w-fit">
               <ArrowLeft className="w-5 h-5" /> Kembali
            </Link>
            <h1 className="text-2xl font-bold text-white">E-Ticket Anda</h1>
            <p className="text-white/60 text-sm mt-1">Tunjukkan QR Code di loket masuk.</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-16 space-y-6">
        
        {/* --- KARTU INFO TRANSAKSI UTAMA --- */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4 border-b border-dashed border-gray-200 pb-4">
                <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Kode Transaksi</p>
                    <p className="text-xl font-extrabold text-[#0B2F5E]">{booking.booking_code}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      booking.status === 'success' ? 'bg-green-100 text-green-700' : 
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                }`}>
                    {booking.status}
                </span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm font-medium">Total Pembayaran</span>
                <span className="text-lg font-bold text-[#F57C00]">Rp {Number(booking.grand_total).toLocaleString('id-ID')}</span>
            </div>
        </div>

        {/* --- LOOPING TIKET PER ITEM --- */}
        {booking.details.map((detail, idx) => (
            <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 relative transition-transform hover:scale-[1.01]">
                
                {/* Hiasan Bolongan Tiket */}
                <div className="absolute -left-3 top-[45%] w-6 h-6 bg-gray-100 rounded-full z-10"></div>
                <div className="absolute -right-3 top-[45%] w-6 h-6 bg-gray-100 rounded-full z-10"></div>

                {/* Bagian Atas: Detail Wisata */}
                <div className="p-5 flex gap-4 bg-white">
                    <div className="h-16 w-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200">
                        <img 
                            src={getImageUrl(detail.destination.image_url)} 
                            alt={detail.destination.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1596423348633-8472df3b006c?auto=format&fit=crop&w=800'; }}
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[#0B2F5E] text-lg leading-tight line-clamp-2">{detail.destination.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                            <Calendar className="w-3.5 h-3.5" /> 
                            <span className="font-medium">{detail.visit_date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <MapPin className="w-3.5 h-3.5" /> 
                            <span>{detail.quantity} Orang</span>
                        </div>
                    </div>
                </div>

                {/* Garis Putus-putus Pemisah */}
                <div className="border-t-2 border-dashed border-gray-200 mx-2"></div>

                {/* Bagian Bawah: QR CODE UNIK */}
                <div className="p-8 flex flex-col items-center justify-center bg-gray-50/50">
                    <p className="text-xs text-gray-400 mb-3 font-bold uppercase tracking-widest">Scan Kode Tiket Ini</p>
                    
                    <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm mb-4">
                        {/* LOGIKA PENTING: Prioritaskan ticket_code */}
                        {detail.ticket_code ? (
                             <QRCodeSVG 
                                value={detail.ticket_code} // GUNAKAN KODE UNIK
                                size={140}
                                level="H"
                                fgColor="#0B2F5E"
                             />
                        ) : (
                             // Fallback jika data lama (ticket_code null)
                             <div className="flex flex-col items-center justify-center w-[140px] h-[140px] bg-gray-100 rounded text-center p-2">
                                <QRCodeSVG value={booking.booking_code} size={100} opacity={0.5} />
                                <span className="text-[10px] text-red-500 mt-2 font-bold">Data Lama (No Unique Code)</span>
                             </div>
                        )}
                    </div>

                    {/* Tampilkan Teks Kode */}
                    <p className="font-mono text-xl font-extrabold text-gray-800 tracking-widest uppercase">
                        {detail.ticket_code || booking.booking_code}
                    </p>
                    
                    {/* Pesan Bantuan jika kode kosong */}
                    {!detail.ticket_code && (
                        <div className="mt-2 flex items-center gap-1 text-[10px] text-orange-600 bg-orange-50 px-2 py-1 rounded">
                            <AlertCircle className="w-3 h-3" />
                            <span>Tiket ini dibuat sebelum update sistem.</span>
                        </div>
                    )}
                </div>
            </div>
        ))}

        <div className="h-10"></div>
      </div>
    </main>
  );
}