import Tombol from './Tombol';
import { sel } from './gaya';

export function Tabel({ judul, kolom, lebar = 'min-w-[640px]', children }) {
    return (
        <div className="overflow-x-auto">
            <table className={`w-full bg-white border-collapse ${lebar}`}>
                <caption className="sr-only">{judul}</caption>
                <thead>
                    <tr>
                        {kolom.map(k => (
                            <th key={k} scope="col" className={`${sel} text-left bg-gray-100`}>{k}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>{children}</tbody>
            </table>
        </div>
    );
}

export function Td({ className = '', ...props }) {
    return <td className={`${sel} ${className}`} {...props} />;
}

// Key berbeda memaksa React membuat tombol baru; tanpa itu "Ubah" berubah jadi "Simpan"
// di tengah klik dan formulir langsung terkirim.
export function AksiBaris({ diedit, formId, bekerja, bolehSimpan = true, hapusNonaktif = false, onUbah, onHapus, onBatal }) {
    return (
        <div className="flex flex-wrap gap-2">
            {diedit ? (
                <>
                    <Tombol key="simpan" type="submit" form={formId} disabled={bekerja || !bolehSimpan}>Simpan</Tombol>
                    <Tombol key="batal" jenis="batal" onClick={onBatal} disabled={bekerja}>Batal</Tombol>
                </>
            ) : (
                <>
                    <Tombol key="ubah" jenis="ubah" onClick={onUbah} disabled={bekerja}>Ubah</Tombol>
                    <Tombol key="hapus" jenis="hapus" onClick={onHapus} disabled={bekerja || hapusNonaktif}>Hapus</Tombol>
                </>
            )}
        </div>
    );
}
