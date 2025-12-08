import Navbar from '@/components/layout/Navbar';
import DestinationGridSection from '@/components/home/DestinationGridSection'; // Ganti import lama
import HeroSection from '@/components/home/HeroSection';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      
      <Navbar />
      <HeroSection /> 

      {/* --- SECTION 1: DESTINASI POPULER (Diambil dari endpoint 'popular') --- */}
      <DestinationGridSection 
          title="Destinasi Paling Populer 🔥" 
          endpoint="http://127.0.0.1:8000/api/destinations/popular?limit=5" // Ambil 5 teratas
      />

      {/* --- SECTION 2: SEMUA EVENT (Diambil dari endpoint 'index' - Terbaru) --- */}
      <DestinationGridSection 
          title="Semua Destinasi" 
          endpoint="http://127.0.0.1:8000/api/destinations"
      />
      
      {/* Footer dan konten lain */}
      <footer className="bg-[#0B2F5E] text-white py-10 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <p>&copy; {new Date().getFullYear()} TiketLoka. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}