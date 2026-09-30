<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dokter;
use App\Models\JadwalDokter;
use App\Models\Kunjungan;

class AntrianPublikController extends Controller
{
    // Endpoint publik: hanya nomor antrian, tanpa data pasien.
    public function index()
    {
        $tanggal = now()->toDateString();
        $hari = JadwalDokter::namaHari($tanggal);

        $kunjungan = Kunjungan::where('tgl', $tanggal)
            ->aktif()
            ->get(['id_dokter', 'no_antrian', 'status'])
            ->groupBy('id_dokter');

        $dokter = Dokter::with(['poliklinik', 'jadwal' => fn ($q) => $q->where('hari', $hari)])
            ->where(function ($q) use ($hari, $kunjungan) {
                $q->whereHas('jadwal', fn ($j) => $j->where('hari', $hari))
                    ->orWhereIn('id', $kunjungan->keys());
            })
            ->orderBy('nama')
            ->get();

        $data = $dokter->map(function ($d) use ($kunjungan) {
            $antrian = $kunjungan->get($d->id, collect());
            $menunggu = $antrian->where('status', 'menunggu');
            $jadwal = $d->jadwal->first();

            return [
                'id_dokter'      => $d->id,
                'dokter'         => $d->nama,
                'poliklinik'     => $d->poliklinik?->nama,
                'jam_mulai'      => $jadwal ? substr($jadwal->jam_mulai, 0, 5) : null,
                'jam_selesai'    => $jadwal ? substr($jadwal->jam_selesai, 0, 5) : null,
                'sedang_dipanggil' => $antrian->where('status', 'dipanggil')->max('no_antrian'),
                'berikutnya'     => $menunggu->min('no_antrian'),
                'jumlah_menunggu' => $menunggu->count(),
            ];
        })->values();

        return response()->json([
            'tanggal' => $tanggal,
            'hari'    => $hari,
            'data'    => $data,
        ]);
    }
}
