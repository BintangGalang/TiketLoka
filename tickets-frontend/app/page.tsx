'use client'; // Ubah jadi Client Component karena pakai State

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import DestinationGridSection from '@/components/home/DestinationGridSection';
import HeroSection from '@/components/home/HeroSection';
import CategoryFilter from '@/components/home/CategoryFilter'; // Import Komponen Baru

export default function HomePage() {
  // State untuk menyimpan kategori yang dipilih
  const [selectedCategory, setSelectedCategory] = useState('');

  // Tentukan Endpoint berdasarkan kategori yang dipilih
  // Jika ada kategori: /api/destinations?category_slug=pantai
  // Jika tidak ada: /api/destinations
  const dynamicEndpoint = selectedCategory 
    ? `http://127.0.0.1:8000/api/destinations?category_slug=${selectedCategory}`
    : `http://127.0.0.1:8000/api/destinations`;

  const sectionTitle = selectedCategory 
    ? `Menampilkan Kategori: ${selectedCategory.replace('-', ' ').toUpperCase()}`
    : "Destinasi Terbaru";

  return (
    <main className="min-h-screen bg-gray-50">
      
      <Navbar />
      <HeroSection />

      {/* --- FILTER KATEGORI DI SINI --- */}
      <CategoryFilter 
        selectedSlug={selectedCategory} 
        onSelectCategory={setSelectedCategory} 
      />

      {/* Bagian Grid Destinasi yang berubah sesuai filter */}
      <DestinationGridSection 
          // Key penting agar React merender ulang saat endpoint berubah
          key={selectedCategory} 
          title={sectionTitle} 
          endpoint={dynamicEndpoint}
      />
      
      {/* Footer */}
      <footer className="bg-[#0B2F5E] text-white py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <p>&copy; {new Date().getFullYear()} TiketLoka. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}