<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ReviewController extends Controller
{
    /**
     * Kirim Review Baru (Harus Login & Punya Tiket)
     */
    public function store(Request $request)
    {
        // 1. Validasi Input
        $request->validate([
            'destination_id' => 'required|exists:destinations,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:500',
            // Validasi Gambar: Wajib format gambar, maks 2MB
            'image'  => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048', 
        ]);

        $userId = $request->user()->id;

        // 2. Cek Valid Booking
        // Cari transaksi milik user ini, yang statusnya 'success', 
        // dan di dalamnya ada item tiket wisata yang mau direview.
        $validBooking = Booking::where('user_id', $userId)
            ->where('status', 'success')
            ->whereHas('details', function ($query) use ($request) {
                $query->where('destination_id', $request->destination_id);
            })
            ->latest()
            ->first();

        // Jika tidak ada transaksi valid
        if (!$validBooking) {
            return response()->json([
                'message' => 'Anda harus membeli tiket wisata ini dan menyelesaikan pembayaran sebelum memberi review.'
            ], 403);
        }

        // 3. Cek Duplikasi Review
        // Apakah user sudah pernah review untuk ID transaksi ini?
        $existingReview = Review::where('user_id', $userId)
            ->where('destination_id', $request->destination_id)
            ->where('booking_id', $validBooking->id)
            ->first();

        if ($existingReview) {
            return response()->json(['message' => 'Anda sudah memberikan ulasan untuk pembelian ini.'], 409);
        }

        // 4. Proses Upload Gambar (Jika Ada)
        $imagePath = null;
        if ($request->hasFile('image')) {
            // Simpan gambar ke folder 'storage/app/public/reviews'
            $imagePath = $request->file('image')->store('reviews', 'public');
        }

        // 5. Simpan Review ke Database
        $review = Review::create([
            'user_id' => $userId,
            'destination_id' => $request->destination_id,
            'booking_id' => $validBooking->id,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'image' => $imagePath, // Path gambar disimpan di sini
        ]);

        return response()->json([
            'message' => 'Terima kasih atas ulasan Anda!',
            'data' => $review
        ], 201);
    }

    /**
     * Lihat Review per Destinasi (Public)
     */
    public function index($destinationId)
    {
        // Ambil review berdasarkan ID Destinasi
        // Eager load relasi 'user' tapi ambil id & namenya saja (hemat bandwidth)
        $reviews = Review::with('user:id,name') 
            ->where('destination_id', $destinationId)
            ->latest() // Urutkan dari yang terbaru
            ->paginate(5); // Tampilkan 5 review per halaman

        return response()->json($reviews);
    }
}