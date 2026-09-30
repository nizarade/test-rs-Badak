import { useState } from 'react';
import api from '../../api/axios';
import useData from '../../hooks/useData';
import useAksi from '../../hooks/useAksi';
import Pesan from '../../components/Pesan';
import Tombol from '../../components/Tombol';
import { Isian } from '../../components/Kolom';
import { Tabel, Td, AksiBaris } from '../../components/Tabel';
import { isian } from '../../components/gaya';

const kosong = { kode: '', nama: '' };

function KelolaPoliklinik() {
    const { data: daftar, error: errorMuat, muat } = useData('/poliklinik');
    const { pesan, error, bekerja, bersih, jalankan } = useAksi();
    const [form, setForm] = useState(kosong);
    const [edit, setEdit] = useState(null);

    const tambah = async (e) => {
        e.preventDefault();
        const nama = form.nama.trim();
        const ok = await jalankan(() => api.post('/poliklinik', { ...form, nama }), `Poliklinik ${nama} berhasil ditambahkan.`, 'Gagal menambah poliklinik.');
        if (ok) {
            setForm(kosong);
            muat();
        }
    };

    const simpan = async (e) => {
        e.preventDefault();
        const nama = edit.nama.trim();
        const ok = await jalankan(() => api.put(`/poliklinik/${edit.kode}`, { nama }), `Nama poliklinik ${edit.kode} diubah menjadi ${nama}.`, 'Gagal menyimpan perubahan.');
        if (ok) {
            setEdit(null);
            muat();
        }
    };

    const hapus = async (p) => {
        if (!confirm(`Hapus poliklinik ${p.nama}? Tindakan ini tidak bisa dibatalkan.`)) return;
        if (await jalankan(() => api.delete(`/poliklinik/${p.kode}`), `Poliklinik ${p.nama} berhasil dihapus.`, 'Gagal menghapus poliklinik.')) muat();
    };

    const mulaiUbah = (p) => {
        bersih();
        setEdit({ kode: p.kode, nama: p.nama });
    };

    const adaYangTerkunci = daftar?.some(p => p.dokter?.length > 0);

    return (
        <div className="max-w-4xl mx-auto px-4 pb-10">
            <h2 className="text-xl font-bold my-4">Kelola Poliklinik</h2>
            <p className="text-gray-700 mb-4">Poliklinik adalah unit layanan tempat dokter praktek, misalnya Poli Umum atau Poli Gigi.</p>

            <Pesan error={error || errorMuat} sukses={pesan} />

            <form className="bg-white p-4 border border-gray-300 rounded mb-6" onSubmit={tambah}>
                <h3 className="text-lg font-bold mb-3">Tambah poliklinik baru</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Isian id="nama" label="Nama poliklinik" placeholder="Contoh: Poli Gigi" value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} maxLength={255} required />
                    <Isian
                        id="kode"
                        label="Kode singkat"
                        placeholder="Contoh: GIGI"
                        bantu="Huruf besar atau angka, tanpa spasi. Tidak bisa diubah setelah disimpan."
                        value={form.kode}
                        onChange={e => setForm({ ...form, kode: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '') })}
                        maxLength={20}
                        required
                    />
                </div>
                <Tombol type="submit" className="mt-4" disabled={bekerja}>Tambah Poliklinik</Tombol>
            </form>

            <h3 className="text-lg font-bold mb-2">Daftar poliklinik{daftar ? ` (${daftar.length})` : ''}</h3>

            {daftar === null && <p>Memuat data poliklinik...</p>}
            {daftar?.length === 0 && <p className="text-gray-700">Belum ada poliklinik.</p>}

            {daftar?.length > 0 && (
                <>
                    <Tabel judul="Daftar poliklinik" kolom={['Nama', 'Kode', 'Dokter', 'Aksi']} lebar="min-w-[560px]">
                        {daftar.map(p => {
                            const diedit = edit?.kode === p.kode;
                            const jumlahDokter = p.dokter?.length ?? 0;
                            return (
                                <tr key={p.kode}>
                                    <Td className="font-bold">
                                        {diedit ? (
                                            <form id="form-edit" onSubmit={simpan}>
                                                <input className={isian} aria-label="Nama baru" value={edit.nama} onChange={e => setEdit({ ...edit, nama: e.target.value })} onKeyDown={e => e.key === 'Escape' && setEdit(null)} maxLength={255} required autoFocus />
                                            </form>
                                        ) : p.nama}
                                    </Td>
                                    <Td>{p.kode}</Td>
                                    <Td>{jumlahDokter ? `${jumlahDokter} dokter` : '-'}</Td>
                                    <Td>
                                        <AksiBaris
                                            diedit={diedit}
                                            formId="form-edit"
                                            bekerja={bekerja}
                                            bolehSimpan={edit?.nama.trim() !== ''}
                                            hapusNonaktif={jumlahDokter > 0}
                                            onUbah={() => mulaiUbah(p)}
                                            onHapus={() => hapus(p)}
                                            onBatal={() => setEdit(null)}
                                        />
                                    </Td>
                                </tr>
                            );
                        })}
                    </Tabel>
                    {adaYangTerkunci && (
                        <p className="text-sm text-gray-700 mt-2">
                            Poliklinik yang masih punya dokter tidak bisa dihapus. Pindahkan atau hapus dokternya dulu di halaman Dokter.
                        </p>
                    )}
                </>
            )}
        </div>
    );
}

export default KelolaPoliklinik;
