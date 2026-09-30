<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePasienRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return false;
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
            'tgl_lahir' => 'required|date|before:today',
            'alamat'    => 'required|string',
            'no_hp'     => 'required|string|max:15',
        ];
    }

    public function messages(): array
    {
        return [
            'nama.required'      => 'Nama pasien wajib diisi.',
            'nama.max'           => 'Nama maksimal 255 karakter.',
            'tgl_lahir.required' => 'Tanggal lahir wajib diisi.',
            'tgl_lahir.before'   => 'Tanggal lahir harus sebelum hari ini.',
            'alamat.required'    => 'Alamat wajib diisi.',
            'no_hp.required'     => 'Nomor HP wajib diisi.',
            'no_hp.max'          => 'Nomor HP maksimal 15 karakter.',
        ];
    }
}
