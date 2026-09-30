<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDokterRequest;
use App\Models\Dokter;
use Illuminate\Http\Request;

class DokterController extends Controller
{
    public function index(Request $request)
    {
        $query = Dokter::with(['poliklinik', 'jadwal']);

        if ($request->has('poli')) {
            $query->where('id_poli', $request->query('poli'));
        }

        return response()->json($query->get());
    }

    public function show(int $id)
    {
        $dokter = Dokter::with(['poliklinik', 'jadwal'])->findOrFail($id);

        return response()->json($dokter);
    }

    public function store(StoreDokterRequest $request)
    {
        $validated = $request->validated();

        $dokter = Dokter::create($validated);

        return response()->json([
            'message' => 'Dokter berhasil ditambahkan.',
            'data'    => $dokter->load('poliklinik'),
        ], 201);
    }

    public function update(Request $request, int $id)
    {
        $dokter = Dokter::findOrFail($id);

        $validated = $request->validate([
            'nama'      => 'sometimes|string|max:255',
            'spesialis' => 'sometimes|string|max:255',
            'id_poli'   => 'sometimes|string|exists:poliklinik,kode',
        ], [
            'nama.max'       => 'Nama dokter maksimal 255 karakter.',
            'spesialis.max'  => 'Spesialisasi maksimal 255 karakter.',
            'id_poli.exists' => 'Kode poliklinik tidak ditemukan.',
        ]);

        $dokter->update($validated);

        return response()->json([
            'message' => 'Data dokter berhasil diupdate.',
            'data'    => $dokter->load('poliklinik'),
        ]);
    }

    public function destroy(int $id)
    {
        $dokter = Dokter::findOrFail($id);
        $dokter->delete();

        return response()->json([
            'message' => 'Dokter berhasil dihapus.',
        ]);
    }
}
