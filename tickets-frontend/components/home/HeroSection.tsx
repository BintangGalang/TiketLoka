// src/components/home/HeroSection.tsx
'use client';

import { useState } from 'react'; // Tambah useState
import { useRouter } from 'next/navigation'; // Tambah useRouter
import { Search } from 'lucide-react';
import HeroBackgroundSlider from './HeroBackgroundSlider';

export default function HeroSection() {
    const [searchTerm, setSearchTerm] = useState(''); // State untuk input
    const router = useRouter(); // Inisialisasi router

    const handleSearch = () => {
        if (searchTerm.trim()) {
            // Redirect ke /events dengan search term sebagai query parameter
            router.push(`/events?search=${encodeURIComponent(searchTerm.trim())}`);
        } else {
             // Jika input kosong, tetap arahkan ke halaman events
             router.push('/events');
        }
    };

    return (
        <div className="relative overflow-hidden min-h-[500px] flex items-center pt-24 pb-20 md:pt-32 md:pb-32">
            
            {/* 1. LAYER BACKGROUND SLIDER (Absolute, z-0) */}
            <div className="absolute inset-0 z-0">
                <HeroBackgroundSlider />
            </div>

            {/* 2. LAYER OVERLAY HITAM (z-10) */}
            <div className="absolute inset-0 bg-black/50 z-10"></div>
            
            {/* 3. LAYER KONTEN (Relative, z-20) */}
            <div className="max-w-7xl mx-auto px-4 text-center relative z-20 w-full text-white">
                
                <h1 className="text-5xl font-extrabold mb-4">
                    Jelajahi Wisata <span className="text-[#F57C00]">Tanpa Batas</span>
                </h1>
                
                <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
                    Temukan destinasi impianmu dan pesan tiketnya sekarang juga di TiketLoka.
                </p>

                {/* Search Input Area */}
                <div className="max-w-xl mx-auto bg-white p-2 rounded-full shadow-2xl flex items-center">
                    <Search className="w-5 h-5 text-gray-500 ml-4" />
                    <input 
                        type="text"
                        placeholder="Mau liburan ke mana?"
                        // 1. Tangkap input dan update state
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        // 2. Handle Enter key
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch();
                            }
                        }}
                        className="flex-1 px-4 py-2 text-gray-800 focus:outline-none"
                    />
                    <button 
                        // 3. Handle klik tombol
                        onClick={handleSearch}
                        className="bg-[#F57C00] text-white px-6 py-2 rounded-full font-bold hover:bg-[#E65100]"
                    >
                        Cari Tiket
                    </button>
                </div>
            </div>
        </div>
    );
}