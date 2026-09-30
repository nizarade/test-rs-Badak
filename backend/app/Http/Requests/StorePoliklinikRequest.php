<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePoliklinikRequest extends FormRequest
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
            'kode' => 'required|string|max:20|unique:poliklinik,kode',
            'nama' => 'required|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'kode.required' => 'Kode poliklinik wajib diisi.',
            'kode.unique'   => 'Kode poliklinik sudah digunakan.',
            'nama.required' => 'Nama poliklinik wajib diisi.',
        ];
    }
}
