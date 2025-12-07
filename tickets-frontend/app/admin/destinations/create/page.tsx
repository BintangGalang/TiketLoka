'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Upload, Loader2, Save, XCircle } from 'lucide-react'; // Tambah icon XCircle
import Link from 'next/link';

export default function CreateDestinationPage() {
  const router = useRouter();
  const { token } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    description: '',
    price: '',
    location: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/categories')
      .then((res) => res.json())
      .then((json) => setCategories(json.data || json))
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if(!image) {
        alert("Wajib upload gambar!");
        setIsLoading(false);
        return;
    }

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('category_id', formData.category_id);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('location', formData.location);
      data.append('image', image);

      const res = await fetch('http://127.0.0.1:8000/api/admin/destinations', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data,
      });

      const json = await res.json();

      if (res.ok) {
        alert('Wisata berhasil ditambahkan!');
        router.push('/admin/destinations');
      } else {
        alert('Gagal: ' + (json.message || 'Cek kembali data Anda'));
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan sistem');
    } finally {
      setIsLoading(false);
    }
  };

  // --- STYLE INPUT YANG LEBIH JELAS ---
  const inputClass = "w-full p-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 focus:bg-white focus:border-[#0B2F5E] focus:ring-2 focus:ring-[#0B2F5E]/20 outline-none transition-all";

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/destinations" className="p-2 bg-white rounded-lg hover:bg-gray-50 border shadow-sm transition">
            <ArrowLeft size={20} className="text-gray-600"/>
        </Link>
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Tambah Wisata Baru</h1>
            <p className="text-sm text-gray-500">Isi formulir di bawah untuk menambahkan destinasi.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nama Destinasi</label>
                    <input 
                        type="text" 
                        name="name"
                        required
                        placeholder="Contoh: Pantai Kuta"
                        className={inputClass} // <--- Pakai style baru
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Kategori</label>
                    <select 
                        name="category_id" 
                        required 
                        className={inputClass} // <--- Pakai style baru
                        onChange={handleChange}
                        defaultValue=""
                    >
                        <option value="" disabled>Pilih Kategori</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Lokasi</label>
                    <input 
                        type="text" 
                        name="location"
                        required
                        placeholder="Contoh: Badung, Bali"
                        className={inputClass}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Harga Tiket (Rp)</label>
                    <input 
                        type="number" 
                        name="price"
                        required
                        placeholder="50000"
                        className={inputClass}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Deskripsi Lengkap</label>
                <textarea 
                    name="description"
                    required
                    rows={4}
                    placeholder="Jelaskan keindahan wisata ini..."
                    className={inputClass}
                    onChange={handleChange}
                ></textarea>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Foto Wisata</label>
                <div className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-100 transition relative overflow-hidden group">
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={handleImageChange}
                    />
                    
                    {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="h-48 object-contain rounded-lg shadow-sm" />
                    ) : (
                        <>
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                                <Upload className="w-6 h-6 text-[#0B2F5E]" />
                            </div>
                            <p className="text-sm font-medium text-gray-600">Klik untuk upload gambar</p>
                            <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP (Max 2MB)</p>
                        </>
                    )}
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* --- TOMBOL AKSI (SIMPAN & BATAL) --- */}
            <div className="flex justify-end gap-3">
                {/* Tombol Exit/Batal */}
                <Link 
                    href="/admin/destinations"
                    className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition flex items-center gap-2"
                >
                    <XCircle size={18} /> Batal
                </Link>

                {/* Tombol Simpan */}
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-[#0B2F5E] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#061A35] transition flex items-center gap-2 disabled:opacity-70 shadow-lg shadow-blue-900/20"
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Simpan Data</>}
                </button>
            </div>

        </form>
      </div>
    </div>
  );
}