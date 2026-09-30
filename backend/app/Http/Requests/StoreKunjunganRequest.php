<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreKunjunganRequest extends FormRequest
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
            'id_dokter' => 'required|integer|exists:dokter,id',
            'tgl'       => 'required|date|after_or_equal:today',
        ];
    }

    public function messages(): array
    {
        return [
            'id_dokter.required'    => 'Dokter wajib dipilih.',
            'id_dokter.exists'      => 'Dokter tidak ditemukan.',
            'tgl.required'          => 'Tanggal kunjungan wajib diisi.',
            'tgl.after_or_equal'    => 'Tanggal kunjungan tidak boleh di masa lalu.',
        ];
    }
}
