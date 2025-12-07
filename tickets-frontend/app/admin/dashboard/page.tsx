'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { 
  DollarSign, Ticket, Users, ShoppingBag, 
  Clock, ArrowRight, LogOut, ChevronDown, 
  Map, Settings // Gunakan Icon Map/Settings untuk Kelola
} from 'lucide-react';

// ... (Interface & State sama seperti sebelumnya) ...
interface DashboardData {
  total_revenue: number;
  total_bookings: number;
  total_tickets_sold: number;
  total_users: number;
  recent_bookings: {
    id: number;
    booking_code: string;
    grand_total: number;
    status: string;
    created_at: string;
    user: { name: string; email: string; }
  }[];
}

export default function AdminDashboard() {
  const { token, user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/admin/dashboard', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        const json = await res.json();
        if (res.ok) setStats(json.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchStats();
  }, [token]);

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#0B2F5E] border-t-transparent rounded-full animate-spin"></div>
        </div>
    </div>
  );

  if (!stats) return <div className="p-8 text-center text-red-500">Gagal memuat data.</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
            <h1 className="text-3xl font-extrabold text-[#0B2F5E]">Dashboard</h1>
            <p className="text-gray-500 mt-1">
                Halo, <span className="font-bold text-gray-700">{user?.name}</span>.
            </p>
        </div>
        
        <div className="flex gap-3 items-center">
            
            {/* UBAH TOMBOL DISINI: Menjadi "Kelola Wisata" */}
            <Link 
                href="/admin/destinations" 
                className="hidden md:flex px-5 py-2.5 bg-[#0B2F5E] text-white font-bold rounded-xl hover:bg-[#09254A] transition items-center gap-2 shadow-lg shadow-blue-900/20 text-sm"
            >
                <Map size={18} /> Kelola Wisata
            </Link>

            {/* Profil Dropdown (Sama seperti sebelumnya) */}
            <div className="relative">
                <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-3 bg-white border border-gray-200 pl-2 pr-4 py-1.5 rounded-xl hover:bg-gray-50 transition shadow-sm"
                >
                    <div className="w-10 h-10 bg-orange-100 text-[#F57C00] rounded-lg flex items-center justify-center font-bold border border-orange-200 text-lg">
                        {user?.name?.charAt(0) || 'A'}
                    </div>
                    <div className="text-left hidden sm:block">
                        <p className="text-sm font-bold text-gray-700 leading-tight">{user?.name}</p>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Admin</p>
                    </div>
                    <ChevronDown size={16} className="text-gray-400" />
                </button>

                {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl p-2 z-50">
                        <div className="px-3 py-2 border-b border-gray-100 mb-2">
                             <p className="font-bold text-sm text-[#0B2F5E]">{user?.name}</p>
                             <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        </div>
                        <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition">
                            <LogOut size={16} /> Keluar
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* --- STATISTIC CARDS (Tetap Sama) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          title="Total Pendapatan" 
          value={`Rp ${Number(stats.total_revenue).toLocaleString('id-ID')}`} 
          icon={<DollarSign className="w-6 h-6 text-emerald-600" />} 
          bg="bg-emerald-50 border-emerald-100"
        />
        <StatCard 
          title="Transaksi Sukses" 
          value={stats.total_bookings} 
          icon={<ShoppingBag className="w-6 h-6 text-blue-600" />} 
          bg="bg-blue-50 border-blue-100"
        />
        <StatCard 
          title="Tiket Terjual" 
          value={stats.total_tickets_sold} 
          icon={<Ticket className="w-6 h-6 text-orange-600" />} 
          bg="bg-orange-50 border-orange-100"
        />
        <StatCard 
          title="Total Pelanggan" 
          value={stats.total_users} 
          icon={<Users className="w-6 h-6 text-purple-600" />} 
          bg="bg-purple-50 border-purple-100"
        />
      </div>

      {/* --- TABLE TRANSAKSI TERBARU (Sama seperti sebelumnya) --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
         <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h3 className="text-lg font-bold text-[#0B2F5E] flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-400" /> Transaksi Terbaru
                </h3>
            </div>
            <Link href="/admin/bookings" className="text-sm font-bold text-[#0B2F5E] bg-gray-50 px-4 py-2 rounded-lg hover:bg-gray-100 transition flex items-center gap-2">
                Lihat Semua <ArrowRight size={14}/>
            </Link>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50/50 text-gray-500 font-semibold border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-4">ID Transaksi</th>
                        <th className="px-6 py-4">Pelanggan</th>
                        <th className="px-6 py-4">Tanggal</th>
                        <th className="px-6 py-4">Total</th>
                        <th className="px-6 py-4">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {stats.recent_bookings.map((b) => (
                        <tr key={b.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-mono font-bold text-[#0B2F5E]">#{b.booking_code}</td>
                            <td className="px-6 py-4">{b.user?.name || 'Guest'}</td>
                            <td className="px-6 py-4 text-gray-500">
                                {new Date(b.created_at).toLocaleDateString('id-ID')}
                            </td>
                            <td className="px-6 py-4 font-bold text-[#F57C00]">
                                Rp {Number(b.grand_total).toLocaleString('id-ID')}
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${b.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {b.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, bg }: any) {
  return (
    <div className={`p-6 rounded-2xl shadow-sm border ${bg} bg-opacity-30 bg-white flex items-center gap-5`}>
      <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">{icon}</div>
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-[#0B2F5E]">{value}</h3>
      </div>
    </div>
  );
}