function Chip({ aktif, ...props }) {
    const gaya = aktif
        ? 'border-teal-700 bg-teal-700 text-white'
        : 'border-gray-300 bg-white text-gray-900 hover:border-teal-700';

    return <button type="button" aria-pressed={aktif} className={`min-h-[44px] px-4 rounded border-2 font-bold ${gaya}`} {...props} />;
}

export default Chip;
