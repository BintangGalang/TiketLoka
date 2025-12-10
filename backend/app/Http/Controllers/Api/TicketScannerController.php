<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BookingDetail;
use Illuminate\Http\Request;

class TicketScannerController extends Controller
{
    public function scan(Request $request)
    {
        $request->validate([
            'ticket_code' => 'required|string'
        ]);

        // 1. Cari Tiket berdasarkan Kode Unik
        $ticket = BookingDetail::with(['destination', 'booking.user'])
            ->where('ticket_code', $request->ticket_code)
            ->first();

        // 2. Jika Tiket Tidak Ditemukan
        if (!$ticket) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tiket Tidak Valid / Tidak Ditemukan',
            ], 404);
        }

        // 3. Jika Tiket Sudah Pernah Dipakai (Redeemed)
        if ($ticket->redeemed_at) {
            return response()->json([
                'status' => 'warning',
                'message' => 'Tiket Sudah Dipakai Sebelumnya!',
                'data' => [
                    'redeemed_at' => $ticket->redeemed_at,
                    'user' => $ticket->booking->user->name,
                    'destination' => $ticket->destination->name
                ]
            ], 400); // 400 Bad Request
        }

        // 4. Jika Tiket Valid & Belum Dipakai -> Tandai Masuk
        $ticket->update([
            'redeemed_at' => now()
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Tiket Valid. Silakan Masuk.',
            'data' => [
                'code' => $ticket->ticket_code,
                'user' => $ticket->booking->user->name,
                'destination' => $ticket->destination->name,
                'visit_date' => $ticket->visit_date,
            ]
        ]);
    }
}