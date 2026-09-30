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

        if ($request->has('cari')) {
            $query->where('nama', 'ILIKE', '%' . $request->query('cari') . '%');
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
