import { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import api from '../../api/axios';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const STATUS_WARNA = {
    menunggu: '#f59e0b',
    dipanggil: '#3b82f6',
    selesai: '#0d9488',
    batal: '#ef4444',
};

function KartuRingkasan({ label, nilai }) {
    return (
        <div className="bg-white border border-gray-300 rounded p-4">
            <div className="text-sm text-gray-600">{label}</div>
            <div className="text-3xl font-bold">{nilai}</div>
        </div>
    );
}

function DashboardAdmin() {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/admin/dashboard')
            .then(res => setData(res.data))
            .catch(() => setError('Gagal memuat data dashboard.'));
    }, []);

    if (error) return <div className="max-w-4xl mx-auto px-5 text-red-600">{error}</div>;
    if (!data) return <div className="max-w-4xl mx-auto px-5">Memuat dashboard...</div>;

    const statusLabels = Object.keys(data.status_hari_ini);
    const totalHariIni = Object.values(data.status_hari_ini).reduce((a, b) => a + b, 0);

    const opsiBar = {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
    };

    return (
        <div className="max-w-4xl mx-auto px-5 pb-10">
            <h2 className="text-xl font-bold my-4">Dashboard Admin</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                <KartuRingkasan label="Kunjungan Hari Ini" nilai={data.total.kunjungan_hari_ini} />
                <KartuRingkasan label="Total Pasien" nilai={data.total.pasien} />
                <KartuRingkasan label="Total Dokter" nilai={data.total.dokter} />
                <KartuRingkasan label="Total Poliklinik" nilai={data.total.poliklinik} />
            </div>

            <div className="grid md:grid-cols-2 gap-3 mb-3">
                <div className="bg-white border border-gray-300 rounded p-4">
                    <h3 className="font-bold mb-2">Status Antrian Hari Ini</h3>
                    {totalHariIni === 0 ? (
                        <p className="text-sm text-gray-600">Belum ada antrian hari ini.</p>
                    ) : (
                        <Doughnut
                            data={{
                                labels: statusLabels,
                                datasets: [{
                                    data: statusLabels.map(s => data.status_hari_ini[s]),
                                    backgroundColor: statusLabels.map(s => STATUS_WARNA[s]),
                                }],
                            }}
                            options={{ plugins: { legend: { position: 'bottom' } } }}
                        />
                    )}
                </div>

                <div className="bg-white border border-gray-300 rounded p-4">
                    <h3 className="font-bold mb-2">Kunjungan 7 Hari Terakhir</h3>
                    <Bar
                        data={{
                            labels: data.tujuh_hari.map(d => d.tgl.slice(5)),
                            datasets: [{
                                label: 'Kunjungan',
                                data: data.tujuh_hari.map(d => d.total),
                                backgroundColor: '#0d9488',
                            }],
                        }}
                        options={opsiBar}
                    />
                </div>
            </div>

            <div className="bg-white border border-gray-300 rounded p-4">
                <h3 className="font-bold mb-2">Kunjungan per Poliklinik (Semua Waktu)</h3>
                {data.per_poliklinik.length === 0 ? (
                    <p className="text-sm text-gray-600">Belum ada data kunjungan.</p>
                ) : (
                    <Bar
                        data={{
                            labels: data.per_poliklinik.map(p => p.nama),
                            datasets: [{
                                label: 'Kunjungan',
                                data: data.per_poliklinik.map(p => p.total),
                                backgroundColor: '#0d9488',
                            }],
                        }}
                        options={{ ...opsiBar, indexAxis: 'y' }}
                    />
                )}
            </div>
        </div>
    );
}

export default DashboardAdmin;
