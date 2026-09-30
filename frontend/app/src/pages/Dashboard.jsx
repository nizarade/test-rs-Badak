import { useAuth } from '../context/AuthContext';
import DashboardAdmin from './admin/DashboardAdmin';
import BerandaPublik from './BerandaPublik';

function Beranda() {
    const { user, loading } = useAuth();

    if (loading) return null;
    return user?.role === 'admin' ? <DashboardAdmin /> : <BerandaPublik />;
}

export default Beranda;
