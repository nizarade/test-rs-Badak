import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useData from '../hooks/useData';
import Chip from '../components/Chip';
import { NAMA_HARI, tanggalLokal, formatPanjang, jam } from '../utils/tanggal';

const tombolUtama = 'min-h-[44px] inline-flex items-center justify-center px-5 rounded bg-teal-700 text-white font-bold hover:bg-teal-800';
const tombolGaris = 'min-h-[44px] inline-flex items-center justify-center px-5 rounded border-2 border-teal-700 text-teal-800 font-bold bg-white hover:bg-teal-50';

function Hero({ user }) {
    const pasien = user?.role === 'pasien';

    return (
        <section className="py-6">
            <h1 className="text-3xl font-bold">{pasien ? `Halo, ${user.name}` : 'Antrian Poliklinik'}</h1>
            <p className="mt-2 text-gray-700 max-w-xl">
                {pasien
                    ? 'Pilih dokter dan tanggal kunjungan, nomor antrian langsung diberikan.'
                    : 'Ambil nomor antrian dokter dari rumah dan pantau nomor yang sedang dipanggil. Untuk mengambil nomor, daftar dulu sebagai pasien.'}
            </p>
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
                {pasien ? (
                    <>
                        <Link className={tombolUtama} to="/ambil-antrian">Ambil Nomor Antrian</Link>
                        <Link className={tombolGaris} to="/riwayat">Lihat Riwayat Saya</Link>
                    </>
                ) : !user && (
                    <>
                        <Link className={tombolUtama} to="/register">Daftar Sebagai Pasien</Link>
                        <Link className={tombolGaris} to="/login">Masuk</Link>
                    </>
                )}
            </div>
        </section>
    );
}

function AntrianSaya({ riwayat, hariIni }) {
    if (!riwayat) return <p className="mb-6">Memuat antrian Anda...</p>;

    const hari = tanggalLokal();
    const aktif = riwayat
        .filter(k => ['menunggu', 'dipanggil'].includes(k.status) && k.tgl >= hari)
        .sort((a, b) => a.tgl.localeCompare(b.tgl) || a.no_antrian - b.no_antrian);
    const k = aktif[0];

    if (!k) return <p className="text-gray-700 mb-8">Anda belum punya antrian aktif.</p>;

    const papan = k.tgl === hari && hariIni?.data?.find(d => d.id_dokter === k.id_dokter);

    return (
        <section className="mb-8">
            <h2 className="text-xl font-bold mb-2">Antrian Anda</h2>
            <div className="bg-white border-2 border-teal-700 rounded p-4 flex items-center gap-4">
                <div className="text-center min-w-[72px]">
                    <div className="text-xs text-gray-700">Nomor</div>
                    <div className="text-5xl font-bold text-teal-700">{k.no_antrian}</div>
                </div>
                <div>
                    <p className="font-bold">{k.dokter?.nama}</p>
                    <p className="text-gray-700">{k.dokter?.poliklinik?.nama}</p>
                    <p className="text-gray-700">{k.tgl === hari ? 'Hari ini' : formatPanjang(k.tgl)}</p>
                    <p className="font-bold mt-1">{k.status === 'dipanggil' ? 'Nomor Anda sedang dipanggil' : 'Menunggu dipanggil'}</p>
                    {papan && k.status === 'menunggu' && (
                        <p className="text-sm text-gray-700">Saat ini dipanggil: {papan.sedang_dipanggil ?? 'belum ada'}</p>
                    )}
                </div>
            </div>
            <p className="text-sm text-gray-700 mt-2">
                {aktif.length > 1 && `Ada ${aktif.length - 1} antrian aktif lainnya. `}
                <Link className="text-teal-800 underline" to="/riwayat">Kelola di riwayat</Link>
            </p>
        </section>
    );
}

function HariIni({ hariIni, error }) {
    return (
        <section className="mb-8">
            <div className="flex items-baseline justify-between gap-3 mb-2">
                <h2 className="text-xl font-bold">Hari ini di klinik</h2>
                <Link className="text-teal-800 underline text-sm" to="/antrian">Buka layar antrian</Link>
            </div>

            {error && <p role="alert" className="text-red-700 mb-2">Tidak dapat memperbarui data. Mencoba lagi otomatis.</p>}
            {!hariIni && !error && <p>Memuat data hari ini...</p>}
            {hariIni?.data?.length === 0 && <p className="text-gray-700">Tidak ada dokter yang praktek hari ini ({hariIni.hari}).</p>}

            {hariIni?.data?.length > 0 && (
                <ul className="bg-white border border-gray-300 rounded divide-y divide-gray-200">
                    {hariIni.data.map(d => (
                        <li key={d.id_dokter} className="p-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                            <div>
                                <span className="font-bold">{d.dokter}</span>
                                <span className="text-gray-700"> · {d.poliklinik}</span>
                                {d.jam_mulai && <span className="block text-sm text-gray-700">Praktek {d.jam_mulai}-{d.jam_selesai}</span>}
                            </div>
                            <div className="text-sm">
                                Dipanggil: <strong className="text-base">{d.sedang_dipanggil ?? '-'}</strong>
                                <span className="ml-4">Menunggu: <strong className="text-base">{d.jumlah_menunggu}</strong></span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

function DaftarDokter({ dokter, error }) {
    const [poli, setPoli] = useState('');

    if (error) return <p role="alert" className="text-red-700">{error}</p>;
    if (!dokter) return <p>Memuat daftar dokter...</p>;
    if (dokter.length === 0) return <p className="text-gray-700">Belum ada dokter yang terdaftar.</p>;

    const daftarPoli = [...new Map(dokter.map(d => [d.id_poli, d.poliklinik?.nama || d.id_poli]))];
    const hariIni = NAMA_HARI[new Date().getDay()];

    return (
        <>
            <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Filter poliklinik">
                <Chip aktif={poli === ''} onClick={() => setPoli('')}>Semua</Chip>
                {daftarPoli.map(([kode, nama]) => (
                    <Chip key={kode} aktif={poli === kode} onClick={() => setPoli(kode)}>{nama}</Chip>
                ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                {dokter.filter(d => !poli || d.id_poli === poli).map(d => (
                    <article key={d.id} className="bg-white border border-gray-300 rounded p-4">
                        <h3 className="font-bold text-lg">{d.nama}</h3>
                        <p className="text-gray-700">{d.spesialis} · {d.poliklinik?.nama || d.id_poli}</p>
                        {d.jadwal?.some(j => j.hari === hariIni) && <p className="text-sm font-bold text-teal-800 mt-1">Praktek hari ini</p>}
                        <ul className="mt-2 text-sm">
                            {!d.jadwal?.length && <li className="text-gray-700">Belum ada jadwal praktek</li>}
                            {d.jadwal?.map(j => (
                                <li key={j.id} className={j.hari === hariIni ? 'font-bold' : ''}>
                                    {j.hari}, {jam(j.jam_mulai)}-{jam(j.jam_selesai)}
                                </li>
                            ))}
                        </ul>
                    </article>
                ))}
            </div>
        </>
    );
}

function BerandaPublik() {
    const { user } = useAuth();
    const adalahPasien = user?.role === 'pasien';
    const { data: dokter, error: errorDokter } = useData('/dokter');
    const { data: hariIni, error: errorHariIni } = useData('/antrian/hari-ini', 15000);
    const { data: riwayat } = useData(adalahPasien ? '/kunjungan/saya' : null);

    return (
        <div className="max-w-4xl mx-auto px-4 pb-10">
            <Hero user={user} />
            {adalahPasien && <AntrianSaya riwayat={riwayat} hariIni={hariIni} />}
            <HariIni hariIni={hariIni} error={errorHariIni} />
            <section>
                <h2 className="text-xl font-bold mb-3">Dokter dan jadwal praktek</h2>
                <DaftarDokter dokter={dokter} error={errorDokter} />
            </section>
        </div>
    );
}

export default BerandaPublik;
