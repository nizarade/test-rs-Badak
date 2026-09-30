import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        tgl_lahir: '',
        alamat: '',
        no_hp: ''
    });

    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});

        try {
            await register(formData);
            navigate('/ambil-antrian');
        } catch (err) {
            if (err.response?.status === 422 && err.response.data.errors) {
                setFieldErrors(err.response.data.errors);
            } else {
                setError(err.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-5 py-5">
            <div className="w-full max-w-md border border-gray-300 rounded bg-teal-600">
                <h2 className="text-xl font-bold text-white my-4 text-center">Pendaftaran Pasien Baru</h2>

                <form className="bg-white p-4" onSubmit={handleSubmit}>
                    {error && <div className="text-red-600 mb-3">{error}</div>}
                <div className="mb-3">
                    <label className="block font-bold mb-1 text-sm">Nama Lengkap</label>
                    <input className="w-full border border-gray-300 rounded px-2 py-1" type="text" name="name" value={formData.name} onChange={handleChange} required />
                    {fieldErrors.name && <div className="text-red-600 text-sm">{fieldErrors.name[0]}</div>}
                </div>

                <div className="mb-3">
                    <label className="block font-bold mb-1 text-sm">Email</label>
                    <input className="w-full border border-gray-300 rounded px-2 py-1" type="email" name="email" value={formData.email} onChange={handleChange} required />
                    {fieldErrors.email && <div className="text-red-600 text-sm">{fieldErrors.email[0]}</div>}
                </div>

                <div className="mb-3">
                    <label className="block font-bold mb-1 text-sm">Password</label>
                    <input className="w-full border border-gray-300 rounded px-2 py-1" type="password" name="password" value={formData.password} onChange={handleChange} required />
                    {fieldErrors.password && <div className="text-red-600 text-sm">{fieldErrors.password[0]}</div>}
                </div>

                <div className="mb-3">
                    <label className="block font-bold mb-1 text-sm">Konfirmasi Password</label>
                    <input className="w-full border border-gray-300 rounded px-2 py-1" type="password" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} required />
                </div>

                <div className="mb-3">
                    <label className="block font-bold mb-1 text-sm">Tanggal Lahir</label>
                    <input className="w-full border border-gray-300 rounded px-2 py-1" type="date" name="tgl_lahir" value={formData.tgl_lahir} onChange={handleChange} required />
                    {fieldErrors.tgl_lahir && <div className="text-red-600 text-sm">{fieldErrors.tgl_lahir[0]}</div>}
                </div>

                <div className="mb-3">
                    <label className="block font-bold mb-1 text-sm">Alamat</label>
                    <textarea className="w-full border border-gray-300 rounded px-2 py-1" name="alamat" value={formData.alamat} onChange={handleChange} required />
                    {fieldErrors.alamat && <div className="text-red-600 text-sm">{fieldErrors.alamat[0]}</div>}
                </div>

                <div className="mb-3">
                    <label className="block font-bold mb-1 text-sm">Nomor HP</label>
                    <input className="w-full border border-gray-300 rounded px-2 py-1" type="text" name="no_hp" value={formData.no_hp} onChange={handleChange} required />
                    {fieldErrors.no_hp && <div className="text-red-600 text-sm">{fieldErrors.no_hp[0]}</div>}
                </div>

                <button type="submit" className="px-3 py-1 rounded text-white bg-teal-600">Daftar Akun</button>
                </form>
            </div>
        </div>
    );
}

export default Register;
