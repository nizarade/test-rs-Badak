import { useState, useEffect } from 'react';
import api from '../../api/axios';

function RiwayatKunjungan() {
    const [riwayat, setRiwayat] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/kunjungan/saya')
            .then(res => setRiwayat(res.data))
            .catch(err => setError(err.response?.data?.message || 'Gagal memuat riwayat kunjungan.'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="max-w-4xl mx-auto px-5 pb-10">Loading data riwayat...</div>;

    return (
        <div className="max-w-4xl mx-auto px-5 pb-10">
            <h2 className="text-xl font-bold my-4">Riwayat Kunjungan Saya</h2>
            {error && <div className="text-red-600 mb-3">{error}</div>}
            {!error && riwayat.length === 0 ? (
                <p>Belum ada riwayat kunjungan.</p>
            ) : (
                <table className="w-full bg-white border-collapse">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 p-2 text-left bg-gray-100">Tanggal</th>
                            <th className="border border-gray-300 p-2 text-left bg-gray-100">No. Antrian</th>
                            <th className="border border-gray-300 p-2 text-left bg-gray-100">Dokter</th>
                            <th className="border border-gray-300 p-2 text-left bg-gray-100">Poliklinik</th>
                            <th className="border border-gray-300 p-2 text-left bg-gray-100">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {riwayat.map(item => (
                            <tr key={item.id}>
                                <td className="border border-gray-300 p-2">{item.tgl}</td>
                                <td className="border border-gray-300 p-2"><strong>#{item.no_antrian}</strong></td>
                                <td className="border border-gray-300 p-2">{item.dokter?.nama}</td>
                                <td className="border border-gray-300 p-2">{item.dokter?.poliklinik?.nama}</td>
                                <td className="border border-gray-300 p-2">{item.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default RiwayatKunjungan;
