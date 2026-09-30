import { Link, useParams } from 'react-router-dom';
import useData from '../../hooks/useData';
import Pesan from '../../components/Pesan';
import { Tabel, Td } from '../../components/Tabel';

function DetailPasien() {
    const { noRm } = useParams();
    const { data, error } = useData(`/pasien/${noRm}`);
    const pasien = data?.no_rm ? data : null;

    const riwayat = [...(pasien?.kunjungan ?? [])].sort((a, b) => b.tgl.localeCompare(a.tgl) || b.no_antrian - a.no_antrian);

    return (
        <div className="max-w-4xl mx-auto px-4 pb-10">
            <Link className="text-teal-800 underline text-sm" to="/admin/pasien">Kembali ke daftar pasien</Link>
            <h2 className="text-xl font-bold my-4">Detail Pasien</h2>

            <Pesan error={error} />
            {!data && <p>Memuat data pasien...</p>}

            {pasien && (
                <>
                    <dl className="bg-white p-4 border border-gray-300 rounded max-w-md mb-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                        <dt className="text-gray-700">No. RM</dt><dd className="font-bold">{pasien.no_rm}</dd>
                        <dt className="text-gray-700">Nama</dt><dd className="font-bold">{pasien.nama}</dd>
                        <dt className="text-gray-700">Tanggal lahir</dt><dd>{pasien.tgl_lahir}</dd>
                        <dt className="text-gray-700">Alamat</dt><dd>{pasien.alamat}</dd>
                        <dt className="text-gray-700">No. HP</dt><dd>{pasien.no_hp}</dd>
                        <dt className="text-gray-700">Email</dt><dd>{pasien.user?.email || '-'}</dd>
                    </dl>

                    <h3 className="text-lg font-bold mb-2">Riwayat kunjungan</h3>
                    {riwayat.length === 0 ? <p className="text-gray-700">Belum ada riwayat kunjungan.</p> : (
                        <Tabel judul="Riwayat kunjungan" kolom={['Tanggal', 'No. Antrian', 'Dokter', 'Poliklinik', 'Status']}>
                            {riwayat.map(k => (
                                <tr key={k.id}>
                                    <Td>{k.tgl}</Td>
                                    <Td className="font-bold">#{k.no_antrian}</Td>
                                    <Td>{k.dokter?.nama}</Td>
                                    <Td>{k.dokter?.poliklinik?.nama}</Td>
                                    <Td>{k.status}</Td>
                                </tr>
                            ))}
                        </Tabel>
                    )}
                </>
            )}
        </div>
    );
}

export default DetailPasien;
