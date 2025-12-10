'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { 
  DollarSign, Ticket, Users, ShoppingBag, 
  Clock, ArrowRight, LogOut, ChevronDown, 
  Map, Calendar, QrCode 
} from 'lucide-react';

// --- TIPE DATA ---
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
            <p className="text-gray-800 font-bold animate-pulse">Memuat Data Dashboard...</p>
        </div>
    </div>
  );

  if (!stats) return <div className="p-8 text-center text-red-600 font-bold">Gagal memuat data. Pastikan server backend menyala.</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
            <h1 className="text-3xl font-extrabold text-[#0B2F5E]">Dashboard</h1>
            <p className="text-gray-600 mt-2 font-medium">
                Selamat datang, <span className="font-bold text-gray-900">{user?.name}</span>.
            </p>
        </div>
        
        <div className="flex gap-3 items-center flex-wrap">
            
            {/* TOMBOL SCAN TIKET (Baru) */}
            <Link 
                href="/admin/scan" 
                className="flex px-5 py-3 bg-[#F57C00] text-white font-bold rounded-xl hover:bg-[#E65100] transition items-center gap-2 shadow-lg shadow-orange-200 text-sm"
            >
                <QrCode size={18} /> 
                <span>Scan Tiket</span>
            </Link>

            {/* Tombol Kelola Wisata */}
            <Link 
                href="/admin/destinations" 
                className="hidden md:flex px-5 py-3 bg-[#0B2F5E] text-white font-bold rounded-xl hover:bg-[#09254A] transition items-center gap-2 shadow-lg shadow-blue-900/20 text-sm"
            >
                <Map size={18} /> Kelola Wisata
            </Link>

            {/* Profil Dropdown */}
            <div className="relative">
                <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-3 bg-white border border-gray-300 pl-2 pr-4 py-2 rounded-xl hover:bg-gray-50 transition shadow-sm"
                >
                    <div className="w-10 h-10 bg-orange-100 text-[#F57C00] rounded-lg flex items-center justify-center font-extrabold border border-orange-200 text-lg">
                        {user?.name?.charAt(0) || 'A'}
                    </div>
                    <div className="text-left hidden sm:block">
                        <p className="text-sm font-bold text-gray-800 leading-tight">{user?.name}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Administrator</p>
                    </div>
                    <ChevronDown size={16} className="text-gray-600" />
                </button>

                {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-xl shadow-xl p-2 z-50">
                        <div className="px-3 py-3 border-b border-gray-100 mb-2">
                             <p className="font-bold text-sm text-[#0B2F5E]">{user?.name}</p>
                             <p className="text-xs text-gray-500 font-medium truncate">{user?.email}</p>
                        </div>
                        <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-bold transition">
                            <LogOut size={16} /> Keluar
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* --- STATISTIC CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          title="Total Pendapatan" 
          value={`Rp ${Number(stats.total_revenue).toLocaleString('id-ID')}`} 
          icon={<DollarSign className="w-7 h-7 text-emerald-700" />} 
          bg="bg-emerald-50 border-emerald-200"
          textColor="text-emerald-900"
        />
        <StatCard 
          title="Transaksi Sukses" 
          value={stats.total_bookings} 
          icon={<ShoppingBag className="w-7 h-7 text-blue-700" />} 
          bg="bg-blue-50 border-blue-200"
          textColor="text-blue-900"
        />
        <StatCard 
          title="Tiket Terjual" 
          value={stats.total_tickets_sold} 
          icon={<Ticket className="w-7 h-7 text-orange-700" />} 
          bg="bg-orange-50 border-orange-200"
          textColor="text-orange-900"
        />
        <StatCard 
          title="Total Pelanggan" 
          value={stats.total_users} 
          icon={<Users className="w-7 h-7 text-purple-700" />} 
          bg="bg-purple-50 border-purple-200"
          textColor="text-purple-900"
        />
      </div>

      {/* --- RECENT TRANSACTIONS TABLE --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-300 overflow-hidden">
        
        {/* Table Header */}
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50">
            <div>
                <h3 className="text-lg font-bold text-[#0B2F5E] flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-600" /> Transaksi Terbaru
                </h3>
                <p className="text-sm text-gray-600 font-medium">Daftar 5 pesanan terakhir yang masuk.</p>
            </div>
            <Link 
                href="/admin/bookings" 
                className="text-sm font-bold text-[#0B2F5E] bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 transition flex items-center gap-2 shadow-sm"
            >
                Lihat Semua <ArrowRight size={14}/>
            </Link>
        </div>
        
        {/* Table Content */}
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200 uppercase text-xs tracking-wider">
                    <tr>
                        <th className="px-6 py-4">ID Transaksi</th>
                        <th className="px-6 py-4">Pelanggan</th>
                        <th className="px-6 py-4">Tanggal Order</th>
                        <th className="px-6 py-4">Total Pembayaran</th>
                        <th className="px-6 py-4">Status</th>
                        {/* Kolom Aksi DIHAPUS sesuai request */}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {stats.recent_bookings.length > 0 ? (
                        stats.recent_bookings.map((b) => (
                            <tr key={b.id} className="hover:bg-blue-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <span className="font-mono font-bold text-[#0B2F5E] bg-blue-50 px-2 py-1 rounded border border-blue-100">
                                        #{b.booking_code}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm border border-gray-300">
                                            {b.user?.name?.substring(0, 2).toUpperCase() || 'GU'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-base">{b.user?.name || 'Guest User'}</p>
                                            <p className="text-xs text-gray-500 font-medium">{b.user?.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600 font-medium">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-gray-400"/>
                                        {new Date(b.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric', month: 'long', year: 'numeric'
                                        })}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-extrabold text-[#F57C00] text-base">
                                        Rp {Number(b.grand_total).toLocaleString('id-ID')}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={b.status} />
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="text-center py-12">
                                <div className="flex flex-col items-center justify-center text-gray-400">
                                    <ShoppingBag size={48} className="opacity-20 mb-3" />
                                    <p className="font-medium">Belum ada transaksi masuk hari ini.</p>
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

// --- KOMPONEN KARTU STATISTIK ---
function StatCard({ title, value, icon, bg, textColor }: any) {
  return (
    <div className={`p-6 rounded-2xl shadow-sm border ${bg} bg-opacity-40 bg-white flex items-center gap-5 hover:shadow-md transition-shadow`}>
      <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200">
        {icon}
      </div>
      <div>
        <p className="text-gray-600 text-sm font-bold mb-1">{title}</p>
        <h3 className={`text-3xl font-extrabold ${textColor ? textColor : 'text-[#0B2F5E]'}`}>{value}</h3>
      </div>
    </div>
  );
}

// --- BADGE STATUS ---
function StatusBadge({ status }: { status: string }) {
    let style = "";
    
    switch(status) {
        case 'success':
            style = "bg-green-100 text-green-800 border-green-300";
            break;
        case 'pending':
            style = "bg-yellow-100 text-yellow-800 border-yellow-300";
            break;
        case 'failed':
            style = "bg-red-100 text-red-800 border-red-300";
            break;
        default:
            style = "bg-gray-100 text-gray-800 border-gray-300";
    }

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border ${style}`}>
            {status}
        </span>
    );
}