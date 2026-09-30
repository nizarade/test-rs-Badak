<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kunjungan extends Model
{
    protected $table = 'kunjungan';
    protected $fillable = ['no_rm', 'id_dokter', 'tgl', 'no_antrian', 'status'];
    // Antrian yang masih memakai kuota.
    public function scopeAktif($query)
    {
        return $query->whereIn('status', ['menunggu', 'dipanggil']);
    }

    public function pasien()
    {
        return $this->belongsTo(Pasien::class, 'no_rm', 'no_rm');
    }
    public function dokter()
    {
        return $this->belongsTo(Dokter::class, 'id_dokter');
    }
}
