<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pasien extends Model
{
    protected $table = 'pasien';
    protected $primaryKey = 'no_rm';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['no_rm', 'user_id', 'nama', 'tgl_lahir', 'alamat', 'no_hp'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function kunjungan()
    {
        return $this->hasMany(Kunjungan::class, 'no_rm', 'no_rm');
    }
}
