import { useState, useEffect } from 'react';
import useData from '../hooks/useData';

function LayarAntrian() {
    const { data, error } = useData('/antrian/hari-ini', 5000);
    const [sekarang, setSekarang] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setSekarang(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="max-w-6xl mx-auto px-4 pb-10">
            <div className="flex items-end justify-between my-4">
                <div>
                    <h1 className="text-3xl font-bold">Antrian Poliklinik</h1>
                    <p className="text-gray-700">{data?.hari ? `${data.hari}, ${data.tanggal}` : 'Memuat...'}</p>
                </div>
                <div className="text-4xl font-bold tabular-nums">
                    {sekarang.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
            </div>

            {error && <p role="alert" className="text-red-700 mb-3">Tidak dapat memperbarui data. Mencoba lagi otomatis.</p>}
            {data?.data?.length === 0 && <p className="text-xl">Tidak ada dokter yang praktek hari ini.</p>}

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {data?.data?.map(d => (
                    <div key={d.id_dokter} className="bg-white border border-gray-300 rounded p-4">
                        <div className="flex justify-between items-baseline">
                            <h2 className="text-xl font-bold">{d.dokter}</h2>
                            <span className="text-sm text-gray-700">{d.jam_mulai && `${d.jam_mulai}-${d.jam_selesai}`}</span>
                        </div>
                        <p className="text-gray-700 mb-3">{d.poliklinik}</p>

                        <div className="grid grid-cols-2 gap-3 text-center">
                            <div className="bg-teal-700 text-white rounded p-3">
                                <div className="text-sm">Sedang Dipanggil</div>
                                <div className="text-6xl font-bold">{d.sedang_dipanggil ?? '-'}</div>
                            </div>
                            <div className="bg-gray-100 rounded p-3">
                                <div className="text-sm">Berikutnya</div>
                                <div className="text-6xl font-bold">{d.berikutnya ?? '-'}</div>
                            </div>
                        </div>

                        <p className="text-sm text-gray-700 mt-2">Menunggu: {d.jumlah_menunggu} antrian</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default LayarAntrian;
