'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Plus, Trash2, Tag, Loader2, Save } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function AdminCategories() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newName, setNewName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function fetchCategories() {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/categories');
      const json = await res.json();
      setCategories(json.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsSubmitting(true);
    try {
        const res = await fetch('http://127.0.0.1:8000/api/admin/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ name: newName })
        });
        const json = await res.json();
        if (res.ok) {
            setNewName('');
            fetchCategories();
            alert('Kategori berhasil ditambahkan!');
        } else {
            alert(json.message || 'Gagal');
        }
    } catch (error) {
        alert('Error koneksi');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if(!confirm('Hapus kategori ini?')) return;
    setDeletingId(id);
    try {
        const res = await fetch(`http://127.0.0.1:8000/api/admin/categories/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            setCategories(prev => prev.filter(c => c.id !== id));
        } else {
            const json = await res.json();
            alert(json.message || 'Gagal menghapus');
        }
    } catch (error) {
        alert('Error koneksi');
    } finally {
        setDeletingId(null);
    }
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-[#0B2F5E]"/></div>;

  return (
    <div>
        <h1 className="text-2xl font-bold text-[#0B2F5E] mb-6">Kelola Kategori</h1>
        
        {/* Form Tambah */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 max-w-2xl">
            <h2 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                <Plus size={16} className="text-[#F57C00]" /> Tambah Provinsi Baru
            </h2>
            <form onSubmit={handleAdd} className="flex gap-3">
                <input 
                    type="text" 
                    placeholder="Contoh: Jawa Timur" 
                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#0B2F5E] focus:ring-1 focus:ring-[#0B2F5E] outline-none text-sm"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                />
                <button type="submit" disabled={isSubmitting || !newName} className="bg-[#0B2F5E] text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-[#09254A] transition flex items-center gap-2 disabled:opacity-50">
                    {isSubmitting ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} Simpan
                </button>
            </form>
        </div>

        {/* Tabel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-w-4xl">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold">
                    <tr>
                        <th className="px-6 py-4 w-16 text-center">No</th>
                        <th className="px-6 py-4">Nama Provinsi</th>
                        <th className="px-6 py-4">Slug</th>
                        <th className="px-6 py-4 text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {categories.map((cat, index) => (
                        <tr key={cat.id} className="hover:bg-blue-50/50">
                            <td className="px-6 py-4 text-center font-bold text-gray-400">{index + 1}</td>
                            <td className="px-6 py-4 font-bold text-[#0B2F5E]">{cat.name}</td>
                            <td className="px-6 py-4 text-gray-500 font-mono text-xs">{cat.slug}</td>
                            <td className="px-6 py-4 text-center">
                                <button onClick={() => handleDelete(cat.id)} disabled={deletingId === cat.id} className="p-2 border border-gray-200 rounded-lg text-red-600 hover:bg-red-50 transition disabled:opacity-50">
                                    {deletingId === cat.id ? <Loader2 size={16} className="animate-spin"/> : <Trash2 size={16} />}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
}