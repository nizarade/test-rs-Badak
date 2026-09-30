const pad = (n) => String(n).padStart(2, '0');

export const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const tanggalLokal = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const geserHari = (n) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return tanggalLokal(d);
};

export const dariTanggal = (tgl) => new Date(`${tgl}T00:00`);

export const formatPanjang = (tgl) =>
    dariTanggal(tgl).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

export const jam = (waktu) => waktu.slice(0, 5);
