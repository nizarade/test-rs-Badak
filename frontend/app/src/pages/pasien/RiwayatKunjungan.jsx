import api from '../../api/axios';
import useData from '../../hooks/useData';
import useAksi from '../../hooks/useAksi';
import Pesan from '../../components/Pesan';
import Tombol from '../../components/Tombol';
import { Tabel, Td } from '../../components/Tabel';

function RiwayatKunjungan() {
    const { data: riwayat, error: errorMuat, muat } = useData('/kunjungan/saya');
    const { pesan, error, bekerja, jalankan } = useAksi();

    const batalkan = async (k) => {
        if (!confirm(`Batalkan antrian nomor ${k.no_antrian}?`)) return;
        if (await jalankan(() => api.patch(`/kunjungan/${k.id}/batal-saya`), 'Antrian berhasil dibatalkan.', 'Gagal membatalkan antrian.')) muat();
    };

    return (
        <div className="max-w-4xl mx-auto px-4 pb-10">
            <h2 className="text-xl font-bold my-4">Riwayat Kunjungan Saya</h2>
            <Pesan error={error || errorMuat} sukses={pesan} />

            {riwayat === null && <p>Memuat riwayat...</p>}
            {riwayat?.length === 0 && !errorMuat && <p className="text-gray-700">Belum ada riwayat kunjungan.</p>}

            {riwayat?.length > 0 && (
                <Tabel judul="Riwayat kunjungan" kolom={['Tanggal', 'No. Antrian', 'Dokter', 'Poliklinik', 'Status', 'Aksi']}>
                    {riwayat.map(k => (
                        <tr key={k.id}>
                            <Td>{k.tgl}</Td>
                            <Td className="font-bold">#{k.no_antrian}</Td>
                            <Td>{k.dokter?.nama}</Td>
                            <Td>{k.dokter?.poliklinik?.nama}</Td>
                            <Td>{k.status}</Td>
                            <Td>
                                {k.status === 'menunggu' && <Tombol jenis="hapus" disabled={bekerja} onClick={() => batalkan(k)}>Batalkan</Tombol>}
                            </Td>
                        </tr>
                    ))}
                </Tabel>
            )}
        </div>
    );
}

export default RiwayatKunjungan;
