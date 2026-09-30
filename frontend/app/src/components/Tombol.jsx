const jenisTombol = {
    utama: 'text-white bg-teal-700 hover:bg-teal-800',
    selesai: 'text-white bg-green-700 hover:bg-green-800',
    ubah: 'border-2 border-teal-700 text-teal-800 bg-white',
    hapus: 'border-2 border-red-700 text-red-800 bg-white',
    batal: 'border-2 border-gray-400 text-gray-900 bg-white',
};

function Tombol({ jenis = 'utama', className = '', ...props }) {
    return (
        <button
            type="button"
            className={`min-h-[44px] px-4 rounded font-bold disabled:opacity-50 disabled:cursor-not-allowed ${jenisTombol[jenis]} ${className}`}
            {...props}
        />
    );
}

export default Tombol;
