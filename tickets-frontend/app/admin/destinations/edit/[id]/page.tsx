'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Upload, Loader2, Save, ImageIcon, XCircle, Globe, Search } from 'lucide-react'; // Tambah icon
import Link from 'next/link';

export default function EditDestinationPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();
  const destinationId = params.id;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    description: '',
    price: '',
    location: '',
    is_active: true,
    // Tambahan State SEO
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
  });

  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resCat = await fetch('http://127.0.0.1:8000/api/categories');
        const jsonCat = await resCat.json();
        setCategories(jsonCat.data || jsonCat);

        const resDest = await fetch('http://127.0.0.1:8000/api/destinations?all=true');
        const jsonDest = await resDest.json();
        
        const data = jsonDest.data.find((item: any) => item.id == destinationId);

        if (data) {
          setFormData({
            name: data.name,
            category_id: data.category_id,
            description: data.description,
            price: data.price,
            location: data.location,
            is_active: Boolean(data.is_active),
            // Isi data SEO (gunakan nullish coalescing ?? '' jika kosong di db)
            meta_title: data.meta_title ?? '',
            meta_description: data.meta_description ?? '',
            meta_keywords: data.meta_keywords ?? '',
          });
          setCurrentImage(data.image_url);
        } else {
          alert("Data tidak ditemukan!");
          router.push('/admin/destinations');
        }

      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (destinationId) fetchData();
  }, [destinationId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, is_active: e.target.checked });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('category_id', formData.category_id);
      data.append('description', formData.description);
      data.append('price', String(formData.price)); 
      data.append('location', formData.location);
      data.append('is_active', formData.is_active ? '1' : '0');
      
      // Kirim Data SEO
      data.append('meta_title', formData.meta_title);
      data.append('meta_description', formData.meta_description);
      data.append('meta_keywords', formData.meta_keywords);

      if (newImage) {
        data.append('image', newImage);
      }

      const res = await fetch(`http://127.0.0.1:8000/api/admin/destinations/${destinationId}`, {
        method: 'POST', 
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        },
        body: data,
      });

      const json = await res.json();

      if (res.ok) {
        alert('Data berhasil diperbarui!');
        router.push('/admin/destinations');
      } else {
        console.error("Backend Error:", json);
        alert('Gagal: ' + (json.message || 'Terjadi kesalahan validasi data.'));
      }
    } catch (error) {
      console.error("Network/System Error:", error);
      alert('Terjadi kesalahan koneksi atau server error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder:text-gray-400 focus:border-[#0B2F5E] focus:ring-1 focus:ring-[#0B2F5E] outline-none transition-all text-sm shadow-sm";
  const labelClass = "block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide";

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#0B2F5E] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-800">
      
      {/* HEADER NAV */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 px-6 py-4 shadow-sm mb-8">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
            <Link 
                href="/admin/destinations" 
                className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500 hover:text-[#0B2F5E]"
            >
                <ArrowLeft size={20} />
            </Link>
            <div>
                <h1 className="font-bold text-[#0B2F5E] text-lg leading-tight">Edit Wisata</h1>
                <p className="text-xs text-gray-500">Perbarui informasi destinasi wisata.</p>
            </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* SECTION 0: Status */}
                <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100 flex items-center gap-3">
                    <input 
                        type="checkbox" id="is_active"
                        checked={formData.is_active} onChange={handleToggle}
                        className="w-5 h-5 accent-[#0B2F5E] cursor-pointer"
                    />
                    <label htmlFor="is_active" className="text-sm font-bold text-[#0B2F5E] cursor-pointer select-none">
                        Status Wisata: {formData.is_active ? 'AKTIF (Tampil di Web)' : 'NON-AKTIF (Disembunyikan)'}
                    </label>
                </div>

                {/* SECTION 1: Informasi Dasar */}
                <div>
                    <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-[#0B2F5E] rounded-full"></span> Informasi Utama
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelClass}>Nama Destinasi</label>
                            <input 
                                type="text" name="name" required value={formData.name} onChange={handleChange} 
                                className={inputClass} 
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Kategori</label>
                            <select 
                                name="category_id" required value={formData.category_id} onChange={handleChange} 
                                className={inputClass}
                            >
                                <option value="" disabled>Pilih Kategori</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* SECTION 2: Detail & Harga */}
                <div>
                    <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-[#F57C00] rounded-full"></span> Detail & Lokasi
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className={labelClass}>Lokasi</label>
                            <input 
                                type="text" name="location" required value={formData.location} onChange={handleChange} 
                                className={inputClass} 
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Harga Tiket (Rp)</label>
                            <input 
                                type="number"
                                name="price"
                                required value={formData.price}
                                onChange={handleChange} 
                                className={inputClass}
                                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                            />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Deskripsi Lengkap</label>
                        <textarea 
                            name="description" required rows={4} value={formData.description} onChange={handleChange} 
                            className={inputClass} 
                        ></textarea>
                    </div>
                </div>

                {/* SECTION 3: Upload Foto */}
                <div>
                    <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-gray-400 rounded-full"></span> Foto Galeri
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border rounded-xl p-2 bg-gray-50 flex items-center justify-center h-48 overflow-hidden relative">
                            {imagePreview ? (
                                <img src={imagePreview} alt="New Preview" className="h-full object-cover rounded-lg" />
                            ) : currentImage ? (
                                <img src={currentImage} alt="Current" className="h-full object-cover rounded-lg" />
                            ) : (
                                <div className="text-gray-400 flex flex-col items-center"><ImageIcon /> <span className="text-xs mt-1">No Image</span></div>
                            )}
                            <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded">
                                {imagePreview ? 'Gambar Baru' : 'Gambar Saat Ini'}
                            </span>
                        </div>
                        <div className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition relative overflow-hidden group">
                            <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleImageChange} />
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                                <Upload className="w-6 h-6 text-[#0B2F5E]" />
                            </div>
                            <p className="text-sm font-bold text-gray-700">Ganti Gambar</p>
                            <p className="text-xs text-gray-400 mt-1">Kosongkan jika tidak ingin mengubah</p>
                        </div>
                    </div>
                </div>

                {/* SECTION 4: Konfigurasi SEO (BARU) */}
                <div>
                    <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-purple-500 rounded-full"></span> Konfigurasi SEO
                    </h3>
                    <div className="space-y-6 bg-purple-50/30 p-6 rounded-xl border border-purple-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}><Globe size={12} className="inline mr-1"/> Meta Title</label>
                                <input 
                                    type="text" name="meta_title" 
                                    placeholder="Judul untuk Google Search"
                                    value={formData.meta_title} 
                                    className={inputClass} onChange={handleChange} 
                                />
                            </div>
                            <div>
                                <label className={labelClass}><Search size={12} className="inline mr-1"/> Meta Keywords</label>
                                <input 
                                    type="text" name="meta_keywords" 
                                    placeholder="wisata bali, pantai kuta, liburan"
                                    value={formData.meta_keywords} 
                                    className={inputClass} onChange={handleChange} 
                                />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Meta Description</label>
                            <textarea 
                                name="meta_description" rows={3} 
                                placeholder="Deskripsi singkat yang muncul di hasil pencarian Google..." 
                                value={formData.meta_description}
                                className={inputClass} onChange={handleChange} 
                            ></textarea>
                        </div>
                    </div>
                </div>

                <hr className="border-gray-100" />

                <div className="flex justify-end gap-3 pt-2">
                    <Link 
                        href="/admin/destinations"
                        className="px-6 py-2.5 rounded-lg font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition flex items-center gap-2 text-sm"
                    >
                        <XCircle size={18} /> Batal
                    </Link>

                    <button 
                        type="submit" disabled={isSubmitting}
                        className="bg-[#0B2F5E] text-white px-8 py-2.5 rounded-lg font-bold hover:bg-[#061A35] transition flex items-center gap-2 disabled:opacity-70 shadow-md text-sm"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : <><Save size={18} /> Simpan Perubahan</>}
                    </button>
                </div>

            </form>
        </div>
      </div>
    </div>
  );
}