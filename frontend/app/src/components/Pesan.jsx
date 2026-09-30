function Pesan({ error, sukses }) {
    return (
        <>
            {error && <div role="alert" className="text-red-700 border border-red-300 bg-red-50 rounded p-3 mb-4">{error}</div>}
            {sukses && <div role="status" className="text-green-900 border border-green-300 bg-green-50 rounded p-3 mb-4">{sukses}</div>}
        </>
    );
}

export default Pesan;
