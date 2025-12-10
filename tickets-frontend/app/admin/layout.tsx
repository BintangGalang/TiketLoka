import Sidebar from '@/components/admin/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      
      {/* SIDEBAR (Tetap di kiri) */}
      <Sidebar />

      {/* KONTEN UTAMA (Di kanan sidebar) */}
      {/* ml-64 memberi margin kiri sebesar lebar sidebar agar konten tidak tertutup */}
      <main className="flex-1 ml-64 p-8 overflow-x-hidden">
        {children}
      </main>

    </div>
  );
}