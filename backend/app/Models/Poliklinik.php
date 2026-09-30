<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Poliklinik extends Model
{
    protected $table = 'dokter';
    protected $fillable = ['nama', 'spesialis', 'id_poli'];

    public function poliklinik()
    {
        return $this->belongsTo(Poliklinik::class, 'id_poli', 'kode');
    }

    public function jadwal()
    {
        return $this->hasMany(JadwalDokter::class, 'id_dokter');
    }

    public function kunjungan()
    {
        return $this->hasMany(Kunjungan::class, 'id_dokter');
    }
}
