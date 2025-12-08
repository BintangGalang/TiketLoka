// src/components/home/DestinationGridSection.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Destination } from '@/types';
import { MapPin, Loader2 } from 'lucide-react'; 

export default function DestinationGridSection({ endpoint, title, limit = 10 }: { endpoint: string, title: string, limit?: number }) {
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
            try {
                // Fetch data dari endpoint yang dikirimkan (misal: /destinations/popular)
                const res = await fetch(endpoint);
                const json = await res.json();
                setDestinations(json.data || []);
            } catch (err) {
                console.error(`Gagal fetching data dari ${endpoint}:`, err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [endpoint]);

    if (loading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-[#0B2F5E]"/></div>;
    if (destinations.length === 0 && !loading) return null;

    return (
        <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-extrabold text-[#0B2F5E] mb-8 text-center">
                    {title}
                </h2>

                {/* Grid 5 Kolom (Sama seperti yang Anda minta) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {destinations.map((item) => (
                        <Link 
                            key={item.id}
                            href={`/events/${item.slug}`} 
                            className="group block rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 bg-white border border-gray-100"
                        >
                            <div className="relative h-40 w-full">
                                <Image
                                    src={getImageUrl(item.image_url)}
                                    alt={item.name}
                                    fill
                                    sizes="(max-width: 768px) 50vw, 20vw"
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    unoptimized={true}
                                />
                                <div className="absolute inset-0 bg-black/10"></div>
                            </div>
                            
                            <div className="p-3">
                                <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                                    {item.name}
                                </h3>
                                <div className="flex items-center text-gray-500 text-xs mt-1">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {item.location}
                                </div>
                                <p className="text-xl font-extrabold text-[#F57C00] mt-3">
                                    Rp {Number(item.price).toLocaleString('id-ID')}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}