// src/components/home/HeroBackgroundSlider.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules'; // Import module Autoplay & EffectFade
import 'swiper/css';
import 'swiper/css/effect-fade';
import { Destination } from '@/types'; // Asumsi Destination interface sudah di-import

export default function HeroBackgroundSlider() {
    const [destinations, setDestinations] = useState<Destination[]>([]);
    
    // Helper: URL Gambar (Sama seperti yang Anda gunakan di halaman Tiket)
    const getImageUrl = (url: string | null) => {
        if (!url) return 'https://images.unsplash.com/photo-1596423348633-8472df3b006c?auto=format&fit=crop&w=1920';
        if (url.startsWith('http')) return url;
        return `http://127.0.0.1:8000/storage/${url}`;
    };

    useEffect(() => {
        async function fetchData() {
            try {
                // Ambil 5 destinasi teratas untuk latar belakang
                const res = await fetch('http://127.0.0.1:8000/api/destinations'); 
                const json = await res.json();
                setDestinations(json.data.slice(0, 5) || []); // Ambil hanya 5 data pertama
            } catch (err) {
                console.error("Gagal fetching destinasi latar belakang:", err);
            }
        }
        fetchData();
    }, []);

    // Jika data kosong, gunakan background warna default agar tidak putih
    if (destinations.length === 0) return <div className="bg-[#0B2F5E] absolute inset-0"></div>;

    return (
        <Swiper
            modules={[Autoplay, EffectFade]}
            effect="fade"
            spaceBetween={0}
            slidesPerView={1}
            loop={true}
            speed={1500} // Kecepatan transisi gambar
            autoplay={{
                delay: 6000, // Ganti gambar setiap 6 detik
                disableOnInteraction: false,
            }}
            className="w-full h-full"
        >
            {destinations.map((item) => (
                <SwiperSlide key={item.id}>
                    <Image
                        src={getImageUrl(item.image_url)}
                        alt={item.name}
                        fill
                        className="object-cover"
                        unoptimized={true} // Wajib untuk gambar lokal/dev
                        priority={true} // Prioritas tinggi untuk Hero Section
                        sizes="100vw"
                    />
                </SwiperSlide>
            ))}
        </Swiper>
    );
}