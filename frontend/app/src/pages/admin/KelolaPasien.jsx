import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useData from '../../hooks/useData';
import Pesan from '../../components/Pesan';
import Tombol from '../../components/Tombol';
import { Isian } from '../../components/Kolom';
import { Tabel, Td } from '../../components/Tabel';

function KelolaPasien() {
    const [cari, setCari] = useState('');
    const [query, setQuery] = useState('');
    const [halaman, setHalaman] = useState(1);

    // Pencarian dikirim setelah pengguna berhenti mengetik.
    useEffect(() => {
        const timer = setTimeout(() => {
            setQuery(cari.trim());
            setHalaman(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [cari]);

    const params = new URLSearchParams({ page: halaman });
    if (query) params.set('cari', query);
    const { data: hasil, error } = useData(`/pasien?${params}`);
    const pasien = hasil?.data ?? [];

    return (
        <div className="max-w-4xl mx-auto px-4 pb-10">
            <h2 className="text-xl font-bold my-4">Data Pasien</h2>
            <Pesan error={error} />

            <div className="max-w-md mb-4">
                <Isian id="cari" label="Cari nama atau No. RM" type="search" placeholder="Contoh: Budi atau RM-00012" value={cari} onChange={e => setCari(e.target.value)} />
            </div>

            {!hasil && <p>Memuat data pasien...</p>}
            {hasil && pasien.length === 0 && !error && <p className="text-gray-700">{query ? 'Tidak ada pasien yang cocok.' : 'Belum ada pasien terdaftar.'}</p>}

            {pasien.length > 0 && (
                <>
                    <Tabel judul="Daftar pasien" kolom={['No. RM', 'Nama', 'Tgl. Lahir', 'No. HP', 'Aksi']}>
                        {pasien.map(p => (
                            <tr key={p.no_rm}>
                                <Td>{p.no_rm}</Td>
                                <Td className="font-bold">{p.nama}</Td>
                                <Td>{p.tgl_lahir}</Td>
                                <Td>{p.no_hp}</Td>
                                <Td>
                                    <Link className="min-h-[44px] inline-flex items-center px-4 rounded border-2 border-teal-700 text-teal-800 font-bold" to={`/admin/pasien/${p.no_rm}`}>Detail</Link>
                                </Td>
                            </tr>
                        ))}
                    </Tabel>

                    <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
                        <Tombol jenis="batal" disabled={hasil.current_page <= 1} onClick={() => setHalaman(halaman - 1)}>Sebelumnya</Tombol>
                        <span>Halaman {hasil.current_page} dari {hasil.last_page} ({hasil.total} pasien)</span>
                        <Tombol jenis="batal" disabled={hasil.current_page >= hasil.last_page} onClick={() => setHalaman(halaman + 1)}>Berikutnya</Tombol>
                    </div>
                </>
            )}
        </div>
    );
}

export default KelolaPasien;
