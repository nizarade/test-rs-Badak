import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Public pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LayarAntrian from './pages/LayarAntrian';

// Pasien pages
import AmbilAntrian from './pages/pasien/AmbilAntrian';
import RiwayatKunjungan from './pages/pasien/RiwayatKunjungan';

// Admin pages
import KelolaPoliklinik from './pages/admin/KelolaPoliklinik';
import KelolaDokter from './pages/admin/KelolaDokter';
import KelolaJadwal from './pages/admin/KelolaJadwal';
import PanggilAntrian from './pages/admin/PanggilAntrian';
import KelolaPasien from './pages/admin/KelolaPasien';
import DetailPasien from './pages/admin/DetailPasien';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/antrian" element={<LayarAntrian />} />

          {/* Pasien Only */}
          <Route path="/ambil-antrian" element={
            <ProtectedRoute role="pasien">
              <AmbilAntrian />
            </ProtectedRoute>
          } />
          <Route path="/riwayat" element={
            <ProtectedRoute role="pasien">
              <RiwayatKunjungan />
            </ProtectedRoute>
          } />

          {/* Admin Only */}
          <Route path="/admin/poliklinik" element={
            <ProtectedRoute role="admin">
              <KelolaPoliklinik />
            </ProtectedRoute>
          } />
          <Route path="/admin/dokter" element={
            <ProtectedRoute role="admin">
              <KelolaDokter />
            </ProtectedRoute>
          } />
          <Route path="/admin/jadwal" element={
            <ProtectedRoute role="admin">
              <KelolaJadwal />
            </ProtectedRoute>
          } />
          <Route path="/admin/antrian" element={
            <ProtectedRoute role="admin">
              <PanggilAntrian />
            </ProtectedRoute>
          } />
          <Route path="/admin/pasien" element={
            <ProtectedRoute role="admin">
              <KelolaPasien />
            </ProtectedRoute>
          } />
          <Route path="/admin/pasien/:noRm" element={
            <ProtectedRoute role="admin">
              <DetailPasien />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
