<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pasien;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'      => 'required|string|max:255',
            'email'     => 'required|email|unique:users,email',
            'password'  => ['required', 'confirmed', Password::min(8)],
            'tgl_lahir' => 'required|date|before:today',
            'alamat'    => 'required|string|max:500',
            'no_hp'     => 'required|string|max:15',
        ], [
            'name.required'      => 'Nama wajib diisi.',
            'email.required'     => 'Email wajib diisi.',
            'email.email'        => 'Format Emai tidak valid.',
            'email.unique'       => 'Email sudah terdaftar.',
            'password.required'  => 'Password wajib diisi.',
            'password.confirmed' => 'Konfirmasi password tidak sesuai.',
            'password.min'       => 'Password minimal 8 karakter.',
            'tgl_lahir.required' => 'Tanggal lahir wajib diisi.',
            'tgl_lahir.before'   => 'Tanggal lahir harus sebelum hari ini.',
            'alamat.required'    => 'Alamat wajib diisi.',
            'no_hp.required'     => 'Nomor HP wajib diisi.',
            'no_hp.max'          => 'Nomor HP maksimal 15 karakter.',
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => $validated['password'],
            'role'     => 'pasien',
        ]);

        $newNoRm = 'RM-' . str_pad($user->id, 5, '0', STR_PAD_LEFT);

        Pasien::create([
            'no_rm'     => $newNoRm,
            'user_id'   => $user->id,
            'nama'      => $validated['name'],
            'tgl_lahir' => $validated['tgl_lahir'],
            'alamat'    => $validated['alamat'],
            'no_hp'     => $validated['no_hp'],
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;
        return response()->json([
            'message' => 'Registrasi berhasil!',
            'user'    => $user->load('pasien'),
            'token'   => $token,
        ], 201);
    }


    public function login(Request $request)
    {
        $validated = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ], [
            'email.required'    => 'Email wajib diisi.',
            'email.email'       => 'Format email tidak valid.',
            'password.required' => 'Password wajib diisi.',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Email atau password salah.',
            ], 401);
        }

        $token = $user->createToken('auth-token')->plainTextToken;
        return response()->json([
            'message' => 'Login berhasil!',
            'user'    => $user->load('pasien'),
            'token'   => $token,
        ]);
    }


    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json([
            'message' => 'Logout berhasil.',
        ]);
    }


    public function me(Request $request)
    {
        return response()->json($request->user()->load('pasien'));
    }
}
