<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreDokterRequest extends FormRequest
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
            'nama'      => 'required|string|max:255',
            'spesialis' => 'required|string|max:255',
            'id_poli'   => 'required|string|exists:poliklinik,kode',
        ];
    }

    public function messages(): array
    {
        return [
            'nama.required'      => 'Nama dokter wajib diisi.',
            'spesialis.required' => 'Spesialisasi wajib diisi.',
            'id_poli.required'   => 'Poliklinik wajib dipilih.',
            'id_poli.exists'     => 'Kode poliklinik tidak ditemukan.',
        ];
    }
}
