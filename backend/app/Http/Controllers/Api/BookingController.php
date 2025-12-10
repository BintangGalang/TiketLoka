<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Booking;
use App\Models\BookingDetail;
use App\Models\Destination;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class BookingController extends Controller
{
    // Beli dari keranjang (Checkout)
    public function checkout(Request $request)
    {
        $request->validate([
            'payment_method' => 'required|string',
            'cart_ids' => 'required|array|min:1',
            'cart_ids.*' => 'integer|exists:carts,id',
        ]);

        $userId = $request->user()->id;

        // Ambil item keranjang SESUAI YANG DIPILIH user & MILIK user tersebut
        $carts = Cart::with('destination')
            ->where('user_id', $userId)
            ->whereIn('id', $request->cart_ids)
            ->get();

        // Validasi: Jika user mencoba checkout ID cart orang lain / cart kosong
        if ($carts->isEmpty()) {
            return response()->json(['message' => 'Tidak ada item valid yang dipilih'], 400);
        }

        return DB::transaction(function () use ($request, $carts, $userId) {

            // Hitung Total
            $total = 0;
            foreach ($carts as $cart) {
                $total += $cart->destination->price * $cart->quantity;
            }

            // Generate Kode Booking Utama (Satu untuk semua item)
            do {
                $bookingCode = 'TL' . Str::upper(Str::random(6));
            } while (Booking::where('booking_code', $bookingCode)->exists());

            // Buat Transaksi Induk
            $booking = Booking::create([
                'user_id' => $userId,
                'booking_code' => $bookingCode,
                'grand_total' => $total,
                'status' => 'success', // Simulasi langsung sukses
                'paid_at' => now(),
                'payment_method' => $request->payment_method,
                'qr_string' => $bookingCode, // QR String untuk booking utama
            ]);

            // Kumpulkan ID cart yang berhasil diproses untuk dihapus nanti
            $processedCartIds = [];

            foreach ($carts as $cart) {
                // Generate Kode Tiket Unik Per Item
                // Format: TKT-{DestinationID}-{RandomString}
                $uniqueTicketCode = 'TKT-' . $cart->destination_id . '-' . Str::upper(Str::random(6));

                BookingDetail::create([
                    'booking_id' => $booking->id,
                    'destination_id' => $cart->destination_id,
                    'quantity' => $cart->quantity,
                    'price_per_unit' => $cart->destination->price,
                    'subtotal' => $cart->destination->price * $cart->quantity,
                    'visit_date' => $cart->visit_date,
                    'ticket_code' => $uniqueTicketCode, // <--- PENTING: Kode Unik Disimpan Disini
                ]);

                $processedCartIds[] = $cart->id;
            }

            // Hapus item yang dipilih dari keranjang
            Cart::whereIn('id', $processedCartIds)->delete();

            return response()->json([
                'message' => 'Transaksi berhasil',
                'booking_code' => $booking->booking_code,
                'data' => $booking
            ], 201);
        });
    }

    // Beli langsung (Buy Now - Tanpa Keranjang)
    public function buyNow(Request $request)
    {
        $userId = $request->user()->id;
        $destination = Destination::findOrFail($request->destination_id);

        return DB::transaction(function () use ($request, $userId, $destination) {

            $totalAmount = $destination->price * $request->quantity;
            
            do {
                $bookingCode = 'TL' . Str::upper(Str::random(6));
            } while (Booking::where('booking_code', $bookingCode)->exists());

            // Buat Booking Induk
            $booking = Booking::create([
                'user_id' => $userId,
                'booking_code' => $bookingCode,
                'grand_total' => $totalAmount,
                'status' => 'success',
                'paid_at' => now(),
                'payment_method' => $request->payment_method,
                'qr_string' => $bookingCode,
            ]);

            // Generate Kode Tiket Unik
            $uniqueTicketCode = 'TKT-' . $destination->id . '-' . Str::upper(Str::random(6));

            // Booking detail
            BookingDetail::create([
                'booking_id' => $booking->id,
                'destination_id' => $destination->id,
                'quantity' => $request->quantity,
                'price_per_unit' => $destination->price,
                'subtotal' => $totalAmount,
                'visit_date' => $request->visit_date,
                'ticket_code' => $uniqueTicketCode, // <--- PENTING
            ]);

            return response()->json([
                'message' => 'Transaksi berhasil & Pembayaran terkonfirmasi otomatis',
                'booking_code' => $booking->booking_code,
                'data' => $booking
            ], 201);
        });
    }

    // Riwayat Transaksi User
    public function myBookings()
    {
        $bookings = Booking::with(['details.destination'])
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $bookings]);
    }

    // Detail Satu Transaksi (Untuk User melihat Booking ID)
    public function show($booking_code)
    {
        $booking = Booking::with(['details.destination', 'user'])
            ->where('booking_code', $booking_code)
            ->firstOrFail();

        // Keamanan: Pastikan yang lihat adalah pemilik atau admin
        if ($booking->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json(['data' => $booking]);
    }

    // Lihat Semua Transaksi (Admin)
    public function adminIndex(Request $request)
    {
        $query = Booking::with('user');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter tanggal
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('created_at', [
                $request->start_date . ' 00:00:00',
                $request->end_date . ' 23:59:59'
            ]);
        }

        $bookings = $query->orderBy('created_at', 'desc')->get();

        return response()->json(['data' => $bookings]);
    }
}