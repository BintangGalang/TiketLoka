'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Plus, Trash2, Edit, MapPin, Search, ImageIcon, Loader2, ArrowLeft } from 'lucide-react'; // Tambah ArrowLeft
import Link from 'next/link';
import { Destination } from '@/types';

export default function AdminDestinations() {
  const { token } = useAuth();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Fetch Data
  async function fetchDestinations() {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/destinations'); 
      const json = await res.json();
      setDestinations(json.data);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDestinations();
  }, []);

  // Handle Delete
  const handleDelete = async (id: number) => {
    if(!confirm('Yakin ingin menghapus wisata ini? Tindakan ini permanen.')) return;
    
    try {
        const res = await fetch(`http://127.0.0.1:8000/api/admin/destinations/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if(res.ok) {
            alert('Wisata berhasil dihapus.');
            fetchDestinations(); // Refresh
        } else {
            alert('Gagal menghapus.');
        }
    } catch (error) {
        console.error(error);
    }
  };

  // Filter Search
  const filteredData = destinations.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.location.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-[#0B2F5E]" /></div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* HEADER: Tombol Kembali, Judul & Tombol Tambah */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
            {/* --- TOMBOL KEMBALI KE DASHBOARD --- */}
            <Link 
                href="/admin/dashboard" 
                className="p-3 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-[#0B2F5E] transition shadow-sm"
                title="Kembali ke Dashboard"
            >
                <ArrowLeft size={20} />
            </Link>
            {/* ----------------------------------- */}

            <div>
                <h1 className="text-2xl font-extrabold text-[#0B2F5E]">Kelola Wisata</h1>
                <p className="text-gray-500 text-sm">Manajemen daftar destinasi wisata Anda.</p>
            </div>
        </div>
        
        <Link 
            href="/admin/destinations/create" 
            className="bg-[#0B2F5E] text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#061A35] transition shadow-lg shadow-blue-900/20"
        >
            <Plus size={20} /> Tambah Wisata Baru
        </Link>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6 flex items-center gap-3">
        <Search className="text-gray-400 w-5 h-5" />
        <input 
            type="text" 
            placeholder="Cari nama wisata atau lokasi..." 
            className="flex-1 outline-none text-gray-700 font-medium placeholder:font-normal"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABEL LIST WISATA */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 text-gray-500 uppercase text-xs font-semibold border-b border-gray-100">
                <tr>
                    <th className="p-5 w-24">Gambar</th>
                    <th className="p-5">Informasi Wisata</th>
                    <th className="p-5">Harga Tiket</th>
                    <th className="p-5 text-center">Aksi</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {filteredData.length > 0 ? (
                    filteredData.map((item) => (
                        <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                            
                            {/* Kolom Gambar */}
                            <td className="p-5">
                                <div className="w-20 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative">
                                    {item.image_url ? (
                                        <img 
                                            src={item.image_url} 
                                            className="w-full h-full object-cover" 
                                            alt={item.name} 
                                            // Tambahkan unoptimized untuk gambar dari storage lokal
                                            // unoptimized={true} 
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <ImageIcon size={20} />
                                        </div>
                                    )}
                                </div>
                            </td>

                            {/* Kolom Info */}
                            <td className="p-5">
                                <h3 className="font-bold text-[#0B2F5E] text-base mb-1">{item.name}</h3>
                                <div className="flex items-center gap-1 text-gray-500 text-sm">
                                    <MapPin size={14} className="text-gray-400"/> {item.location}
                                </div>
                            </td>

                            {/* Kolom Harga */}
                            <td className="p-5">
                                <span className="font-extrabold text-[#F57C00] text-base">
                                    Rp {Number(item.price).toLocaleString('id-ID')}
                                </span>
                            </td>

                            {/* Kolom Aksi (Edit & Hapus) */}
                            <td className="p-5">
                                <div className="flex justify-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    {/* TOMBOL EDIT */}
                                    <Link 
                                      href={`/admin/destinations/edit/${item.id}`}
                                      className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-blue-600 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition shadow-sm font-medium text-xs"
                                    >
                                        <Edit size={14} /> Edit
                                    </Link>
                                    
                                    {/* TOMBOL HAPUS */}
                                    <button 
                                        onClick={() => handleDelete(item.id)} 
                                        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-200 transition shadow-sm font-medium text-xs"
                                    >
                                        <Trash2 size={14} /> Hapus
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={4} className="text-center py-12 text-gray-400">
                            Tidak ditemukan wisata dengan kata kunci tersebut.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
}