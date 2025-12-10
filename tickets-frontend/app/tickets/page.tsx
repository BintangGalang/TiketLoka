'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { Calendar, ChevronRight, Ticket, Loader2, AlertCircle, MapPin, Hash } from 'lucide-react';
import { Booking } from '@/types'; // Pastikan path import type benar
import { useAuth } from '@/context/AuthContext';

export default function MyTicketsPage() {
  const { token, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper URL Gambar
  const getImageUrl = (url: string | null) => {
    if (!url) return 'https://images.unsplash.com/photo-1596423348633-8472df3b006c?auto=format&fit=crop&w=800';
    if (url.startsWith('http')) return url;
    return `http://127.0.0.1:8000/storage/${url}`;
  };

  useEffect(() => {
    if (authLoading) return;

    const fetchBookings = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Sesuaikan endpoint dengan backend Anda
        const res = await fetch('http://127.0.0.1:8000/api/my-bookings', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        const json = await res.json();
        if (res.ok) {
            setBookings(json.data);
        } else {
            console.error("Gagal ambil tiket:", json.message);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [token, authLoading]);

  // --- LOGIKA UTAMA: MEMECAH TIKET (FLATTENING) ---
  const allTickets = bookings.flatMap(booking => 
    booking.details.map((detail, index) => ({
      ...detail,
      parent_status: booking.status,
      parent_code: booking.booking_code,
      parent_id: booking.id,
      parent_total: booking.grand_total,
      // PENTING: Simpan index urutan tiket ini dalam booking (0, 1, 2...)
      // Ini nanti dipakai untuk memberi tahu halaman detail mana yang harus ditampilkan
      relative_index: index 
    }))
  );

  return (
    <main className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-800">
      <Navbar />
      
      <div className="max-w-md mx-auto pt-24 px-4">
        <h1 className="text-2xl font-bold text-[#0B2F5E] mb-6 flex items-center gap-2">
            <Ticket className="w-6 h-6" /> Tiket Saya
        </h1>

        {(loading || authLoading) ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#F57C00] w-8 h-8" /></div>
        ) : !token ? (
           <div className="text-center py-10 text-gray-500 bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-[#F57C00]" />
            <p className="font-medium">Silakan login untuk melihat tiket Anda.</p>
            <Link href="/login" className="mt-4 inline-block bg-[#0B2F5E] text-white px-6 py-2 rounded-full font-bold hover:bg-[#09254A] transition">Login Sekarang</Link>
          </div>
        ) : allTickets.length === 0 ? (
          <div className="text-center py-16 text-gray-500 bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Ticket className="w-8 h-8 opacity-30" />
            </div>
            <p className="font-bold text-lg text-gray-700">Belum ada tiket aktif</p>
            <Link href="/" className="mt-4 inline-block bg-[#F57C00] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-orange-200">
                Cari Wisata
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* RENDER KARTU TIKET TERPISAH */}
            {allTickets.map((ticket, idx) => (
              <Link 
                // KUNCI: Kirim index tiket di URL (Query Param)
                // Contoh URL: /tickets/TL123?index=0
                href={`/tickets/${ticket.parent_code}?index=${ticket.relative_index}`} 
                
                key={`${ticket.parent_id}-${ticket.id}-${idx}`}
                className="block bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-[#F57C00] hover:shadow-md transition-all group relative overflow-hidden"
              >
                {/* Hiasan background hover */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-orange-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-150 z-0"></div>

                <div className="relative z-10 flex gap-4 items-start">
                    {/* Gambar Thumbnail */}
                    <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm">
                        <img 
                            src={getImageUrl(ticket.destination.image_url)} 
                            alt={ticket.destination.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1596423348633-8472df3b006c?auto=format&fit=crop&w=800'; }}
                        />
                    </div>

                    {/* Info Utama */}
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border ${
                                ticket.parent_status === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 
                                ticket.parent_status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : 'bg-red-50 text-red-700 border-red-100'
                            }`}>
                                {ticket.parent_status}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono flex items-center gap-0.5">
                                <Hash className="w-3 h-3" /> {ticket.parent_code}
                            </span>
                        </div>

                        <h3 className="font-bold text-[#0B2F5E] text-base leading-tight mb-1 truncate">
                            {ticket.destination.name}
                        </h3>

                        <div className="flex flex-col gap-1">
                            <div className="flex items-center text-xs text-gray-500 gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-[#F57C00]" />
                                <span className="font-medium">{ticket.visit_date}</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-500 gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-[#F57C00]" />
                                <span>{ticket.quantity} Pax</span>
                            </div>
                        </div>
                    </div>

                    <div className="self-center">
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#F57C00] transition-colors" />
                    </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}