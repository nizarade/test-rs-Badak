import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { pesanError } from './useAksi';

// Data per URL, jadi respons lama yang datang terlambat tidak menimpa URL yang baru.
// `data` bernilai null selama memuat; url null berarti tidak memuat apa pun.
function useData(url, intervalMs) {
    const [hasil, setHasil] = useState({});
    const [error, setError] = useState('');

    const muat = useCallback(() => {
        if (!url) return Promise.resolve();
        return api.get(url)
            .then(res => {
                setHasil(h => ({ ...h, [url]: res.data }));
                setError('');
            })
            .catch(err => {
                setHasil(h => ({ ...h, [url]: h[url] ?? [] }));
                setError(pesanError(err, 'Gagal memuat data.'));
            });
    }, [url]);

    useEffect(() => {
        muat();
        if (!intervalMs) return undefined;
        const timer = setInterval(muat, intervalMs);
        return () => clearInterval(timer);
    }, [muat, intervalMs]);

    return { data: url ? hasil[url] ?? null : null, error, muat };
}

export default useData;
