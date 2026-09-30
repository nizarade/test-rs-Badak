import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import useData from '../../hooks/useData';
import useAksi from '../../hooks/useAksi';
import Pesan from '../../components/Pesan';
import Tombol from '../../components/Tombol';
import { NAMA_HARI, tanggalLokal, dariTanggal, formatPanjang, jam } from '../../utils/tanggal';

const RENTANG_HARI = 14;

const singkat = (tgl) => dariTanggal(tgl).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });

// Tanggal praktek dokter dalam dua minggu ke depan. Hari ini dilewati kalau jam praktek sudah lewat.
function tanggalPraktek(jadwal) {
    const sekarang = new Date();
    const menitSekarang = sekarang.getHours() * 60 + sekarang.getMinutes();
    const hasil = [];

    for (let i = 0; i < RENTANG_HARI; i++) {
        const d = new Date(sekarang.getFullYear(), sekarang.getMonth(), sekarang.getDate() + i);
        const j = jadwal.find(item => item.hari === NAMA_HARI[d.getDay()]);
        if (!j) continue;

        const [h, m] = j.jam_selesai.split(':');
        if (i === 0 && menitSekarang >= h * 60 + Number(m)) continue;
        hasil.push(tanggalLokal(d));
    }
    return hasil;
}

// Sisa kuota tiap tanggal praktek. Tanggal yang gagal dimuat bernilai null.
async function ambilKuota(dokter) {
    const daftar = await Promise.all(
        tanggalPraktek(dokter.jadwal ?? []).map(tgl =>
            api.get(`/dokter/${dokter.id}/kuota`, { params: { tgl } })
                .then(res => [tgl, res.data])
                .catch(() => [tgl, null])
        )
    );
    return { idDokter: dokter.id, tanggal: daftar };
}

function Langkah({ nomor, judul, petunjuk, children }) {
    return (
        <fieldset className="mb-6">
            <legend className="text-lg font-bold mb-1">
                <span className="inline-flex items-center justify-center w-7 h-7 mr-2 rounded-full bg-teal-700 text-white text-sm">{nomor}</span>
                {judul}
            </legend>
            {petunjuk && <p className="text-sm text-gray-700 mb-2">{petunjuk}</p>}
            {children}
        </fieldset>
    );
}

// Radio asli dengan tampilan kartu, jadi tetap bisa dipakai dengan keyboard.
function Kartu({ name, value, checked, onChange, disabled, children }) {
    return (
        <label className={disabled ? 'block cursor-not-allowed' : 'block cursor-pointer'}>
            <input className="peer sr-only" type="radio" name={name} value={value} checked={checked} disabled={disabled} onChange={() => onChange(value)} />
            <div className="min-h-[44px] p-3 rounded border-2 border-gray-300 bg-white peer-disabled:bg-gray-100 peer-checked:border-teal-700 peer-checked:bg-teal-50 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-teal-700">
                {children}
            </div>
        </label>
    );
}

function Tiket({ tiket, noRm, onLagi }) {
    return (
        <div className="max-w-xl mx-auto px-4 pb-10">
            <h2 className="text-xl font-bold my-4">Antrian Berhasil Diambil</h2>
            <div role="status" className="bg-white border-2 border-teal-700 rounded p-5 text-center">
                <p className="text-sm text-gray-700">Nomor antrian Anda</p>
                <p className="text-7xl font-bold text-teal-700 my-2">{tiket.nomor}</p>
                <p className="font-bold">{tiket.dokter?.nama}</p>
                <p className="text-gray-700">{tiket.dokter?.poliklinik?.nama}</p>
                <p className="mt-2">{formatPanjang(tiket.tgl)}</p>
                <p>Jam praktek {tiket.jam}</p>
                <p className="text-sm text-gray-700 mt-3">No. RM {noRm}</p>
            </div>
            <p className="text-sm text-gray-700 mt-3">
                Tunjukkan nomor ini ke petugas. Antrian bisa dibatalkan di halaman riwayat selama belum dipanggil.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <Link className="min-h-[44px] inline-flex items-center justify-center px-4 rounded text-white bg-teal-700 font-bold" to="/riwayat">Lihat Riwayat Saya</Link>
                <Tombol jenis="ubah" onClick={onLagi}>Ambil Antrian Lain</Tombol>
            </div>
        </div>
    );
}

function AmbilAntrian() {
    const { user } = useAuth();
    const { data: semuaDokter, error: errorMuat } = useData('/dokter');
    const { error, bekerja, jalankan } = useAksi();
    const [poli, setPoli] = useState('');
    const [idDokter, setIdDokter] = useState('');
    const [tgl, setTgl] = useState('');
    const [kuota, setKuota] = useState(null);
    const [tiket, setTiket] = useState(null);

    const daftarPoli = [...new Map((semuaDokter ?? []).map(d => [d.id_poli, d.poliklinik?.nama || d.id_poli]))];
    const dokterDiPoli = (semuaDokter ?? []).filter(d => d.id_poli === poli);
    const dokter = dokterDiPoli.find(d => String(d.id) === idDokter);

    useEffect(() => {
        if (!dokter) return undefined;
        let batal = false;
        ambilKuota(dokter).then(hasil => {
            if (!batal) setKuota(hasil);
        });
        return () => { batal = true; };
    }, [dokter]);

    const kuotaDokter = dokter && kuota?.idDokter === dokter.id ? new Map(kuota.tanggal) : null;
    const info = kuotaDokter?.get(tgl);
    const bisaDaftar = info?.ada_jadwal && info.sisa > 0;

    const pilihPoli = (kode) => {
        setPoli(kode);
        setIdDokter('');
        setTgl('');
    };

    const pilihDokter = (id) => {
        setIdDokter(id);
        setTgl('');
    };

    const reset = () => {
        setTiket(null);
        pilihPoli('');
    };

    const kirim = async (e) => {
        e.preventDefault();
        const ok = await jalankan(async () => {
            const res = await api.post('/kunjungan', { id_dokter: idDokter, tgl });
            setTiket({ ...res.data.data, nomor: res.data.no_antrian, jam: `${info.jam_mulai}-${info.jam_selesai}` });
        }, '', 'Gagal mengambil nomor antrian.');
        if (!ok) ambilKuota(dokter).then(setKuota);
    };

    if (tiket) return <Tiket tiket={tiket} noRm={user?.pasien?.no_rm} onLagi={reset} />;

    return (
        <div className="max-w-xl mx-auto px-4 pb-10">
            <h2 className="text-xl font-bold my-4">Ambil Nomor Antrian</h2>
            <p className="text-sm text-gray-700 mb-4">
                No. Rekam Medis Anda: <strong>{user?.pasien?.no_rm || '-'}</strong>. Nomor antrian diberikan otomatis sesuai urutan pendaftaran.
            </p>

            <Pesan error={error || errorMuat} />

            {semuaDokter === null && <p>Memuat daftar dokter...</p>}
            {semuaDokter?.length === 0 && <p>Belum ada dokter yang terdaftar. Silakan coba lagi nanti.</p>}

            {semuaDokter?.length > 0 && (
                <form onSubmit={kirim}>
                    <Langkah nomor="1" judul="Pilih poliklinik">
                        <div className="grid gap-2 sm:grid-cols-2">
                            {daftarPoli.map(([kode, nama]) => (
                                <Kartu key={kode} name="poli" value={kode} checked={poli === kode} onChange={pilihPoli}>
                                    <span className="font-bold">{nama}</span>
                                </Kartu>
                            ))}
                        </div>
                    </Langkah>

                    {poli && (
                        <Langkah nomor="2" judul="Pilih dokter">
                            <div className="grid gap-2">
                                {dokterDiPoli.map(d => (
                                    <Kartu key={d.id} name="dokter" value={String(d.id)} checked={idDokter === String(d.id)} onChange={pilihDokter} disabled={!d.jadwal?.length}>
                                        <span className="font-bold">{d.nama}</span> ({d.spesialis})
                                        <span className="block text-sm text-gray-700">
                                            {d.jadwal?.length ? d.jadwal.map(j => `${j.hari} ${jam(j.jam_mulai)}-${jam(j.jam_selesai)}`).join(', ') : 'Belum ada jadwal praktek'}
                                        </span>
                                    </Kartu>
                                ))}
                            </div>
                        </Langkah>
                    )}

                    {dokter && (
                        <Langkah nomor="3" judul="Pilih tanggal kunjungan" petunjuk={`Hari praktek ${dokter.nama} dalam ${RENTANG_HARI} hari ke depan.`}>
                            {!kuotaDokter ? <p>Memuat sisa kuota...</p> : kuotaDokter.size === 0 ? (
                                <p className="text-gray-700">Tidak ada jadwal praktek dalam {RENTANG_HARI} hari ke depan.</p>
                            ) : (
                                <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
                                    {[...kuotaDokter].map(([tanggal, k]) => {
                                        const tertutup = !k || k.sisa <= 0;
                                        return (
                                            <Kartu key={tanggal} name="tanggal" value={tanggal} checked={tgl === tanggal} onChange={setTgl} disabled={tertutup}>
                                                <span className="block font-bold">{singkat(tanggal)}</span>
                                                <span className={`block text-sm ${tertutup ? 'text-red-700' : 'text-gray-700'}`}>
                                                    {!k ? 'Info kuota gagal dimuat' : k.sisa <= 0 ? 'Kuota penuh' : `Sisa ${k.sisa} dari ${k.kuota}`}
                                                </span>
                                            </Kartu>
                                        );
                                    })}
                                </div>
                            )}
                        </Langkah>
                    )}

                    {bisaDaftar && (
                        <Langkah nomor="4" judul="Periksa dan konfirmasi">
                            <dl className="bg-white border border-gray-300 rounded p-3 mb-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                                <dt className="text-gray-700">Poliklinik</dt><dd className="font-bold">{dokter.poliklinik?.nama || dokter.id_poli}</dd>
                                <dt className="text-gray-700">Dokter</dt><dd className="font-bold">{dokter.nama}</dd>
                                <dt className="text-gray-700">Tanggal</dt><dd className="font-bold">{formatPanjang(tgl)}</dd>
                                <dt className="text-gray-700">Jam praktek</dt><dd className="font-bold">{info.jam_mulai}-{info.jam_selesai}</dd>
                            </dl>
                            <Tombol type="submit" className="w-full sm:w-auto" disabled={bekerja}>
                                {bekerja ? 'Memproses...' : 'Ambil Nomor Antrian'}
                            </Tombol>
                        </Langkah>
                    )}
                </form>
            )}
        </div>
    );
}

export default AmbilAntrian;
