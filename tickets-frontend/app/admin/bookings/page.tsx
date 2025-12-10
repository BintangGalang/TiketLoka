'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Search, Loader2, ChevronLeft, ChevronRight, Filter, RefreshCcw } from 'lucide-react';

// Tipe Data
interface Booking {
  id: number;
  booking_code: string;
  grand_total: number;
  status: string;
  created_at: string;
  user: { name: string; email: string };
  details: { 
    destination: { name: string };
    quantity: number;
  }[];
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
  from: number;
  to: number;
}

export default function AdminBookings() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  
  // State Filter
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch Data
  async function fetchBookings() {
    setLoading(true);
    try {
      const url = new URL('http://127.0.0.1:8000/api/admin/bookings');
      url.searchParams.append('page', page.toString());
      if (search) url.searchParams.append('search', search);
      if (statusFilter) url.searchParams.append('status', statusFilter);

      const res = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      
      const json = await res.json();
      
      if (json.data) {
        setBookings(json.data);
        setMeta({
            current_page: json.current_page,
            last_page: json.last_page,
            total: json.total,
            from: json.from,
            to: json.to
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBookings();
  }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchBookings();
  };

  const handleReset = () => {
    setSearch('');
    setStatusFilter('');
    setPage(1);
    fetchBookings();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-20">
      
      {/* HEADER SIMPLE */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 px-6 py-4 shadow-sm mb-8 flex justify-between items-center">
         <div>
            <h1 className="font-bold text-[#0B2F5E] text-lg">Semua Transaksi</h1>
            <p className="text-xs text-gray-500">Kelola dan pantau riwayat pemesanan.</p>
         </div>
         <button onClick={fetchBookings} className="p-2 hover:bg-gray-100 rounded-full text-gray-500" title="Refresh Data">
            <RefreshCcw size={18} />
         </button>
      </div>

      <div className="max-w-7xl mx-auto px-6">

        {/* TOOLBAR FILTER */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 justify-between">
            <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 relative">
                <Search size={18} className="absolute left-3 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Cari Kode Booking / Nama User..." 
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:border-[#0B2F5E] outline-none"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button type="submit" className="bg-[#0B2F5E] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#09254A]">
                    Cari
                </button>
            </form>

            <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-400" />
                <select 
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="py-2 pl-2 pr-8 rounded-lg border border-gray-200 text-sm outline-none cursor-pointer hover:border-[#0B2F5E]"
                >
                    <option value="">Semua Status</option>
                    <option value="success">Lunas (Success)</option>
                    <option value="pending">Menunggu (Pending)</option>
                    <option value="failed">Gagal (Failed)</option>
                </select>
            </div>
        </div>

        {/* TABEL DATA */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
                <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-[#0B2F5E]" /></div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200 text-xs uppercase">
                            <tr>
                                <th className="px-6 py-3 text-center">No</th>
                                <th className="px-6 py-3">Kode Booking</th>
                                <th className="px-6 py-3">Destinasi</th>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Tanggal</th>
                                {/* KOLOM BARU: KAPASITAS */}
                                <th className="px-6 py-3 text-center">Kapasitas</th> 
                                <th className="px-6 py-3">Total</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {bookings.length > 0 ? (
                                bookings.map((item, index) => {
                                    const rowNumber = meta ? (meta.current_page - 1) * 10 + (index + 1) : index + 1;
                                    const destName = item.details?.[0]?.destination?.name || 'Unknown';
                                    const pax = item.details?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;

                                    return (
                                        <tr key={item.id} className="hover:bg-blue-50/50 transition">
                                            <td className="px-6 py-4 text-center font-bold text-gray-400">{rowNumber}</td>
                                            <td className="px-6 py-4 font-mono font-medium text-[#0B2F5E]">{item.booking_code}</td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-gray-800">{destName}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{item.user.name}</div>
                                                <div className="text-xs text-gray-400">{item.user.email}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            
                                            {/* DATA KAPASITAS DIPINDAHKAN KESINI */}
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                                                    {pax} Orang
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 font-bold text-gray-800">
                                                Rp {Number(item.grand_total).toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={item.status} />
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={8} className="text-center py-10 text-gray-400">
                                        Tidak ada data transaksi ditemukan.
                                        <br/>
                                        <button onClick={handleReset} className="text-[#0B2F5E] font-bold text-xs mt-2 hover:underline">
                                            Reset Filter
                                        </button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* PAGINATION FOOTER */}
            {meta && meta.last_page > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                        Menampilkan <span className="font-bold">{meta.from}-{meta.to}</span> dari {meta.total} data
                    </p>
                    <div className="flex gap-2">
                        <button 
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-[#0B2F5E]">
                            {page}
                        </span>
                        <button 
                            disabled={page === meta.last_page}
                            onClick={() => setPage(page + 1)}
                            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>

      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
    const colors: any = {
        success: 'bg-green-100 text-green-700',
        pending: 'bg-yellow-100 text-yellow-700',
        failed: 'bg-red-100 text-red-700',
    };
    return (
        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
            {status}
        </span>
    );
}