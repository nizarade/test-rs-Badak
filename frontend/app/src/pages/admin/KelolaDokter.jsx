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

const kosong = { nama: '', spesialis: '', id_poli: '' };

function KelolaDokter() {
    const { data: dokter, error: errorDokter, muat } = useData('/dokter');
    const { data: poli, error: errorPoli } = useData('/poliklinik');
    const { pesan, error, bekerja, bersih, jalankan } = useAksi();
    const [form, setForm] = useState(kosong);
    const [edit, setEdit] = useState(null);
    const [filterPoli, setFilterPoli] = useState('');

    const ubahForm = (kolom) => (e) => setForm({ ...form, [kolom]: e.target.value });
    const ubahEdit = (kolom) => (e) => setEdit({ ...edit, [kolom]: e.target.value });

    const tambah = async (e) => {
        e.preventDefault();
        const nama = form.nama.trim();
        const ok = await jalankan(
            () => api.post('/dokter', { ...form, nama, spesialis: form.spesialis.trim() }),
            `Dokter ${nama} berhasil ditambahkan. Atur jadwal prakteknya di halaman Jadwal agar pasien bisa memilihnya.`,
            'Gagal menambah dokter.'
        );
        if (ok) {
            setForm(kosong);
            muat();
        }
    };

    const simpan = async (e) => {
        e.preventDefault();
        const { id, nama, spesialis, id_poli } = edit;
        const ok = await jalankan(
            () => api.put(`/dokter/${id}`, { nama: nama.trim(), spesialis: spesialis.trim(), id_poli }),
            `Data dokter ${nama.trim()} berhasil disimpan.`,
            'Gagal menyimpan perubahan.'
        );
        if (ok) {
            setEdit(null);
            muat();
        }
    };

    const hapus = async (d) => {
        if (!confirm(`Hapus ${d.nama}? Jadwal prakteknya ikut terhapus dan tindakan ini tidak bisa dibatalkan.`)) return;
        if (await jalankan(() => api.delete(`/dokter/${d.id}`), `Dokter ${d.nama} berhasil dihapus.`, 'Gagal menghapus dokter.')) muat();
    };

    const mulaiUbah = (d) => {
        bersih();
        setEdit({ id: d.id, nama: d.nama, spesialis: d.spesialis, id_poli: d.id_poli });
    };

    const tampil = dokter?.filter(d => !filterPoli || d.id_poli === filterPoli) ?? [];
    const daftarPoli = poli ?? [];
    const opsiPoli = daftarPoli.map(p => <option key={p.kode} value={p.kode}>{p.nama}</option>);

    return (
        <div className="max-w-5xl mx-auto px-4 pb-10">
            <h2 className="text-xl font-bold my-4">Kelola Dokter</h2>
            <p className="text-gray-700 mb-4">Tambahkan dokter dan tentukan poliklinik tempatnya praktek. Hari dan jam praktek diatur di halaman Jadwal.</p>

            <Pesan error={error || errorDokter || errorPoli} sukses={pesan} />

            <form className="bg-white p-4 border border-gray-300 rounded mb-6" onSubmit={tambah}>
                <h3 className="text-lg font-bold mb-3">Tambah dokter baru</h3>
                {poli?.length === 0 && (
                    <p className="text-red-700 mb-3">
                        Belum ada poliklinik. Buat dulu di halaman <Link className="underline font-bold" to="/admin/poliklinik">Poliklinik</Link>.
                    </p>
                )}
                <div className="grid gap-4 sm:grid-cols-3">
                    <Isian id="nama" label="Nama dokter" placeholder="Contoh: dr. Budi" value={form.nama} onChange={ubahForm('nama')} maxLength={255} required />
                    <Isian id="spesialis" label="Spesialisasi" placeholder="Contoh: Gigi" value={form.spesialis} onChange={ubahForm('spesialis')} maxLength={255} required />
                    <Pilihan id="poli" label="Poliklinik" value={form.id_poli} onChange={ubahForm('id_poli')} required>
                        <option value="">Pilih poliklinik</option>
                        {opsiPoli}
                    </Pilihan>
                </div>
                <Tombol type="submit" className="mt-4" disabled={bekerja || poli?.length === 0}>Tambah Dokter</Tombol>
            </form>

            <div className="flex flex-wrap items-end justify-between gap-3 mb-2">
                <h3 className="text-lg font-bold">Daftar dokter{dokter ? ` (${tampil.length})` : ''}</h3>
                {daftarPoli.length > 1 && (
                    <Pilihan id="filter-poli" label="Tampilkan dokter dari" value={filterPoli} onChange={e => setFilterPoli(e.target.value)}>
                        <option value="">Semua poliklinik</option>
                        {opsiPoli}
                    </Pilihan>
                )}
            </div>

            {dokter === null && <p>Memuat data dokter...</p>}
            {dokter?.length === 0 && <p className="text-gray-700">Belum ada dokter.</p>}
            {dokter?.length > 0 && tampil.length === 0 && <p className="text-gray-700">Tidak ada dokter di poliklinik ini.</p>}

            {tampil.length > 0 && (
                <Tabel judul="Daftar dokter" kolom={['Nama', 'Spesialis', 'Poliklinik', 'Aksi']}>
                    {tampil.map(d => {
                        const diedit = edit?.id === d.id;
                        const formId = 'form-edit';
                        return (
                            <tr key={d.id}>
                                <Td className="font-bold">
                                    {diedit ? (
                                        <form id={formId} onSubmit={simpan}>
                                            <input className={isian} aria-label="Nama dokter" value={edit.nama} onChange={ubahEdit('nama')} onKeyDown={e => e.key === 'Escape' && setEdit(null)} maxLength={255} required autoFocus />
                                        </form>
                                    ) : d.nama}
                                </Td>
                                <Td>
                                    {diedit ? (
                                        <input className={isian} form={formId} aria-label="Spesialisasi" value={edit.spesialis} onChange={ubahEdit('spesialis')} maxLength={255} required />
                                    ) : d.spesialis}
                                </Td>
                                <Td>
                                    {diedit ? (
                                        <select className={isian} form={formId} aria-label="Poliklinik" value={edit.id_poli} onChange={ubahEdit('id_poli')} required>{opsiPoli}</select>
                                    ) : d.poliklinik?.nama || d.id_poli}
                                </Td>
                                <Td>
                                    <AksiBaris
                                        diedit={diedit}
                                        formId={formId}
                                        bekerja={bekerja}
                                        bolehSimpan={edit?.nama.trim() !== '' && edit?.spesialis.trim() !== ''}
                                        onUbah={() => mulaiUbah(d)}
                                        onHapus={() => hapus(d)}
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

export default KelolaDokter;
