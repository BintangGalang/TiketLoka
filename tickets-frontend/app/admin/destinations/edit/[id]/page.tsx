'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Upload, Loader2, Save, ImageIcon, XCircle } from 'lucide-react'; // Tambah XCircle
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
    is_active: true
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

        const resDest = await fetch('http://127.0.0.1:8000/api/destinations');
        const jsonDest = await resDest.json();
        
        const data = jsonDest.data.find((item: any) => item.id == destinationId);

        if (data) {
          setFormData({
            name: data.name,
            category_id: data.category_id,
            description: data.description,
            price: data.price,
            location: data.location,
            is_active: Boolean(data.is_active)
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
      data.append('price', formData.price);
      data.append('location', formData.location);
      data.append('is_active', formData.is_active ? '1' : '0');

      if (newImage) {
        data.append('image', newImage);
      }

      const res = await fetch(`http://127.0.0.1:8000/api/admin/destinations/${destinationId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data,
      });

      if (res.ok) {
        alert('Data berhasil diperbarui!');
        router.push('/admin/destinations');
      } else {
        const json = await res.json();
        alert('Gagal: ' + (json.message || 'Cek data kembali'));
      }
    } catch (error) {
      alert('Terjadi kesalahan sistem');
    } finally {
      setIsSubmitting(false);
    }
  };

  // STYLE INPUT YANG DIPERJELAS
  const inputClass = "w-full p-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 focus:bg-white focus:border-[#0B2F5E] focus:ring-2 focus:ring-[#0B2F5E]/20 outline-none transition-all";

  if (isLoading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/destinations" className="p-2 bg-white rounded-lg hover:bg-gray-50 border shadow-sm">
            <ArrowLeft size={20} className="text-gray-600"/>
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Edit Wisata</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <input 
                    type="checkbox" 
                    id="is_active"
                    checked={formData.is_active}
                    onChange={handleToggle}
                    className="w-5 h-5 accent-[#0B2F5E] cursor-pointer"
                />
                <label htmlFor="is_active" className="font-bold text-[#0B2F5E] cursor-pointer select-none">
                    Status: {formData.is_active ? 'Aktif (Tampil di Web)' : 'Non-Aktif (Disembunyikan)'}
                </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nama Destinasi</label>
                    <input type="text" name="name" required value={formData.name} onChange={handleChange}
                        className={inputClass} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Kategori</label>
                    <select name="category_id" required value={formData.category_id} onChange={handleChange}
                        className={inputClass}>
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
                    <input type="text" name="location" required value={formData.location} onChange={handleChange}
                        className={inputClass} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Harga Tiket (Rp)</label>
                    <input type="number" name="price" required value={formData.price} onChange={handleChange}
                        className={inputClass} />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Deskripsi Lengkap</label>
                <textarea name="description" required rows={4} value={formData.description} onChange={handleChange}
                    className={inputClass} />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Foto Wisata</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-xl p-2 bg-gray-50 flex items-center justify-center h-48 overflow-hidden relative">
                        {imagePreview ? (
                            <img src={imagePreview} alt="New" className="h-full object-cover rounded-lg" />
                        ) : currentImage ? (
                            <img src={currentImage} alt="Current" className="h-full object-cover rounded-lg" />
                        ) : (
                            <div className="text-gray-400 flex flex-col items-center"><ImageIcon /></div>
                        )}
                        <span className="absolute bottom-2 bg-black/50 text-white text-xs px-2 py-1 rounded">Preview</span>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-100 transition relative overflow-hidden">
                        <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleImageChange} />
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                            <Upload className="w-6 h-6 text-[#0B2F5E]" />
                        </div>
                        <p className="text-sm font-medium text-gray-600">Upload Gambar Baru</p>
                        <p className="text-xs text-gray-400 mt-1">Kosongkan jika tidak ingin mengubah</p>
                    </div>
                </div>
            </div>

            <hr className="border-gray-100" />

            <div className="flex justify-end gap-3">
                {/* Tombol Batal */}
                <Link 
                    href="/admin/destinations"
                    className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition flex items-center gap-2"
                >
                    <XCircle size={18} /> Batal
                </Link>

                <button type="submit" disabled={isSubmitting}
                    className="bg-[#0B2F5E] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#061A35] transition flex items-center gap-2 disabled:opacity-70 shadow-lg shadow-blue-900/20">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Update Perubahan</>}
                </button>
            </div>

        </form>
      </div>
    </div>
  );
}