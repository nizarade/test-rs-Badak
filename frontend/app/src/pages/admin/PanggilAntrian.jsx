import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';

function PanggilAntrian() {
    const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
    const [antrian, setAntrian] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchAntrian = useCallback(() => {
        return api.get('/kunjungan', { params: { tanggal } })
            .then(res => {
                setAntrian(res.data);
                setError('');
            })
            .catch(err => setError(err.response?.data?.message || 'Gagal memuat antrian.'))
            .finally(() => setLoading(false));
    }, [tanggal]);

    // Muat ulang otomatis agar antrian baru dari pasien muncul tanpa refresh manual.
    useEffect(() => {
        fetchAntrian();
        const timer = setInterval(fetchAntrian, 15000);
        return () => clearInterval(timer);
    }, [fetchAntrian]);

    const handleAction = async (id, action) => {
        try {
            await api.patch(`/kunjungan/${id}/${action}`);
            await fetchAntrian();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mengubah status antrian.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-5 pb-10">
            <h2 className="text-xl font-bold my-4">Kelola & Panggil Antrian</h2>

            {error && <div className="text-red-600 mb-3">{error}</div>}

            <div className="mb-3 max-w-[250px]">
                <label className="block font-bold mb-1 text-sm">Filter Tanggal Kunjungan</label>
                <input className="w-full border border-gray-300 rounded px-2 py-1" type="date" value={tanggal} onChange={e => { setLoading(true); setTanggal(e.target.value); }} />
            </div>

            {loading ? (
                <p>Memuat antrian...</p>
            ) : antrian.length === 0 ? (
                <p>Tidak ada antrian untuk tanggal ini.</p>
            ) : (
                <table className="w-full bg-white border-collapse">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 p-2 text-left bg-gray-100">No. Antrian</th>
                            <th className="border border-gray-300 p-2 text-left bg-gray-100">Nama Pasien</th>
                            <th className="border border-gray-300 p-2 text-left bg-gray-100">No. RM</th>
                            <th className="border border-gray-300 p-2 text-left bg-gray-100">Dokter</th>
                            <th className="border border-gray-300 p-2 text-left bg-gray-100">Status</th>
                            <th className="border border-gray-300 p-2 text-left bg-gray-100">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {antrian.map(item => (
                            <tr key={item.id}>
                                <td className="border border-gray-300 p-2"><strong>#{item.no_antrian}</strong></td>
                                <td className="border border-gray-300 p-2">{item.pasien?.nama}</td>
                                <td className="border border-gray-300 p-2">{item.no_rm}</td>
                                <td className="border border-gray-300 p-2">{item.dokter?.nama}</td>
                                <td className="border border-gray-300 p-2"><strong>{item.status}</strong></td>
                                <td className="border border-gray-300 p-2">
                                    {item.status === 'menunggu' && (
                                        <button className="px-3 py-1 rounded text-white bg-teal-600" onClick={() => handleAction(item.id, 'panggil')}>Panggil</button>
                                    )}
                                    {item.status === 'dipanggil' && (
                                        <button className="px-3 py-1 rounded text-white bg-green-600" onClick={() => handleAction(item.id, 'selesai')}>Selesai</button>
                                    )}
                                    {item.status !== 'selesai' && item.status !== 'batal' && (
                                        <button className="px-3 py-1 rounded text-white bg-red-600 ml-1" onClick={() => handleAction(item.id, 'batal')}>Batal</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default PanggilAntrian;
