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
            'kode' => 'sometimes|string|max:20|unique:poliklinik,kode,' . $kode . ',kode',
            'nama' => 'sometimes|string|max:255',
        ], [
            'kode.unique' => 'Kode poliklinik sudah digunakan.',
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
        $poliklinik->delete();

        return response()->json([
            'message' => 'Poliklinik berhasil dihapus.',
        ]);
    }
}
