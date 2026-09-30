<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreJadwalDokterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'id_dokter'  => 'required|integer|exists:dokter,id',
            'hari'       => 'required|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu,Minggu',
            'jam_mulai'  => 'required|date_format:H:i',
            'jam_selesai' => 'required|date_format:H:i|after:jam_mulai',
            'kuota'      => 'required|integer|min:1|max:100',
        ];
    }

    public function messages(): array
    {
        return [
            'id_dokter.required'    => 'Dokter wajib dipilih.',
            'id_dokter.exists'      => 'Dokter tidak ditemukan.',
            'hari.required'         => 'Hari wajib dipilih.',
            'hari.in'               => 'Hari tidak valid.',
            'jam_mulai.required'    => 'Jam mulai wajib diisi.',
            'jam_mulai.date_format' => 'Format jam mulai harus HH:MM.',
            'jam_selesai.required'  => 'Jam selesai wajib diisi.',
            'jam_selesai.after'     => 'Jam selesai harus setelah jam mulai.',
            'kuota.required'        => 'Kuota wajib diisi.',
            'kuota.min'             => 'Kuota minimal 1.',
            'kuota.max'             => 'Kuota maksimal 100.',
        ];
    }
}
