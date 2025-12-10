'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { 
  DollarSign, Ticket, Users, ShoppingBag, 
  WalletCards, LogOut, ChevronDown, Map, Clock, X 
} from 'lucide-react';

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
    user: { name: string; email: string; };
    details: {
        destination: { name: string; location: string; };
        quantity: number; // Tambahkan ini agar TypeScript tahu ada quantity
    }[];
  }[];
}

export default function AdminDashboard() {
  const { token, user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Filter Tanggal
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  async function fetchStats() {
    try {
      const url = new URL('http://127.0.0.1:8000/api/admin/dashboard');
      if (startDate) url.searchParams.append('start_date', startDate);
      if (endDate) url.searchParams.append('end_date', endDate);

      const res = await fetch(url.toString(), {
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

  useEffect(() => {
    if (token) fetchStats();
  }, [token, startDate, endDate]);

  const resetFilter = () => {
    setStartDate('');
    setEndDate('');
  };

  if (loading && !stats) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#0B2F5E] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-20">
      
      

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* HEADER & FILTER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div><h2 className="text-2xl font-bold text-gray-800">Statistik Penjualan</h2></div>
            
            <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 px-2 border-r border-gray-200">
                    <Clock size={16} className="text-gray-400" />
                    <span className="text-xs font-bold text-gray-500 uppercase">Periode</span>
                </div>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="text-sm border-none outline-none text-gray-600 cursor-pointer"/>
                <span className="text-gray-300">-</span>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="text-sm border-none outline-none text-gray-600 cursor-pointer"/>
                {(startDate || endDate) && (
                    <button onClick={resetFilter} className="p-1 hover:bg-gray-100 rounded-full text-red-500"><X size={16} /></button>
                )}
            </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatCard label="Total Pendapatan" value={stats ? `Rp ${Number(stats.total_revenue).toLocaleString('id-ID')}` : '-'} icon={<DollarSign size={20} className="text-green-600" />} color="border-green-200 bg-green-50" />
            <StatCard label="Total Transaksi" value={stats?.total_bookings || 0} icon={<ShoppingBag size={20} className="text-blue-600" />} color="border-blue-200 bg-blue-50" />
            <StatCard label="Tiket Terjual" value={stats?.total_tickets_sold || 0} icon={<Ticket size={20} className="text-orange-600" />} color="border-orange-200 bg-orange-50" />
            <StatCard label="Total User" value={stats?.total_users || 0} icon={<Users size={20} className="text-purple-600" />} color="border-purple-200 bg-purple-50" />
        </div>

        {/* TABEL TRANSAKSI */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-2">
                    <WalletCards size={18} className="text-gray-400" />
                    <h2 className="font-bold text-gray-800">Tabel Transaksi</h2>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200 text-xs uppercase">
                        <tr>
                            <th className="px-6 py-3 w-16 text-center">No</th>
                            <th className="px-6 py-3">ID Booking</th>
                            <th className="px-6 py-3">Destinasi</th>
                            <th className="px-6 py-3">Pemesan</th>
                            <th className="px-6 py-3">Tanggal</th>
                            {/* KOLOM BARU: KAPASITAS */}
                            <th className="px-6 py-3 text-center">Kapasitas</th> 
                            <th className="px-6 py-3">Total</th>
                            <th className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {stats && stats.recent_bookings.map((booking, index) => {
                            const destinationName = booking.details?.[0]?.destination?.name || 'Unknown';
                            // Hitung total pax (jumlah orang)
                            const totalPax = booking.details?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;
                            
                            return (
                                <tr key={booking.id} className="transition">
                                    <td className="px-6 py-4 text-center font-bold text-gray-600">{index + 1}</td>
                                    <td className="px-6 py-4 font-bold text-[#0B2F5E]">{booking.booking_code}</td>
                                    <td className="px-6 py-4 font-medium text-gray-600">{destinationName}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{booking.user.name}</td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(booking.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                    
                                    {/* ISI KAPASITAS */}
                                    <td className="px-6 py-4 text-center font-bold text-gray-700 bg-gray-50">
                                        {totalPax} Orang
                                    </td>

                                    <td className="px-6 py-4 font-bold text-gray-800">
                                        Rp {Number(booking.grand_total).toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4"><StatusBadge status={booking.status} /></td>
                                </tr>
                            );
                        })}
                        {stats && stats.recent_bookings.length === 0 && (
                            <tr>
                                <td colSpan={8} className="text-center py-8 text-gray-400">Belum ada data transaksi.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: any) {
    return (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between hover:shadow-md transition">
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                <h3 className="text-2xl font-extrabold text-gray-800">{value}</h3>
            </div>
            <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const colors: any = {
        success: 'bg-green-100 text-green-700',
        pending: 'bg-yellow-100 text-yellow-700',
        failed: 'bg-red-100 text-red-700',
    };
    const labels: any = {
        success: 'Lunas',
        pending: 'Menunggu',
        failed: 'Gagal'
    };

    return (
        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
            {labels[status] || status}
        </span>
    );
}