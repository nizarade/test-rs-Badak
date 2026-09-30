import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const data = await login(email, password);
            if (data.user.role === 'admin') {
                navigate('/');
            } else {
                navigate('/ambil-antrian');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Email atau password salah.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-5 ">
            <div className="w-full max-w-md  border border-gray-300 rounded bg-teal-600">
                <h2 className="text-xl font-bold text-white my-4 text-center">Login</h2>

                <form className="bg-white p-4" onSubmit={handleSubmit}>
                    {error && <div className="text-red-600 mb-3">{error}</div>}
                    <div className="mb-3">
                        <label className="block font-bold mb-1 text-sm">Email</label>
                        <input className='border border-gray-300 w-full'
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="block font-bold mb-1 text-sm">Password</label>
                        <input
                            className='border border-gray-300 w-full'
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="px-3 py-1 rounded text-white bg-teal-600">Masuk</button>
                </form>
            </div>
        </div>
    );
}

export default Login;
