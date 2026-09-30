import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import useData from '../../hooks/useData';
import useAksi from '../../hooks/useAksi';
import Pesan from '../../components/Pesan';
import Tombol from '../../components/Tombol';
import { Isian, Pilihan } from '../../components/Kolom';
import { Tabel, Td, AksiBaris } from '../../components/Tabel';
import { isian } from '../../components/gaya';

const HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const jam = (waktu) => waktu.slice(0, 5);
const kosong = { id_dokter: '', hari: 'Senin', jam_mulai: '08:00', jam_selesai: '12:00', kuota: '20' };

function KelolaJadwal() {
    const { data: jadwal, error: errorJadwal, muat } = useData('/jadwal-dokter');
    const { data: dokter, error: errorDokter } = useData('/dokter');
    const { pesan, error, bekerja, bersih, jalankan } = useAksi();
    const [form, setForm] = useState(kosong);
    const [edit, setEdit] = useState(null);
    const [filterDokter, setFilterDokter] = useState('');

    const ubahForm = (kolom) => (e) => setForm({ ...form, [kolom]: e.target.value });
    const ubahEdit = (kolom) => (e) => setEdit({ ...edit, [kolom]: e.target.value });

    // Hari yang sudah punya jadwal untuk seorang dokter, tidak termasuk jadwal yang sedang diubah.
    const hariTerpakai = (idDokter, kecuali) =>
        new Set((jadwal ?? []).filter(j => j.id_dokter === Number(idDokter) && j.id !== kecuali).map(j => j.hari));

    const pilihDokter = (e) => {
        const terpakai = hariTerpakai(e.target.value);
        setForm({ ...form, id_dokter: e.target.value, hari: HARI.find(h => !terpakai.has(h)) ?? form.hari });
    };

    const tambah = async (e) => {
        e.preventDefault();
        const nama = dokter.find(d => d.id === Number(form.id_dokter))?.nama;
        const ok = await jalankan(
            () => api.post('/jadwal-dokter', { ...form, kuota: Number(form.kuota) }),
            `Jadwal ${nama} hari ${form.hari} berhasil ditambahkan.`,
            'Gagal menambah jadwal.'
        );
        if (ok) {
            setForm({ ...form, id_dokter: '' });
            muat();
        }
    };

    const simpan = async (e) => {
        e.preventDefault();
        const { id, hari, jam_mulai, jam_selesai, kuota } = edit;
        const ok = await jalankan(
            () => api.put(`/jadwal-dokter/${id}`, { hari, jam_mulai, jam_selesai, kuota: Number(kuota) }),
            'Jadwal berhasil disimpan.',
            'Gagal menyimpan perubahan.'
        );
        if (ok) {
            setEdit(null);
            muat();
        }
    };

    const hapus = async (j) => {
        const teks = `Hapus jadwal ${j.dokter?.nama} hari ${j.hari}? Pasien tidak bisa lagi mengambil antrian pada hari itu. Antrian yang sudah diambil tidak ikut terhapus.`;
        if (!confirm(teks)) return;
        if (await jalankan(() => api.delete(`/jadwal-dokter/${j.id}`), `Jadwal ${j.dokter?.nama} hari ${j.hari} berhasil dihapus.`, 'Gagal menghapus jadwal.')) muat();
    };

    const mulaiUbah = (j) => {
        bersih();
        setEdit({ id: j.id, id_dokter: j.id_dokter, hari: j.hari, jam_mulai: jam(j.jam_mulai), jam_selesai: jam(j.jam_selesai), kuota: String(j.kuota) });
    };

    const urut = [...(jadwal ?? [])].sort(
        (a, b) => a.dokter?.nama.localeCompare(b.dokter?.nama) || HARI.indexOf(a.hari) - HARI.indexOf(b.hari)
    );
    const tampil = urut.filter(j => !filterDokter || j.id_dokter === Number(filterDokter));
    const idBerjadwal = new Set((jadwal ?? []).map(j => j.id_dokter));
    const dokterBerjadwal = (dokter ?? []).filter(d => idBerjadwal.has(d.id));
    const dokterTanpaJadwal = jadwal && dokter ? dokter.filter(d => !idBerjadwal.has(d.id)) : [];
    const terpakaiForm = hariTerpakai(form.id_dokter);

    return (
        <div className="max-w-5xl mx-auto px-4 pb-10">
            <h2 className="text-xl font-bold my-4">Kelola Jadwal Dokter</h2>
            <p className="text-gray-700 mb-4">Pasien hanya bisa mengambil antrian pada hari dan jam yang ada di jadwal, sebanyak kuota yang ditentukan.</p>

            <Pesan error={error || errorJadwal || errorDokter} sukses={pesan} />

            <form className="bg-white p-4 border border-gray-300 rounded mb-6" onSubmit={tambah}>
                <h3 className="text-lg font-bold mb-3">Tambah jadwal baru</h3>
                {dokter?.length === 0 && (
                    <p className="text-red-700 mb-3">
                        Belum ada dokter. Tambahkan dulu di halaman <Link className="underline font-bold" to="/admin/dokter">Dokter</Link>.
                    </p>
                )}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <Pilihan id="dokter" label="Dokter" value={form.id_dokter} onChange={pilihDokter} required>
                        <option value="">Pilih dokter</option>
                        {dokter?.map(d => <option key={d.id} value={d.id}>{d.nama} ({d.spesialis})</option>)}
                    </Pilihan>
                    <Pilihan id="hari" label="Hari" value={form.hari} onChange={ubahForm('hari')}>
                        {HARI.map(h => <option key={h} value={h} disabled={terpakaiForm.has(h)}>{h}{terpakaiForm.has(h) ? ' (sudah ada)' : ''}</option>)}
                    </Pilihan>
                    <Isian id="mulai" label="Jam mulai" type="time" value={form.jam_mulai} onChange={ubahForm('jam_mulai')} required />
                    <Isian id="selesai" label="Jam selesai" type="time" value={form.jam_selesai} onChange={ubahForm('jam_selesai')} required />
                    <Isian id="kuota" label="Kuota pasien" bantu="Maksimal per hari." type="number" min="1" max="100" value={form.kuota} onChange={ubahForm('kuota')} required />
                </div>
                <Tombol type="submit" className="mt-4" disabled={bekerja || dokter?.length === 0}>Tambah Jadwal</Tombol>
            </form>

            <div className="flex flex-wrap items-end justify-between gap-3 mb-2">
                <h3 className="text-lg font-bold">Daftar jadwal{jadwal ? ` (${tampil.length})` : ''}</h3>
                {dokterBerjadwal.length > 1 && (
                    <Pilihan id="filter-dokter" label="Tampilkan jadwal dokter" value={filterDokter} onChange={e => setFilterDokter(e.target.value)}>
                        <option value="">Semua dokter</option>
                        {dokterBerjadwal.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
                    </Pilihan>
                )}
            </div>

            {dokterTanpaJadwal.length > 0 && (
                <p className="text-sm border border-amber-400 bg-amber-50 text-amber-900 rounded p-3 mb-3">
                    Belum punya jadwal, jadi belum bisa dipilih pasien: <strong>{dokterTanpaJadwal.map(d => d.nama).join(', ')}</strong>.
                </p>
            )}

            {jadwal === null && <p>Memuat jadwal...</p>}
            {jadwal?.length === 0 && <p className="text-gray-700">Belum ada jadwal.</p>}
            {jadwal?.length > 0 && tampil.length === 0 && <p className="text-gray-700">Tidak ada jadwal untuk dokter ini.</p>}

            {tampil.length > 0 && (
                <Tabel judul="Daftar jadwal praktek dokter" kolom={['Dokter', 'Hari', 'Jam praktek', 'Kuota', 'Aksi']} lebar="min-w-[720px]">
                    {tampil.map(j => {
                        const diedit = edit?.id === j.id;
                        const terpakai = hariTerpakai(j.id_dokter, j.id);
                        return (
                            <tr key={j.id}>
                                <Td className="font-bold">
                                    {j.dokter?.nama}
                                    <span className="block text-sm font-normal text-gray-700">{j.dokter?.poliklinik?.nama}</span>
                                    {diedit && <form id="form-edit" onSubmit={simpan} />}
                                </Td>
                                <Td>
                                    {diedit ? (
                                        <select className={isian} form="form-edit" aria-label="Hari" value={edit.hari} onChange={ubahEdit('hari')}>
                                            {HARI.map(h => <option key={h} value={h} disabled={terpakai.has(h)}>{h}{terpakai.has(h) ? ' (sudah ada)' : ''}</option>)}
                                        </select>
                                    ) : j.hari}
                                </Td>
                                <Td>
                                    {diedit ? (
                                        <div className="flex items-center gap-2">
                                            <input className={isian} form="form-edit" type="time" aria-label="Jam mulai" value={edit.jam_mulai} onChange={ubahEdit('jam_mulai')} required autoFocus />
                                            <span aria-hidden="true">sampai</span>
                                            <input className={isian} form="form-edit" type="time" aria-label="Jam selesai" value={edit.jam_selesai} onChange={ubahEdit('jam_selesai')} required />
                                        </div>
                                    ) : `${jam(j.jam_mulai)} sampai ${jam(j.jam_selesai)}`}
                                </Td>
                                <Td>
                                    {diedit ? (
                                        <input className={`${isian} max-w-[110px]`} form="form-edit" type="number" min="1" max="100" aria-label="Kuota pasien" value={edit.kuota} onChange={ubahEdit('kuota')} required />
                                    ) : `${j.kuota} pasien`}
                                </Td>
                                <Td>
                                    <AksiBaris
                                        diedit={diedit}
                                        formId="form-edit"
                                        bekerja={bekerja}
                                        onUbah={() => mulaiUbah(j)}
                                        onHapus={() => hapus(j)}
                                        onBatal={() => setEdit(null)}
                                    />
                                </Td>
                            </tr>
                        );
                    })}
                </Tabel>
            )}
        </div>
    );
}

export default KelolaJadwal;
