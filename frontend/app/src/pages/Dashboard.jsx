import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import DashboardAdmin from './admin/DashboardAdmin';

function BerandaPublik() {
    const [poliklinik, setPoliklinik] = useState([]);
    const [dokter, setDokter] = useState([]);

    useEffect(() => {
        api.get('/poliklinik').then(res => setPoliklinik(res.data)).catch(() => { });
        api.get('/dokter').then(res => setDokter(res.data)).catch(() => { });
    }, []);

    return (
        <div className="max-w-4xl mx-auto px-5 pb-10">
            <h1 className="text-2xl font-bold my-4">Selamat Datang di Sistem Antrian Poliklinik</h1>

            <h2 className="text-xl font-bold my-4">Daftar Poliklinik</h2>
            <ul className="list-disc pl-6 mb-4">
                {poliklinik.map(p => (
                    <li key={p.kode}><strong>{p.kode}</strong> - {p.nama}</li>
                ))}
            </ul>

            <h2 className="text-xl font-bold my-4">Daftar Dokter</h2>
            <table className="w-full bg-white border-collapse">
                <thead>
                    <tr>
                        <th className="border border-gray-300 p-2 text-left bg-gray-100">Nama Dokter</th>
                        <th className="border border-gray-300 p-2 text-left bg-gray-100">Spesialis</th>
                        <th className="border border-gray-300 p-2 text-left bg-gray-100">Poliklinik</th>
                    </tr>
                </thead>
                <tbody>
                    {dokter.map(d => (
                        <tr key={d.id}>
                            <td className="border border-gray-300 p-2">{d.nama}</td>
                            <td className="border border-gray-300 p-2">{d.spesialis}</td>
                            <td className="border border-gray-300 p-2">{d.poliklinik?.nama || d.id_poli}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function Beranda() {
    const { user, loading } = useAuth();

    if (loading) return null;
    return user?.role === 'admin' ? <DashboardAdmin /> : <BerandaPublik />;
}

export default Beranda;
