import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const linkClass = ({ isActive }) =>
    'py-1 border-b-2 hover:border-white ' + (isActive ? 'border-white font-bold' : 'border-transparent');

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="flex items-center gap-5 px-5 py-3 bg-teal-600 text-white mb-5">
            <strong className="text-lg">Antrian Poliklinik</strong>
            <NavLink to="/" end className={linkClass}>Beranda</NavLink>

            {!user && (
                <>
                    <NavLink to="/login" className={linkClass}>Login</NavLink>
                    <NavLink to="/register" className={linkClass}>Register Pasien</NavLink>
                </>
            )}

            {user && user.role === 'pasien' && (
                <>
                    <NavLink to="/ambil-antrian" className={linkClass}>Ambil Antrian</NavLink>
                    <NavLink to="/riwayat" className={linkClass}>Riwayat Saya</NavLink>
                </>
            )}

            {user && user.role === 'admin' && (
                <>
                    <NavLink to="/admin/antrian" className={linkClass}>Kelola Antrian</NavLink>
                    <NavLink to="/admin/poliklinik" className={linkClass}>Poliklinik</NavLink>
                    <NavLink to="/admin/dokter" className={linkClass}>Dokter</NavLink>
                    <NavLink to="/admin/jadwal" className={linkClass}>Jadwal</NavLink>
                </>
            )}

            {user && (
                <div className="ml-auto flex items-center gap-3">
                    <span>Halo, {user.name} ({user.role})</span>
                    <button className="px-3 py-1 rounded bg-white text-teal-700 font-bold" onClick={handleLogout}>Logout</button>
                </div>
            )}
        </nav>
    );
}

export default Navbar;
