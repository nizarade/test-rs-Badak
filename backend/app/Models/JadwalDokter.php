<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JadwalDokter extends Model
{
    protected $table = 'jadwal_dokter';
    protected $fillable = ['id_dokter', 'hari', 'jam_mulai', 'jam_selesai', 'kuota'];
    public function dokter()
    {
        return $this->belongsTo(Dokter::class, 'id_dokter');
    }
}
