'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import DestinationGridSection from '@/components/home/DestinationGridSection';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext'; // Import Auth
import { 
  Search, MapPin, ArrowRight, Sparkles, 
  Palmtree, Building2, Landmark, Mountain, TreePine 
} from 'lucide-react';
import HeroBackgroundSlider from '@/components/home/HeroBackgroundSlider';

// --- KOMPONEN KATEGORI (ICON) ---
const CategoryItem = ({ icon: Icon, label, slug, isActive, onClick }: any) => (
  <button
    onClick={() => onClick(slug)}
    className={`
      flex flex-col items-center gap-3 min-w-[110px] p-4 rounded-2xl transition-all duration-300 group
      ${isActive 
        ? 'bg-[#0B2F5E] text-white shadow-lg transform -translate-y-1' 
        : 'bg-white text-gray-600 hover:bg-gray-50 hover:shadow-md'
      }
    `}
  >
    <div className={`
      p-3 rounded-full transition-colors
      ${isActive ? 'bg-white/10 text-white' : 'bg-gray-100 text-[#0B2F5E] group-hover:bg-[#0B2F5E]/10'}
    `}>
      <Icon size={24} />
    </div>
    <span className="text-sm font-bold">{label}</span>
  </button>
);

export default function HomePage() {
  const { user } = useAuth(); // Ambil data user login
  const [selectedCategory, setSelectedCategory] = useState('');

  // Endpoint Dinamis
  const dynamicEndpoint = selectedCategory 
    ? `http://127.0.0.1:8000/api/destinations?category_slug=${selectedCategory}`
    : `http://127.0.0.1:8000/api/destinations`;

  const sectionTitle = selectedCategory 
    ? `Menjelajahi Daerah: ${selectedCategory.replace('-', ' ').toUpperCase()}`
    : "Destinasi Paling Populer 🔥";

  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <Navbar />

      {/* --- 1. HERO SECTION MODERN --- */}
      <div className="relative h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Slider */}
        <div className="absolute inset-0 z-0">
           <HeroBackgroundSlider />
           <div className="absolute inset-0 bg-gradient-to-t from-[#0B2F5E]/90 via-[#0B2F5E]/40 to-black/30"></div>
        </div>

        {/* Konten Hero */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-10">
            <span className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold tracking-wider mb-6 animate-fade-in-up">
                ✨ JELAJAHI INDONESIA BERSAMA KAMI
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg">
                Temukan Surga <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F57C00] to-yellow-400">
                    Tersembunyi
                </span>
            </h1>
            <p className="text-gray-200 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-light">
                Nikmati kemudahan pesan tiket wisata tanpa antre. Ribuan destinasi menunggu petualanganmu selanjutnya.
            </p>

            {/* Search Bar Besar */}
            <div className="bg-white p-2 rounded-full shadow-2xl max-w-2xl mx-auto flex items-center transform transition-transform hover:scale-[1.02]">
                <div className="pl-6 text-gray-400">
                    <MapPin size={24} />
                </div>
                <input 
                    type="text" 
                    placeholder="Mau liburan ke mana hari ini?"
                    className="flex-1 p-4 bg-transparent outline-none text-gray-800 placeholder:text-gray-400 font-medium"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            window.location.href = `/events?search=${(e.target as HTMLInputElement).value}`;
                        }
                    }}
                />
                <button 
                   onClick={() => window.location.href = '/events'}
                   className="bg-[#0B2F5E] hover:bg-[#09254A] text-white px-8 py-4 rounded-full font-bold transition-all shadow-lg flex items-center gap-2"
                >
                    <Search size={20} /> Cari
                </button>
            </div>
        </div>
      </div>

      {/* --- 2. KATEGORI DAERAH (Floating) --- */}
      <div className="relative z-20 -mt-16 px-4">
        <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Destinasi Berdasarkan Daerah</h3>
                    <p className="text-xs text-gray-500">Pilih lokasi favorit liburanmu</p>
                </div>
                <button onClick={() => setSelectedCategory('')} className="text-sm text-[#F57C00] font-bold hover:underline">
                    Lihat Semua
                </button>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                <CategoryItem 
                    icon={Sparkles} label="Semua" slug="" 
                    isActive={selectedCategory === ''} onClick={setSelectedCategory} 
                />
                <CategoryItem 
                    icon={Palmtree} label="Bali" slug="bali" 
                    isActive={selectedCategory === 'bali'} onClick={setSelectedCategory} 
                />
                <CategoryItem 
                    icon={Landmark} label="Yogyakarta" slug="yogyakarta" 
                    isActive={selectedCategory === 'yogyakarta'} onClick={setSelectedCategory} 
                />
                <CategoryItem 
                    icon={Mountain} label="Jawa Timur" slug="jawa-timur" 
                    isActive={selectedCategory === 'jawa-timur'} onClick={setSelectedCategory} 
                />
                <CategoryItem 
                    icon={TreePine} label="Jawa Barat" slug="jawa-barat" 
                    isActive={selectedCategory === 'jawa-barat'} onClick={setSelectedCategory} 
                />
                <CategoryItem 
                    icon={Building2} label="DKI Jakarta" slug="dki-jakarta" 
                    isActive={selectedCategory === 'dki-jakarta'} onClick={setSelectedCategory} 
                />
                 {/* Tambahkan daerah lain sesuai slug di database */}
            </div>
        </div>
      </div>

      {/* --- 3. KONTEN UTAMA (GRID) --- */}
      <div className="py-12">
         <DestinationGridSection 
            key={selectedCategory}
            title={sectionTitle} 
            endpoint={dynamicEndpoint}
        />
      </div>

      {/* --- 4. SECTION PROMO / CTA --- */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto bg-[#0B2F5E] rounded-[3rem] overflow-hidden relative shadow-2xl">
            {/* Dekorasi Background */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#F57C00] rounded-full blur-[100px] opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-400 rounded-full blur-[80px] opacity-20 transform -translate-x-1/3 translate-y-1/3"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-10 md:p-20 gap-10">
                <div className="md:w-1/2 text-left">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                        Liburan Impian <br/>
                        Mulai dari Sini.
                    </h2>
                    <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                        Dapatkan penawaran eksklusif dan diskon menarik. 
                        Jangan lewatkan momen berharga bersama orang tercinta.
                    </p>
                    <div className="flex gap-4">
                        <Link href="/events" className="bg-[#F57C00] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#E65100] transition shadow-lg shadow-orange-900/20 flex items-center gap-2">
                            Pesan Tiket <ArrowRight size={20}/>
                        </Link>
                        
                        {/* HANYA TAMPIL JIKA USER BELUM LOGIN */}
                        {!user && (
                            <Link href="/register" className="bg-white/10 backdrop-blur border border-white/20 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition">
                                Daftar Akun
                            </Link>
                        )}
                    </div>
                </div>
                
                {/* Ilustrasi Gambar Promo */}
                <div className="md:w-1/2 relative">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-4 mt-8">
                             <div className="h-40 w-full bg-gray-300 rounded-2xl overflow-hidden shadow-lg transform rotate-[-3deg]">
                                <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400" className="w-full h-full object-cover" />
                             </div>
                             <div className="h-56 w-full bg-gray-300 rounded-2xl overflow-hidden shadow-lg transform rotate-[2deg]">
                                <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=400" className="w-full h-full object-cover" />
                             </div>
                        </div>
                        <div className="space-y-4">
                             <div className="h-56 w-full bg-gray-300 rounded-2xl overflow-hidden shadow-lg transform rotate-[3deg]">
                                <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400" className="w-full h-full object-cover" />
                             </div>
                             <div className="h-40 w-full bg-gray-300 rounded-2xl overflow-hidden shadow-lg transform rotate-[-2deg]">
                                <img src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400" className="w-full h-full object-cover" />
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <h3 className="text-2xl font-extrabold text-[#0B2F5E] mb-4">TiketLoka</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Platform pemesanan tiket wisata termudah dan terpercaya di Indonesia.
            </p>
            <div className="flex justify-center gap-6 text-gray-400 mb-8">
                <a href="#" className="hover:text-[#F57C00]">Instagram</a>
                <a href="#" className="hover:text-[#F57C00]">Twitter</a>
                <a href="#" className="hover:text-[#F57C00]">Facebook</a>
            </div>
            <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} TiketLoka. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}