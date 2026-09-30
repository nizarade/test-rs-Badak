import { useState, useEffect } from 'react';
import api from '../../api/axios';

function KelolaPoliklinik() {
    const [list, setList] = useState([]);
    const [kode, setKode] = useState('');
    const [nama, setNama] = useState('');
    const [error, setError] = useState('');

    const fetchList = () => {
        api.get('/poliklinik')
            .then(res => setList(res.data))
            .catch(err => setError(err.response?.data?.message || 'Gagal memuat data poliklinik.'));
    };

    useEffect(() => {
        fetchList();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await api.post('/poliklinik', { kode, nama });
            setKode('');
            setNama('');
            fetchList();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menambah poliklinik.');
        }
    };

    const handleDelete = async (kodeTarget) => {
        if (!confirm(`Hapus poliklinik ${kodeTarget}?`)) return;
        setError('');

        try {
            await api.delete(`/poliklinik/${kodeTarget}`);
            fetchList();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menghapus poliklinik.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-5 pb-10">
            <h2 className="text-xl font-bold my-4">Kelola Poliklinik</h2>

            {error && <div className="text-red-600 mb-3">{error}</div>}

            <form className="bg-white p-4 border border-gray-300 rounded max-w-md mb-5" onSubmit={handleAdd}>
                <h3 className="text-lg font-bold my-2">Tambah Poliklinik Baru</h3>
                <div className="mb-3">
                    <label className="block font-bold mb-1 text-sm">Kode Poliklinik (Contoh: POLI-001)</label>
                    <input className="w-full border border-gray-300 rounded px-2 py-1" type="text" value={kode} onChange={e => setKode(e.target.value)} required />
                </div>
                <div className="mb-3">
                    <label className="block font-bold mb-1 text-sm">Nama Poliklinik</label>
                    <input className="w-full border border-gray-300 rounded px-2 py-1" type="text" value={nama} onChange={e => setNama(e.target.value)} required />
                </div>
                <button type="submit" className="px-3 py-1 rounded text-white bg-teal-600">Tambah</button>
            </form>

            <h3 className="text-lg font-bold my-2">Daftar Poliklinik</h3>
            <table className="w-full bg-white border-collapse">
                <thead>
                    <tr>
                        <th className="border border-gray-300 p-2 text-left bg-gray-100">Kode</th>
                        <th className="border border-gray-300 p-2 text-left bg-gray-100">Nama Poliklinik</th>
                        <th className="border border-gray-300 p-2 text-left bg-gray-100">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {list.map(item => (
                        <tr key={item.kode}>
                            <td className="border border-gray-300 p-2">{item.kode}</td>
                            <td className="border border-gray-300 p-2">{item.nama}</td>
                            <td className="border border-gray-300 p-2">
                                <button className="px-3 py-1 rounded text-white bg-red-600" onClick={() => handleDelete(item.kode)}>Hapus</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default KelolaPoliklinik;
