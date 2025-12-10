'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Destination } from '@/types';
import { MapPin, Star, ArrowUpRight } from 'lucide-react'; 

export default function DestinationGridSection({ endpoint, title, limit }: { endpoint: string, title: string, limit?: number }) {
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [loading, setLoading] = useState(true);

    // Helper: URL Gambar
    const getImageUrl = (url: string | null) => {
        if (!url) return 'https://images.unsplash.com/photo-1517400508535-b2a1a062776c?q=80&w=2070';
        if (url.startsWith('http')) return url;
        return `http://127.0.0.1:8000/storage/${url}`;
    };

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const res = await fetch(endpoint);
                const json = await res.json();
                let data = json.data || [];
                
                // Limit data jika props limit ada
                if (limit && data.length > limit) {
                    data = data.slice(0, limit);
                }
                
                setDestinations(data);
            } catch (err) {
                console.error(`Gagal fetching data`, err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [endpoint, limit]);

    // --- RENDER SKELETON LOADING (Efek Loading Abu-abu) ---
    if (loading) return (
        <section className="py-12 bg-transparent">
            <div className="max-w-7xl mx-auto px-4">
                <div className="h-8 w-64 bg-gray-200 rounded-full animate-pulse mb-8 mx-auto"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white rounded-3xl overflow-hidden h-[400px] border border-gray-100 shadow-sm">
                            <div className="h-48 bg-gray-200 animate-pulse"></div>
                            <div className="p-5 space-y-3">
                                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );

    if (destinations.length === 0) return (
        <div className="py-20 text-center">
            <p className="text-gray-400 font-medium">Belum ada destinasi untuk kategori ini.</p>
        </div>
    );

    return (
        <section className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
                    <h2 className="text-3xl font-extrabold text-[#0B2F5E] text-center md:text-left leading-tight">
                        {title}
                    </h2>
                    {/* Opsional: Tombol Lihat Semua jika perlu */}
                    {limit && (
                        <Link href="/events" className="text-[#F57C00] font-bold hover:underline flex items-center gap-1">
                            Lihat Semua <ArrowUpRight size={18}/>
                        </Link>
                    )}
                </div>

                {/* --- GRID KARTU --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {destinations.map((item) => (
                        <Link 
                            key={item.id}
                            href={`/events/${item.slug}`} 
                            className="group block bg-white rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl border border-gray-100 transition-all duration-500 hover:-translate-y-2 relative"
                        >
                            {/* 1. IMAGE CONTAINER */}
                            <div className="relative aspect-[4/5] w-full overflow-hidden">
                                <Image
                                    src={getImageUrl(item.image_url)}
                                    alt={item.name}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                    unoptimized={true}
                                />
                                {/* Overlay Gradient Gelap di Bawah Gambar */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>

                                {/* Badge Kategori (Pojok Kiri Atas) */}
                                <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    {item.category?.name || 'Wisata'}
                                </div>

                                {/* Rating (Pojok Kanan Atas) */}
                                <div className="absolute top-4 right-4 flex items-center gap-1 text-yellow-400 bg-black/30 backdrop-blur-md px-2 py-1 rounded-lg">
                                    <Star size={12} fill="#FACC15" />
                                    <span className="text-xs font-bold text-white">4.8</span>
                                </div>

                                {/* KONTEN DI ATAS GAMBAR (BAGIAN BAWAH) */}
                                <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                                    {/* Lokasi */}
                                    <div className="flex items-center gap-1 text-gray-300 text-xs mb-2 font-medium">
                                        <MapPin size={14} className="text-[#F57C00]" />
                                        <span className="truncate">{item.location}</span>
                                    </div>

                                    {/* Judul */}
                                    <h3 className="text-xl font-bold leading-tight mb-3 line-clamp-2 group-hover:text-[#F57C00] transition-colors">
                                        {item.name}
                                    </h3>

                                    {/* Harga & Tombol */}
                                    <div className="flex items-center justify-between pt-3 border-t border-white/20">
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase font-bold">Mulai dari</p>
                                            <p className="text-lg font-extrabold text-[#F57C00]">
                                                Rp {Number(item.price).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                        <div className="bg-white text-[#0B2F5E] p-2 rounded-full transform group-hover:rotate-45 transition-transform duration-300">
                                            <ArrowUpRight size={20} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}