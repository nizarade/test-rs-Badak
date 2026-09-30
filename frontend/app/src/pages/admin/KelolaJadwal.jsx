import { useState, useEffect } from 'react';
import api from '../../api/axios';

function KelolaJadwal() {
    const [jadwalList, setJadwalList] = useState([]);
    const [dokterList, setDokterList] = useState([]);

    const [idDokter, setIdDokter] = useState('');
    const [hari, setHari] = useState('Senin');
    const [jamMulai, setJamMulai] = useState('08:00');
    const [jamSelesai, setJamSelesai] = useState('12:00');
    const [kuota, setKuota] = useState(20);

    const [error, setError] = useState('');

    const fetchData = () => {
        api.get('/jadwal-dokter').then(res => setJadwalList(res.data)).catch(() => {});
        api.get('/dokter').then(res => setDokterList(res.data)).catch(() => {});
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await api.post('/jadwal-dokter', {
                id_dokter: idDokter,
                hari,
                jam_mulai: jamMulai,
                jam_selesai: jamSelesai,
                kuota: parseInt(kuota)
            });
            setIdDokter('');
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menambah jadwal.');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Hapus jadwal ini?')) return;

        try {
            await api.delete(`/jadwal-dokter/${id}`);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal menghapus jadwal.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-5 pb-10">
            <h2 className="text-xl font-bold my-4">Kelola Jadwal Dokter</h2>

            {error && <div className="text-red-600 mb-3">{error}</div>}

            <form className="bg-white p-4 border border-gray-300 rounded max-w-md mb-5" onSubmit={handleAdd}>
                <h3 className="text-lg font-bold my-2">Tambah Jadwal Dokter</h3>
                <div className="mb-3">
                    <label className="block font-bold mb-1 text-sm">Pilih Dokter</label>
                    <select className="w-full border border-gray-300 rounded px-2 py-1" value={idDokter} onChange={e => setIdDokter(e.target.value)} required>
                        <option value="">-- Pilih Dokter --</option>
                        {dokterList.map(d => (
                            <option key={d.id} value={d.id}>{d.nama} ({d.spesialis})</option>
                        ))}
                    </select>
                </div>

                <div className="mb-3">
                    <label className="block font-bold mb-1 text-sm">Hari Praktek</label>
                    <select className="w-full border border-gray-300 rounded px-2 py-1" value={hari} onChange={e => setHari(e.target.value)}>
                        <option value="Senin">Senin</option>
                        <option value="Selasa">Selasa</option>
                        <option value="Rabu">Rabu</option>
                        <option value="Kamis">Kamis</option>
                        <option value="Jumat">Jumat</option>
                        <option value="Sabtu">Sabtu</option>
                    </select>
                </div>

                <div className="mb-3">
                    <label className="block font-bold mb-1 text-sm">Jam Mulai</label>
                    <input className="w-full border border-gray-300 rounded px-2 py-1" type="text" placeholder="HH:MM" value={jamMulai} onChange={e => setJamMulai(e.target.value)} required />
                </div>

                <div className="mb-3">
                    <label className="block font-bold mb-1 text-sm">Jam Selesai</label>
                    <input className="w-full border border-gray-300 rounded px-2 py-1" type="text" placeholder="HH:MM" value={jamSelesai} onChange={e => setJamSelesai(e.target.value)} required />
                </div>

                <div className="mb-3">
                    <label className="block font-bold mb-1 text-sm">Kuota Antrian</label>
                    <input className="w-full border border-gray-300 rounded px-2 py-1" type="number" min="1" max="100" value={kuota} onChange={e => setKuota(e.target.value)} required />
                </div>

                <button type="submit" className="px-3 py-1 rounded text-white bg-teal-600">Tambah Jadwal</button>
            </form>

            <h3 className="text-lg font-bold my-2">Daftar Jadwal Dokter</h3>
            <table className="w-full bg-white border-collapse">
                <thead>
                    <tr>
                        <th className="border border-gray-300 p-2 text-left bg-gray-100">Dokter</th>
                        <th className="border border-gray-300 p-2 text-left bg-gray-100">Hari</th>
                        <th className="border border-gray-300 p-2 text-left bg-gray-100">Jam Praktek</th>
                        <th className="border border-gray-300 p-2 text-left bg-gray-100">Kuota</th>
                        <th className="border border-gray-300 p-2 text-left bg-gray-100">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {jadwalList.map(item => (
                        <tr key={item.id}>
                            <td className="border border-gray-300 p-2">{item.dokter?.nama}</td>
                            <td className="border border-gray-300 p-2">{item.hari}</td>
                            <td className="border border-gray-300 p-2">{item.jam_mulai} - {item.jam_selesai}</td>
                            <td className="border border-gray-300 p-2">{item.kuota} Pasien</td>
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

export default KelolaJadwal;
