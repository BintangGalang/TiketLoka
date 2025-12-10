'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Plus, Trash2, Edit, MapPin, Search, ImageIcon, Loader2, ArrowLeft, Tag, Filter } from 'lucide-react';
import Link from 'next/link';
import { Destination } from '@/types';

export default function AdminDestinations() {
  const { token } = useAuth();
  
  // Data Utama
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [categories, setCategories] = useState<any[]>([]); // State untuk menyimpan list kategori
  
  const [loading, setLoading] = useState(true);
  
  // State Filter & Search
  const [keyword, setKeyword] = useState('');      
  const [searchQuery, setSearchQuery] = useState(''); 
  const [selectedCategory, setSelectedCategory] = useState(''); // State untuk filter kategori yang dipilih
  
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // 1. Fetch Data Wisata & Kategori
  async function fetchData() {
    setLoading(true);
    try {
      // Ambil Wisata
      const resDest = await fetch('http://127.0.0.1:8000/api/destinations?all=true');
      const jsonDest = await resDest.json();
      setDestinations(jsonDest.data);

      // Ambil Kategori (Untuk isi dropdown filter)
      const resCat = await fetch('http://127.0.0.1:8000/api/categories');
      const jsonCat = await resCat.json();
      setCategories(jsonCat.data || jsonCat); // Handle jika format data berbeda

    } catch (err) {
      console.error("Gagal mengambil data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Delete
  const handleDelete = async (id: number) => {
    if(!confirm('Apakah Anda yakin ingin menghapus wisata ini? \n\nPERHATIAN: Data yang sudah pernah dipesan oleh user mungkin tidak dapat dihapus demi keamanan data transaksi.')) return;
    
    setDeletingId(id); 

    try {
        const res = await fetch(`http://127.0.0.1:8000/api/admin/destinations/${id}`, {
            method: 'DELETE',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        
        if(res.ok) {
            setDestinations(current => current.filter(item => item.id !== id));
            alert('Wisata berhasil dihapus.');
        } else {
            const json = await res.json();
            alert('Gagal menghapus: ' + (json.message || 'Terjadi kesalahan pada server.'));
            fetchData(); 
        }
    } catch (error) {
        console.error(error);
        alert('Terjadi kesalahan koneksi.');
    } finally {
        setDeletingId(null);
    }
  };

  const handleSearch = () => {
    setSearchQuery(keyword); 
  };

  // --- LOGIKA FILTER GANDA (SEARCH + KATEGORI) ---
  const filteredData = destinations.filter(item => {
    // 1. Cek Pencarian Teks
    const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Cek Filter Kategori
    // Jika selectedCategory kosong (''), berarti "Semua Kategori" (return true)
    // Jika ada isinya, cek apakah ID kategori item sama dengan yang dipilih
    const matchesCategory = selectedCategory === '' || String(item.category_id) === selectedCategory;

    // Item harus lolos KEDUA filter
    return matchesSearch && matchesCategory;
  });

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#0B2F5E] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-20">
      
      {/* 1. HEADER HALAMAN (Pengganti Navbar) */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 px-6 py-4 shadow-sm mb-8 flex justify-between items-center">
        <div>
            <h1 className="font-bold text-[#0B2F5E] text-xl">Kelola Wisata</h1>
            <p className="text-xs text-gray-500">Manajemen data destinasi wisata.</p>
        </div>
        
        <div className="flex gap-3">
            {/* TOMBOL TAMBAH WISATA (DITAMBAHKAN KEMBALI) */}
            <Link 
                href="/admin/destinations/create" 
                className="bg-[#0B2F5E] text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-[#061A35] transition shadow-md"
            >
                <Plus size={16} /> Tambah Wisata
            </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">

        {/* 2. AREA FILTER DAN PENCARIAN */}
        <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row items-center gap-2 max-w-4xl">
            
            {/* A. INPUT PENCARIAN */}
            <div className="flex-1 flex items-center gap-2 w-full px-2">
                <Search size={20} className="text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Cari nama wisata atau lokasi..." 
                    className="flex-1 py-2 outline-none text-sm text-gray-700 placeholder:text-gray-400 font-medium"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()} 
                />
            </div>

            {/* B. TOMBOL CARI */}
            <button 
                onClick={handleSearch}
                className="bg-[#0B2F5E] text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-[#09254A] transition w-full md:w-auto shadow-sm"
            >
                Cari
            </button>

            {/* C. DROPDOWN FILTER KATEGORI */}
            <div className="flex items-center gap-2 border-l border-gray-200 pl-4 pr-2 w-full md:w-auto">
                <Filter size={16} className="text-gray-400" />
                <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="py-2 outline-none text-sm text-gray-600 font-medium bg-transparent cursor-pointer min-w-[150px]"
                >
                    <option value="">Semua Provinsi</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>
        </div>

        {/* 3. TABEL DATA */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold border-b border-gray-200 tracking-wider">
                    <tr>
                        <th className="px-6 py-4 w-16 text-center">No</th>
                        <th className="px-6 py-4 w-24">Gambar</th>
                        <th className="px-6 py-4">Nama Destinasi</th>
                        <th className="px-6 py-4">Kategori</th>
                        <th className="px-6 py-4">Lokasi</th>
                        <th className="px-6 py-4">Harga Tiket</th>
                        <th className="px-6 py-4 text-center w-40">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredData.length > 0 ? (
                        filteredData.map((item, index) => (
                            <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                                <td className="px-6 py-4 align-middle text-center font-bold text-gray-400">
                                    {index + 1}
                                </td>
                                <td className="px-6 py-4 align-middle">
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative flex-shrink-0">
                                        {item.image_url ? (
                                            <img 
                                                src={item.image_url} 
                                                className="w-full h-full object-cover" 
                                                alt={item.name}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1596423348633-8472df3b006c?auto=format&fit=crop&w=100';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <ImageIcon size={24} />
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 align-middle">
                                    <h3 className="font-bold text-[#0B2F5E] text-base">{item.name}</h3>
                                </td>
                                <td className="px-6 py-4 align-middle">
                                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                                        {item.category?.name || 'Umum'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 align-middle">
                                    <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                                        <MapPin size={16} className="text-[#F57C00]"/> 
                                        {item.location}
                                    </div>
                                </td>
                                <td className="px-6 py-4 align-middle">
                                    <span className="font-bold text-gray-700 text-sm bg-gray-100 px-3 py-1 rounded-md border border-gray-200">
                                        Rp {Number(item.price).toLocaleString('id-ID')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 align-middle text-center">
                                    <div className="flex justify-center gap-2">
                                        <Link 
                                            href={`/admin/destinations/edit/${item.id}`}
                                            className="p-2 bg-white border border-gray-200 text-blue-600 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition shadow-sm"
                                            title="Edit"
                                        >
                                            <Edit size={16} />
                                        </Link>
                                        <button 
                                            onClick={() => handleDelete(item.id)} 
                                            disabled={deletingId === item.id}
                                            className={`p-2 border rounded-lg transition shadow-sm ${
                                                deletingId === item.id 
                                                ? 'bg-red-50 border-red-200 cursor-not-allowed' 
                                                : 'bg-white border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-200'
                                            }`}
                                            title="Hapus"
                                        >
                                            {deletingId === item.id ? (
                                                <Loader2 size={16} className="animate-spin text-red-600" />
                                            ) : (
                                                <Trash2 size={16} />
                                            )}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={7} className="text-center py-16 text-gray-400">
                                <div className="flex flex-col items-center gap-2">
                                    <Search size={32} className="opacity-20" />
                                    <p>Tidak ditemukan wisata sesuai filter.</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

      </div>
    </div>
  );
}