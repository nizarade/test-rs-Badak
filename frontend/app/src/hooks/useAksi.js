import { useState } from 'react';

export const pesanError = (err, cadangan) => {
    if (err.response?.status === 404) return 'Data tidak ditemukan.';
    const errors = err.response?.data?.errors;
    return (errors && Object.values(errors)[0]?.[0]) || err.response?.data?.message || cadangan;
};

// Membungkus satu aksi (simpan/hapus/ubah): mengatur pesan, error, dan status bekerja.
function useAksi() {
    const [pesan, setPesan] = useState('');
    const [error, setError] = useState('');
    const [bekerja, setBekerja] = useState(false);

    const bersih = () => {
        setPesan('');
        setError('');
    };

    const jalankan = async (aksi, sukses, gagal) => {
        bersih();
        setBekerja(true);
        try {
            await aksi();
            setPesan(sukses);
            return true;
        } catch (err) {
            setError(pesanError(err, gagal));
            return false;
        } finally {
            setBekerja(false);
        }
    };

    return { pesan, error, bekerja, bersih, jalankan };
}

export default useAksi;
