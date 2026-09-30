<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePoliklinikRequest;
use App\Models\Poliklinik;
use Illuminate\Http\Request;

class PoliklinikController extends Controller
{
    public function index()
    {
        $poliklinik = Poliklinik::with('dokter')->get();

        return response()->json($poliklinik);
    }

    public function store(StorePoliklinikRequest $request)
    {
        $validated = $request->validated();

        $poliklinik = Poliklinik::create($validated);

        return response()->json([
            'message' => 'Poliklinik berhasil ditambahkan.',
            'data'    => $poliklinik,
        ], 201);
    }

    public function update(Request $request, string $kode)
    {
        $poliklinik = Poliklinik::findOrFail($kode);

        $validated = $request->validate([
            'nama' => 'sometimes|string|max:255',
        ], [
            'nama.max'    => 'Nama maksimal 255 karakter.',
        ]);

        $poliklinik->update($validated);

        return response()->json([
            'message' => 'Poliklinik berhasil diupdate.',
            'data'    => $poliklinik,
        ]);
    }

    public function destroy(string $kode)
    {
        $poliklinik = Poliklinik::findOrFail($kode);

        if ($poliklinik->dokter()->exists()) {
            return response()->json([
                'message' => 'Poliklinik masih memiliki dokter. Pindahkan atau hapus dokternya terlebih dahulu.',
            ], 409);
        }

        $poliklinik->delete();

        return response()->json([
            'message' => 'Poliklinik berhasil dihapus.',
        ]);
    }
}
