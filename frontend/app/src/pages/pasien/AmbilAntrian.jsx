import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

function AmbilAntrian() {
    const { user } = useAuth();
    const [dokterList, setDokterList] = useState([]);
    const [idDokter, setIdDokter] = useState('');
    const [tgl, setTgl] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/dokter')
            .then(res => setDokterList(res.data))
            .catch(err => setError(err.response?.data?.message || 'Gagal memuat daftar dokter.'));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setResult(null);

        if (!user?.pasien?.no_rm) {
            setError('Data No. Rekam Medis pasien tidak ditemukan.');
            return;
        }

        try {
            const res = await api.post('/kunjungan', {
                id_dokter: idDokter,
                tgl: tgl
            });
            setResult(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mengambil nomor antrian.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-5 pb-10">
            <h2 className="text-xl font-bold my-4">Ambil Nomor Antrian</h2>
            <p><strong>No. Rekam Medis Anda:</strong> {user?.pasien?.no_rm || '-'}</p>

            {error && <div className="text-red-600 mb-3">{error}</div>}

            {result && (
                <div className="bg-green-100 border border-green-400 text-green-800 p-3 mb-4 rounded">
                    <h3 className="text-lg font-bold my-2">{result.message}</h3>
                    <p>Nomor Antrian Anda: <strong>{result.no_antrian}</strong></p>
                    <p>Tanggal: {result.data?.tgl}</p>
                    <p>Dokter: {result.data?.dokter?.nama}</p>
                </div>
            )}

            <form className="bg-white p-4 border border-gray-300 rounded max-w-md mb-5" onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="block font-bold mb-1 text-sm">Pilih Dokter & Poliklinik</label>
                    <select className="w-full border border-gray-300 rounded px-2 py-1" value={idDokter} onChange={e => setIdDokter(e.target.value)} required>
                        <option value="">-- Pilih Dokter --</option>
                        {dokterList.map(d => (
                            <option key={d.id} value={d.id}>
                                {d.nama} ({d.spesialis}) - Poli {d.poliklinik?.nama || d.id_poli}
                                {d.jadwal?.length > 0 && ` | ${d.jadwal.map(j => `${j.hari} ${j.jam_mulai.slice(0, 5)}-${j.jam_selesai.slice(0, 5)}`).join(', ')}`}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-3">
                    <label className="block font-bold mb-1 text-sm">Tanggal Kunjungan</label>
                    <input className="w-full border border-gray-300 rounded px-2 py-1" type="date" min={new Date().toLocaleDateString("en-CA")} value={tgl} onChange={e => setTgl(e.target.value)} required />
                </div>

                <button type="submit" className="px-3 py-1 rounded text-white bg-teal-600">Ambil Antrian</button>
            </form>
        </div>
    );
}

export default AmbilAntrian;
