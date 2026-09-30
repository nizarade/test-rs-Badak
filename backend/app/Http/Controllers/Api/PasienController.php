<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pasien;
use Illuminate\Http\Request;

class PasienController extends Controller
{
    public function index(Request $request)
    {
        $query = Pasien::with('user');

        if ($request->filled('cari')) {
            $cari = str_replace(['!', '%', '_'], ['!!', '!%', '!_'], mb_strtolower($request->query('cari')));
            $query->whereRaw("LOWER(nama) LIKE ? ESCAPE '!'", ['%' . $cari . '%']);
        }

        $pasien = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json($pasien);
    }

    public function show(string $no_rm)
    {
        $pasien = Pasien::with(['user', 'kunjungan.dokter.poliklinik'])
            ->findOrFail($no_rm);

        return response()->json($pasien);
    }
}
