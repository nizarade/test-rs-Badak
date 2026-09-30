import { useState, useEffect } from 'react';
import api from '../../api/axios';

function KelolaDokter() {
    const [dokterList, setDokterList] = useState([]);
    const [poliList, setPoliList] = useState([]);
    const [nama, setNama] = useState('');
    const [spesialis, setSpesialis] = useState('');
    const [idPoli, setIdPoli] = useState('');
    const [error, setError] = useState('');

    const fetchData = () => {
        api.get('/dokter').then(res => setDokterList(res.data)).catch(() => {});
        api.get('/poliklinik').then(res => setPoliList(res.data)).catch(() => {});
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await api.post('/dokter', { nama, spesialis, id_poli: idPoli });
            setNama('');
            setSpesialis('');
            setIdPoli('');
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menambah dokter.');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Hapus data dokter ini?')) return;

        try {
            await api.delete(`/dokter/${id}`);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal menghapus dokter.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-5 pb-10">
            <h2 className="text-xl font-bold my-4">Kelola Dokter</h2>

            {error && <div className="text-red-600 mb-3">{error}</div>}

            <form className="bg-white p-4 border border-gray-300 rounded max-w-md mb-5" onSubmit={handleAdd}>
                <h3 className="text-lg font-bold my-2">Tambah Dokter Baru</h3>
                <div className="mb-3">
                    <label className="block font-bold mb-1 text-sm">Nama Dokter</label>
                    <input className="w-full border border-gray-300 rounded px-2 py-1" type="text" value={nama} onChange={e => setNama(e.target.value)} required />
                </div>
                <div className="mb-3">
                    <label className="block font-bold mb-1 text-sm">Spesialisasi</label>
                    <input className="w-full border border-gray-300 rounded px-2 py-1" type="text" value={spesialis} onChange={e => setSpesialis(e.target.value)} required />
                </div>
                <div className="mb-3">
                    <label className="block font-bold mb-1 text-sm">Poliklinik</label>
                    <select className="w-full border border-gray-300 rounded px-2 py-1" value={idPoli} onChange={e => setIdPoli(e.target.value)} required>
                        <option value="">-- Pilih Poliklinik --</option>
                        {poliList.map(p => (
                            <option key={p.kode} value={p.kode}>{p.nama} ({p.kode})</option>
                        ))}
                    </select>
                </div>
                <button type="submit" className="px-3 py-1 rounded text-white bg-teal-600">Tambah Dokter</button>
            </form>

            <h3 className="text-lg font-bold my-2">Daftar Dokter</h3>
            <table className="w-full bg-white border-collapse">
                <thead>
                    <tr>
                        <th className="border border-gray-300 p-2 text-left bg-gray-100">ID</th>
                        <th className="border border-gray-300 p-2 text-left bg-gray-100">Nama Dokter</th>
                        <th className="border border-gray-300 p-2 text-left bg-gray-100">Spesialis</th>
                        <th className="border border-gray-300 p-2 text-left bg-gray-100">Poliklinik</th>
                        <th className="border border-gray-300 p-2 text-left bg-gray-100">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {dokterList.map(item => (
                        <tr key={item.id}>
                            <td className="border border-gray-300 p-2">{item.id}</td>
                            <td className="border border-gray-300 p-2">{item.nama}</td>
                            <td className="border border-gray-300 p-2">{item.spesialis}</td>
                            <td className="border border-gray-300 p-2">{item.poliklinik?.nama || item.id_poli}</td>
                            <td className="border border-gray-300 p-2">
                                <button className="px-3 py-1 rounded text-white bg-red-600" onClick={() => handleDelete(item.id)}>Hapus</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default KelolaDokter;
