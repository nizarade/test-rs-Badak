import { useState } from 'react';
import api from '../../api/axios';
import useData from '../../hooks/useData';
import useAksi from '../../hooks/useAksi';
import Pesan from '../../components/Pesan';
import Tombol from '../../components/Tombol';
import Chip from '../../components/Chip';
import { tanggalLokal, geserHari, formatPanjang } from '../../utils/tanggal';

const urutNomor = (a, b) => a.no_antrian - b.no_antrian;

const cocok = (k, kata) =>
    !kata ||
    k.pasien?.nama.toLowerCase().includes(kata) ||
    k.no_rm.toLowerCase().includes(kata) ||
    String(k.no_antrian) === kata.replace('#', '');

function Baris({ k, catatan, children }) {
    return (
        <li className="p-3 flex flex-wrap items-center justify-between gap-3">
            <div>
                <span className="text-lg font-bold mr-3">No. {k.no_antrian}</span>
                {k.pasien?.nama}
                <span className="block text-sm text-gray-700">{k.no_rm}{catatan}</span>
            </div>
            <div className="flex flex-wrap gap-2">{children}</div>
        </li>
    );
}

function PanelDokter({ nama, poli, items, kata, bekerja, onAksi }) {
    const per = (...status) => items.filter(k => status.includes(k.status)).sort(urutNomor);
    const menunggu = per('menunggu');
    const dipanggil = per('dipanggil').filter(k => cocok(k, kata));
    const riwayat = per('selesai', 'batal').filter(k => cocok(k, kata));
    const menungguTampil = menunggu.filter(k => cocok(k, kata));
    const berikutnya = menunggu[0];

    if (kata && dipanggil.length + riwayat.length + menungguTampil.length === 0) return null;

    return (
        <section className="bg-white border-2 border-gray-300 rounded mb-5">
            <header className="p-4 border-b border-gray-300 bg-gray-50 rounded-t">
                <h3 className="text-lg font-bold">{nama}</h3>
                <p className="text-gray-700">
                    {poli}. Menunggu {menunggu.length} orang, selesai diperiksa {items.filter(k => k.status === 'selesai').length} orang.
                </p>
            </header>

            <div className="p-4">
                {dipanggil.length > 0 && (
                    <div className="mb-4">
                        <h4 className="font-bold text-blue-800 mb-2">Sedang dipanggil</h4>
                        <ul className="border-2 border-blue-800 rounded divide-y divide-gray-200">
                            {dipanggil.map(k => (
                                <Baris key={k.id} k={k}>
                                    <Tombol jenis="selesai" disabled={bekerja} onClick={() => onAksi(k, 'selesai')}>Selesai diperiksa</Tombol>
                                    <Tombol jenis="hapus" disabled={bekerja} onClick={() => onAksi(k, 'batal')}>Batalkan antrian</Tombol>
                                </Baris>
                            ))}
                        </ul>
                    </div>
                )}

                {berikutnya ? (
                    <div className="mb-4">
                        <Tombol className="w-full sm:w-auto text-lg" disabled={bekerja} onClick={() => onAksi(berikutnya, 'panggil')}>
                            Panggil Pasien Berikutnya (No. {berikutnya.no_antrian})
                        </Tombol>
                        <p className="text-sm text-gray-700 mt-1">{berikutnya.pasien?.nama}</p>
                    </div>
                ) : dipanggil.length === 0 && (
                    <p className="font-bold text-green-800">Semua antrian dokter ini sudah selesai.</p>
                )}

                {menungguTampil.length > 0 && (
                    <>
                        <h4 className="font-bold mb-2">Menunggu dipanggil</h4>
                        <ul className="border border-gray-300 rounded divide-y divide-gray-200">
                            {menungguTampil.map(k => (
                                <Baris key={k.id} k={k} catatan={k.id === berikutnya.id ? ' · Giliran berikutnya' : ''}>
                                    <Tombol jenis="ubah" disabled={bekerja} onClick={() => onAksi(k, 'panggil')}>Panggil</Tombol>
                                    <Tombol jenis="hapus" disabled={bekerja} onClick={() => onAksi(k, 'batal')}>Batalkan antrian</Tombol>
                                </Baris>
                            ))}
                        </ul>
                    </>
                )}

                {riwayat.length > 0 && (
                    <details className="mt-3">
                        <summary className="cursor-pointer font-bold min-h-[44px] flex items-center">
                            Sudah selesai atau dibatalkan ({riwayat.length})
                        </summary>
                        <ul className="border border-gray-300 rounded divide-y divide-gray-200">
                            {riwayat.map(k => (
                                <li key={k.id} className="p-3 flex flex-wrap justify-between gap-2">
                                    <span><strong className="mr-2">No. {k.no_antrian}</strong>{k.pasien?.nama}</span>
                                    <span className={k.status === 'selesai' ? 'font-bold text-green-800' : 'font-bold text-red-800'}>
                                        {k.status === 'selesai' ? 'Selesai diperiksa' : 'Dibatalkan'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </details>
                )}
            </div>
        </section>
    );
}

function PanggilAntrian() {
    const [tanggal, setTanggal] = useState(tanggalLokal());
    const [cari, setCari] = useState('');
    const { data: antrian, error: errorMuat, muat } = useData(`/kunjungan?tanggal=${tanggal}`, 15000);
    const { error, bekerja, jalankan } = useAksi();

    const aksi = async (k, jenis) => {
        if (jenis === 'batal' && !confirm(`Batalkan antrian nomor ${k.no_antrian} atas nama ${k.pasien?.nama}?`)) return;
        if (await jalankan(() => api.patch(`/kunjungan/${k.id}/${jenis}`), '', 'Gagal mengubah status antrian.')) muat();
    };

    const perDokter = {};
    antrian?.forEach(k => {
        perDokter[k.id_dokter] ??= { nama: k.dokter?.nama, poli: k.dokter?.poliklinik?.nama, items: [] };
        perDokter[k.id_dokter].items.push(k);
    });
    const daftar = Object.entries(perDokter).sort((a, b) => a[1].nama.localeCompare(b[1].nama));
    const kata = cari.trim().toLowerCase();
    const adaHasil = antrian?.some(k => cocok(k, kata));

    return (
        <div className="max-w-4xl mx-auto px-4 pb-10">
            <h2 className="text-xl font-bold my-4">Kelola & Panggil Antrian</h2>
            <p className="text-gray-700 mb-4">
                Klik <strong>Panggil Pasien Berikutnya</strong> untuk memanggil nomor selanjutnya, lalu <strong>Selesai diperiksa</strong> setelah pasien selesai.
            </p>

            <Pesan error={error || errorMuat} />

            <div className="flex flex-wrap items-end gap-x-6 gap-y-3 mb-2">
                <div>
                    <span className="block font-bold mb-1 text-sm">Tanggal</span>
                    <div className="flex flex-wrap gap-2">
                        <Chip aktif={tanggal === geserHari(0)} onClick={() => setTanggal(geserHari(0))}>Hari ini</Chip>
                        <Chip aktif={tanggal === geserHari(1)} onClick={() => setTanggal(geserHari(1))}>Besok</Chip>
                        <input
                            type="date"
                            aria-label="Pilih tanggal lain"
                            className="border-2 border-gray-300 rounded px-2 min-h-[44px] bg-white"
                            value={tanggal}
                            onChange={e => e.target.value && setTanggal(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-1 min-w-[220px]">
                    <label htmlFor="cari" className="block font-bold mb-1 text-sm">Cari pasien</label>
                    <input
                        id="cari"
                        type="search"
                        className="w-full border-2 border-gray-300 rounded px-2 min-h-[44px] bg-white"
                        placeholder="Ketik nama atau No. RM"
                        value={cari}
                        onChange={e => setCari(e.target.value)}
                    />
                </div>
            </div>

            <p className="text-lg font-bold my-4">Antrian {formatPanjang(tanggal)}</p>

            {antrian === null && <p>Memuat antrian...</p>}
            {antrian?.length === 0 && <p>Belum ada antrian pada tanggal ini.</p>}

            {daftar.map(([id, d]) => (
                <PanelDokter key={id} nama={d.nama} poli={d.poli} items={d.items} kata={kata} bekerja={bekerja} onAksi={aksi} />
            ))}

            {kata && antrian?.length > 0 && (
                <p className="text-gray-700">
                    {adaHasil ? `Hasil pencarian untuk "${cari.trim()}".` : `Tidak ada pasien yang cocok dengan "${cari.trim()}".`}{' '}
                    <button type="button" className="underline text-teal-800 font-bold" onClick={() => setCari('')}>Hapus pencarian</button>
                </p>
            )}
        </div>
    );
}

export default PanggilAntrian;
