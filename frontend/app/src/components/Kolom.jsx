import { isian } from './gaya';

function Kolom({ id, label, bantu, children }) {
    return (
        <div>
            <label htmlFor={id} className="block font-bold mb-1">{label}</label>
            {children}
            {bantu && <p className="text-sm text-gray-700 mt-1">{bantu}</p>}
        </div>
    );
}

export function Isian({ id, label, bantu, ...props }) {
    return (
        <Kolom id={id} label={label} bantu={bantu}>
            <input id={id} className={isian} {...props} />
        </Kolom>
    );
}

export function Pilihan({ id, label, bantu, children, ...props }) {
    return (
        <Kolom id={id} label={label} bantu={bantu}>
            <select id={id} className={isian} {...props}>{children}</select>
        </Kolom>
    );
}
